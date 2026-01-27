import { IsArray, IsString, IsBoolean } from 'class-validator';

export class BulkStatusChangeDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsBoolean()
  isActive: boolean;
}
