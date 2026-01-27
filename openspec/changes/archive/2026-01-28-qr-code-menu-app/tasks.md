## 1. Project Setup

- [x] 1.1 Initialize Turborepo monorepo structure
- [x] 1.2 Create `apps/frontend` workspace with Next.js 14+ (App Router, TypeScript)
- [x] 1.3 Create `apps/backend` workspace with NestJS (TypeScript)
- [x] 1.4 Configure turbo.json for build orchestration and caching
- [x] 1.5 Set up shared TypeScript config in root
- [x] 1.6 Configure ESLint and Prettier for both workspaces
- [x] 1.7 Create .env.example files for frontend and backend

## 2. Database Schema & Prisma Setup

- [x] 2.1 Install Prisma in backend workspace
- [x] 2.2 Initialize Prisma with PostgreSQL provider
- [x] 2.3 Define Business model (id, name, slug, logo, qrCodeSvg, defaultLanguage, createdAt, updatedAt)
- [x] 2.4 Define User model (id, email, passwordHash, role, businessId, emailVerified, createdAt)
- [x] 2.5 Define Category model (id, name, order, businessId, translations as JSON, createdAt, updatedAt)
- [x] 2.6 Define Product model (id, name, description, price, imageUrl, categoryId, translations as JSON, isActive, createdAt, updatedAt)
- [x] 2.7 Define Session model for NextAuth (id, userId, token, expiresAt)
- [x] 2.8 Define VerificationToken model (identifier, token, expires)
- [x] 2.9 Create initial migration
- [x] 2.10 Generate Prisma Client
- [x] 2.11 Create seed script with demo business data

## 3. Backend - Core NestJS Setup

- [x] 3.1 Create main AppModule with global configuration
- [x] 3.2 Set up PrismaModule and PrismaService
- [x] 3.3 Configure CORS for frontend origin
- [x] 3.4 Set up global exception filters
- [x] 3.5 Configure validation pipes for DTO validation
- [x] 3.6 Set up environment variables with @nestjs/config
- [x] 3.7 Create health check endpoint (/api/health)

## 4. Backend - Authentication Module

- [x] 4.1 Create AuthModule with AuthController and AuthService
- [x] 4.2 Install and configure bcrypt for password hashing
- [x] 4.3 Implement registration endpoint (POST /auth/register)
- [x] 4.4 Implement login endpoint (POST /auth/login) with JWT generation
- [x] 4.5 Install @nestjs/jwt and configure JwtModule
- [x] 4.6 Create JwtAuthGuard for route protection
- [x] 4.7 Create JwtStrategy for token validation
- [x] 4.8 Implement email verification token generation
- [x] 4.9 Implement email verification endpoint (POST /auth/verify-email)
- [x] 4.10 Implement password reset request endpoint (POST /auth/reset-password-request)
- [x] 4.11 Implement password reset confirmation endpoint (POST /auth/reset-password)
- [x] 4.12 Set up email service (NodeMailer or similar) for verification emails
- [x] 4.13 Implement rate limiting for auth endpoints (5 attempts per 15 min)
- [x] 4.14 Create BusinessIdGuard to enforce multi-tenant data isolation

## 5. Backend - Business Module

- [x] 5.1 Create BusinessModule with BusinessController and BusinessService
- [x] 5.2 Implement get business by slug endpoint (GET /business/:slug)
- [x] 5.3 Implement update business endpoint (PATCH /business) - protected
- [x] 5.4 Implement slug generation utility (lowercase, hyphenation, special char removal)
- [x] 5.5 Implement slug uniqueness validation with numeric suffix
- [x] 5.6 Add slug validation (max 50 chars, URL-safe)

## 6. Backend - QR Code Module

