# API Endpoints

Base URL (local): `http://localhost:3001/api`

## Auth

- `POST /auth/register`
  - Body: `{ email, password, businessName }`
- `POST /auth/login`
  - Body: `{ email, password }`
- `POST /auth/verify-email`
  - Body: `{ token }`
- `POST /auth/reset-password-request`
  - Body: `{ email }`
- `POST /auth/reset-password`
  - Body: `{ token, newPassword }`
- `POST /auth/logout`
  - Header: `Authorization: Bearer <token>`

## Business

- `GET /business/:slug` (public)
- `GET /business` (auth)
- `PATCH /business` (auth)
  - Body: `{ name?, logo?, slug?, defaultLanguage? }`

## Categories

- `GET /categories?businessId=...` (public)
- `GET /categories` (auth)
- `GET /categories/with-products` (auth)
- `POST /categories` (auth)
- `PATCH /categories/:id` (auth)
- `DELETE /categories/:id` (auth)
- `PATCH /categories/reorder/bulk` (auth)
- `PATCH /categories/:id/translations` (auth)

## Products

- `GET /products?businessId=...` (public)
- `GET /products` (auth)
- `GET /categories/:id/products` (public)
- `POST /products` (auth)
- `PATCH /products/:id` (auth)
- `DELETE /products/:id` (auth)
- `DELETE /products/bulk/delete` (auth)
- `PATCH /products/bulk/status` (auth)
- `PATCH /products/:id/translations` (auth)

## QR Code

- `GET /qr-code/preview` (auth)
- `GET /qr-code/svg` (auth)
- `GET /qr-code/png` (auth)
- `GET /qr-code/pdf` (auth)
- `POST /qr-code/customize` (auth)
  - Body: `{ fgColor?, bgColor?, logoEnabled? }`
- `POST /qr-code/validate-colors` (auth)
  - Body: `{ fgColor, bgColor }`

## Health

- `GET /health`
