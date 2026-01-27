import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    this.applyExtensions();
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  /**
   * Set up Prisma middleware for multi-tenant security and logging
   */
  private applyExtensions() {
    if (typeof (this as unknown as { $extends?: unknown }).$extends !== 'function') {
      this.logger.warn('Prisma client extensions not available; middleware features are disabled.');
      return;
    }

    const hasBusinessIdInWhere = (where: any): boolean => {
      if (!where) return false;
      if (where.businessId !== undefined) return true;
      if (where.AND && Array.isArray(where.AND)) {
        return where.AND.some((condition: any) => hasBusinessIdInWhere(condition));
      }
      if (where.OR && Array.isArray(where.OR)) {
        return where.OR.some((condition: any) => hasBusinessIdInWhere(condition));
      }
      return false;
    };

    const logger = this.logger;

    const extended = this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            if (model) {
              const multiTenantModels = ['Category', 'Product'];
              const guardedOps = ['findFirst', 'findMany', 'findUnique', 'update', 'updateMany', 'delete', 'deleteMany'];

              if (multiTenantModels.includes(model) && guardedOps.includes(operation)) {
                if (model === 'Category') {
                  const where = args && typeof args === 'object' && 'where' in args ? (args as { where?: any }).where : undefined;
                  const hasBusinessIdFilter = hasBusinessIdInWhere(where);
                  if (!hasBusinessIdFilter && operation !== 'create') {
                    logger.warn(
                      `Potentially unsafe ${operation} operation on ${model} without businessId filter`,
                      {
                        operation,
                        model,
                        args: JSON.stringify(args),
                      },
                    );
                  }
                }

                if (model === 'Product') {
                  const where = args && typeof args === 'object' && 'where' in args ? (args as { where?: any }).where : undefined;
                  const hasCategoryBusinessIdFilter = where?.category?.businessId;
                  if (!hasCategoryBusinessIdFilter && operation !== 'create') {
                    logger.warn(
                      `Potentially unsafe ${operation} operation on ${model} without category.businessId filter`,
                      {
                        operation,
                        model,
                        args: JSON.stringify(args),
                      },
                    );
                  }
                }
              }
            }

            const before = Date.now();
            const result = await query(args);
            const duration = Date.now() - before;

            if (model && duration > 1000) {
              logger.warn(`Slow query detected: ${model}.${operation} took ${duration}ms`);
            }

            if (model && ['create', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              logger.log(`Write operation: ${model}.${operation}`, {
                duration: `${duration}ms`,
                model,
                operation,
              });
            }

            return result;
          },
        },
      },
    });

    Object.assign(this, extended);
    this.logger.log('Prisma extensions initialized: Multi-tenant security and audit logging enabled');
  }

  /**
   * Helper function to check if businessId is present in where clause
   */
  private hasBusinessIdInWhere(where: any): boolean {
    if (!where) return false;
    if (where.businessId !== undefined) return true;
    if (where.AND && Array.isArray(where.AND)) {
      return where.AND.some((condition: any) => this.hasBusinessIdInWhere(condition));
    }
    if (where.OR && Array.isArray(where.OR)) {
      return where.OR.some((condition: any) => this.hasBusinessIdInWhere(condition));
    }
    return false;
  }
}