- [x] 6.1 Install `qrcode` npm package
- [x] 6.2 Create QrCodeModule with QrCodeController and QrCodeService
- [x] 6.3 Implement QR code generation service (SVG format, Level M error correction)
- [x] 6.4 Create QR code generation hook on business creation
- [x] 6.5 Implement QR code regeneration on slug update
- [x] 6.6 Implement QR code download endpoints (GET /qr-code/svg, /qr-code/png, /qr-code/pdf)
- [x] 6.7 Implement SVG to PNG conversion (using sharp or canvas)
- [x] 6.8 Implement SVG to PDF conversion (using pdfkit or similar)
- [x] 6.9 Add QR code customization options (logo embed, color customization)
- [x] 6.10 Implement QR code scannability validation after customization

## 7. Backend - Category Module

- [x] 7.1 Create CategoryModule with CategoryController and CategoryService
- [x] 7.2 Implement create category endpoint (POST /categories) - protected
- [x] 7.3 Implement get all categories endpoint (GET /categories) - public & protected variants
- [x] 7.4 Implement update category endpoint (PATCH /categories/:id) - protected
- [x] 7.5 Implement delete category endpoint (DELETE /categories/:id) - protected
- [x] 7.6 Implement reorder categories endpoint (PATCH /categories/reorder) - protected
- [x] 7.7 Add duplicate category name validation (per business)
- [x] 7.8 Implement cascade delete warning for categories with products
- [x] 7.9 Add businessId filter to all queries (automatic via middleware)
- [x] 7.10 Implement category translation management (POST/PATCH /categories/:id/translations)

## 8. Backend - Product Module

- [x] 8.1 Create ProductModule with ProductController and ProductService
- [x] 8.2 Implement create product endpoint (POST /products) - protected
- [x] 8.3 Implement get all products endpoint (GET /products) - public & protected variants
- [x] 8.4 Implement get products by category endpoint (GET /categories/:id/products)
- [x] 8.5 Implement update product endpoint (PATCH /products/:id) - protected
- [x] 8.6 Implement delete product endpoint (DELETE /products/:id) - protected
- [x] 8.7 Implement bulk delete products endpoint (DELETE /products/bulk) - protected
- [x] 8.8 Implement bulk status change endpoint (PATCH /products/bulk-status) - protected
- [x] 8.9 Add price validation (non-negative, numeric)
- [x] 8.10 Add businessId filter via categoryId relationship
- [x] 8.11 Implement product translation management (POST/PATCH /products/:id/translations)
- [x] 8.12 Set up image upload integration (PostgreSQL blob storage)

## 9. Backend - Prisma Middleware for Multi-Tenancy

- [x] 9.1 Create Prisma middleware to auto-inject businessId filter
- [x] 9.2 Add middleware to enforce row-level security on Category queries
- [x] 9.3 Add middleware to enforce row-level security on Product queries (via Category)
- [x] 9.4 Log unauthorized access attempts to security log
- [x] 9.5 Test cross-tenant access prevention

## 10. Frontend - NextAuth Configuration

- [x] 10.1 Install NextAuth.js v5 and configure for App Router
- [x] 10.2 Create auth.config.ts with CredentialsProvider
- [x] 10.3 Configure Prisma adapter for session storage
- [x] 10.4 Set up auth callback to include businessId in JWT token
- [x] 10.5 Configure session strategy (JWT + database-backed)
- [x] 10.6 Create middleware.ts for route protection (/admin/* routes)
- [x] 10.7 Create auth API routes in app/api/auth/[...nextauth]/route.ts
- [x] 10.8 Implement logout functionality with session invalidation
- [x] 10.9 Configure HTTP-only cookies with secure flag

## 11. Frontend - Public Menu Display

- [x] 11.1 Create app/menu/[slug]/page.tsx for public menu view
- [x] 11.2 Implement getStaticPaths for ISR (Incremental Static Regeneration)
- [x] 11.3 Fetch business data by slug (404 for non-existent slug)
- [x] 11.4 Fetch categories and products for the business
- [x] 11.5 Create MenuLayout component with business branding (logo, name)
- [x] 11.6 Create CategoryList component with filter/navigation
- [x] 11.7 Create ProductCard component (name, description, price, image)
- [x] 11.8 Implement category filter functionality (client component)
- [x] 11.9 Add placeholder images for products without imageUrl
- [x] 11.10 Implement responsive layout (mobile: single-column, desktop: grid)
- [x] 11.11 Add image lazy loading with Next.js Image component
- [x] 11.12 Configure ISR revalidation (e.g., every 60 seconds)
- [x] 11.13 Implement 404 error page for invalid business slugs

## 12. Frontend - Multi-Language Support

- [x] 12.1 Set up next-intl or similar i18n library
- [x] 12.2 Create language detection from browser settings
- [x] 12.3 Implement LanguageSwitcher component for menu page
- [x] 12.4 Create translation context/hook to access current language
- [x] 12.5 Render product/category translations based on selected language
- [x] 12.6 Implement fallback to default language when translation missing
- [x] 12.7 Store language preference in localStorage/cookie

## 13. Frontend - Authentication Pages

- [x] 13.1 Create app/admin/page.tsx (login page)
- [x] 13.2 Create LoginForm component with email/password fields
- [x] 13.3 Integrate NextAuth signIn function
- [x] 13.4 Display error messages for invalid credentials
- [x] 13.5 Redirect to /admin/dashboard on successful login
- [x] 13.6 Create app/auth/register/page.tsx for business registration
- [x] 13.7 Create RegistrationForm component (email, password, business name)
- [x] 13.8 Call backend registration API
- [x] 13.9 Display success message and email verification prompt
- [x] 13.10 Create app/auth/verify-email/page.tsx for email verification
- [x] 13.11 Create app/auth/reset-password/page.tsx for password reset request
- [x] 13.12 Create app/auth/reset-password/[token]/page.tsx for password reset confirmation

## 14. Frontend - Admin Dashboard

- [x] 14.1 Create app/admin/dashboard/page.tsx
- [x] 14.2 Create DashboardLayout with navigation sidebar
- [x] 14.3 Display business overview (total categories, products, QR code preview)
- [x] 14.4 Create navigation to categories, products, QR code pages
- [x] 14.5 Add logout button in header
- [x] 14.6 Fetch and display session user information

## 15. Frontend - Category Management

- [x] 15.1 Create app/admin/categories/page.tsx
- [x] 15.2 Create CategoryList component showing all categories
- [x] 15.3 Create CategoryForm component (create/edit modal or page)
- [x] 15.4 Implement create category functionality (POST /categories)
- [x] 15.5 Implement update category functionality (PATCH /categories/:id)
- [x] 15.6 Implement delete category with confirmation dialog
- [x] 15.7 Show warning for deleting categories with products
- [x] 15.8 Implement drag-and-drop reordering (react-beautiful-dnd or dnd-kit)
- [x] 15.9 Display validation errors (duplicate name, empty name)
- [x] 15.10 Add translation management UI for each category
- [x] 15.11 Implement real-time updates (optimistic UI or refetch)

## 16. Frontend - Product Management

- [x] 16.1 Create app/admin/products/page.tsx
- [x] 16.2 Create ProductList component with table/grid view
- [x] 16.3 Create ProductForm component (create/edit with image upload)
- [x] 16.4 Implement create product functionality (POST /products)
- [x] 16.5 Implement image upload UI (PostgreSQL blob)
- [x] 16.6 Implement update product functionality (PATCH /products/:id)
- [x] 16.7 Implement delete product with confirmation dialog
- [x] 16.8 Implement bulk selection and bulk delete
- [x] 16.9 Implement bulk status change (active/inactive)
- [x] 16.10 Display validation errors (invalid price, empty name)
- [x] 16.11 Add category dropdown to assign/reassign products
- [x] 16.12 Add translation management UI for each product
- [x] 16.13 Display placeholder image for products without imageUrl
- [x] 16.14 Implement product filtering by category

## 17. Frontend - QR Code Management

- [x] 17.1 Create app/admin/qr-code/page.tsx
- [x] 17.2 Display live QR code preview (SVG rendering)
- [x] 17.3 Display current business slug and menu URL
- [x] 17.4 Implement "Download SVG" button (GET /qr-code/svg)
- [x] 17.5 Implement "Download PNG" button (GET /qr-code/png)
- [x] 17.6 Implement "Download PDF" button (GET /qr-code/pdf)
- [x] 17.7 Create "Test QR Code" button to open menu in new tab
- [x] 17.8 Add QR code customization UI (optional logo embed, colors)
- [x] 17.9 Show slug update form (regenerates QR code on change)
- [x] 17.10 Display QR code regeneration confirmation

## 18. Frontend - Shared Components & Styling

- [x] 18.1 Set up Tailwind CSS in frontend workspace
- [x] 18.2 Create shared UI components (Button, Input, Modal, Card)
- [x] 18.3 Create LoadingSpinner component
- [x] 18.4 Create ErrorBoundary for client-side error handling
- [x] 18.5 Create Toast/Notification system for success/error messages
- [x] 18.6 Create ConfirmDialog component for delete confirmations
- [x] 18.7 Set up theme configuration (colors, typography)

## 19. API Client & Data Fetching

- [x] 19.1 Create API client utility for backend communication
- [x] 19.2 Configure base URL from environment variables
- [x] 19.3 Add JWT token injection in API requests (from NextAuth session)
- [x] 19.4 Create React Query / SWR setup for data fetching
- [x] 19.5 Implement query keys and cache invalidation strategy
- [x] 19.6 Create custom hooks for each resource (useCategories, useProducts, etc.)
- [x] 19.7 Add error handling and retry logic

## 20. Testing

- [x] 20.1 Set up Jest and Testing Library for frontend
- [x] 20.2 Write unit tests for API services (backend)
- [x] 20.3 Write unit tests for utility functions (slug generation, QR code)
- [x] 20.4 Write integration tests for auth endpoints
- [x] 20.5 Write integration tests for category/product CRUD
- [x] 20.6 Write component tests for key frontend components
- [x] 20.7 Test multi-tenant data isolation scenarios
- [x] 20.8 Test rate limiting for auth endpoints
- [x] 20.9 Test QR code generation and download flows
- [x] 20.10 Test multi-language functionality

## 21. Docker Demo Environment Setup

- [x] 21.1 Create Dockerfile for backend service
- [x] 21.2 Create Dockerfile for frontend service
- [x] 21.3 Create docker-compose.yml with all services (postgres, backend, frontend)
- [x] 21.4 Configure PostgreSQL container with volume persistence
- [x] 21.5 Set up environment variables for Docker containers
- [x] 21.6 Configure backend service to wait for database
- [x] 21.7 Add Prisma migration script to backend container startup
- [x] 21.8 Configure CORS for Docker network
- [x] 21.9 Create seed script runner in docker-compose
- [x] 21.10 Add health checks for all services
- [x] 21.11 Create docker-compose.dev.yml for development mode
- [x] 21.12 Write Docker setup documentation in README

## 22. Documentation & Polish

- [x] 22.1 Write README with setup instructions
- [x] 22.2 Document API endpoints (OpenAPI/Swagger optional)
- [x] 22.3 Create user guide for business owners
- [x] 22.4 Add loading states for all async operations
- [x] 22.5 Add empty states for lists (no categories, no products)
- [x] 22.6 Implement proper error pages (404, 500)
- [x] 22.7 Add accessibility improvements (ARIA labels, keyboard navigation)
- [x] 22.8 Test on multiple browsers and devices
- [x] 22.9 Optimize images and assets
- [x] 22.10 Run Lighthouse audit and address issues
