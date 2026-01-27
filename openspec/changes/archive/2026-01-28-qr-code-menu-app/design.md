## Context

QR kod tabanlı dijital menü uygulaması için teknik mimari tasarımı. Sistem iki ana kullanıcı tipine hizmet verecek: müşteriler (readonly menü erişimi) ve işletmeciler (CRUD operasyonları). Uygulama monorepo yapısında geliştirilecek ve Next.js + NestJS stack'i kullanacak.

**Mevcut Durum**: Greenfield proje - sıfırdan geliştirilecek
**Kısıtlar**: TypeScript kullanımı zorunlu, modern web standartlarına uyum
**Stakeholders**: İşletme sahipleri (admin), son kullanıcılar (müşteriler)

## Goals / Non-Goals

**Goals:**
- Monorepo yapısında ölçeklenebilir bir proje mimarisi oluşturmak
- İşletmeler için multi-tenant yapı sağlamak (her işletme izole veri)
- QR kod bazlı hızlı menü erişimi
- Responsive ve performanslı müşteri deneyimi
- İşletmeciler için kolay kullanımlı admin paneli
- Çoklu dil desteği

**Non-Goals:**
- Mobil uygulama geliştirme (sadece web-based)
- Online sipariş veya ödeme sistemi (v1 için)
- Gerçek zamanlı stok takibi

## Decisions

### 1. Monorepo Tool: **Turborepo**
- **Karar**: Turborepo kullanılacak
- **Neden**:
  - Next.js ve NestJS için optimize edilmiş
  - Hızlı cache mekanizması
  - Minimal konfigürasyon
  - Vercel ecosystem uyumu
- **Alternatifler**:
  - Nx: Daha karmaşık, enterprise odaklı
  - Lerna: Eski teknoloji, maintenance azalmış
  - Yarn workspaces: Build orchestration yok

### 2. Database: **PostgreSQL**
- **Karar**: PostgreSQL kullanılacak
- **Neden**:
  - Prisma ile mükemmel uyum
  - JSON field support (menü metadata için)
  - Relational integrity (Business → Category → Product)
  - Ücretsiz hosting seçenekleri (Supabase, Railway)
  - Demo projesi olduğu için lokalde setup kolaylığı
- **Alternatifler**:
  - MySQL: Benzer özellikler ama JSON support daha zayıf
  - MongoDB: İlişkisel data modeli için uygun değil

### 3. Authentication Stratejisi
- **Karar**:
  - Frontend: NextAuth.js v5 (App Router uyumlu)
  - Backend: JWT token validation (NestJS Guards)
  - Session: Database-backed (Prisma adapter)
- **Neden**:
  - NextAuth.js industry standard, Next.js native uyumu
  - JWT stateless, scalable
  - Database session rollback/revoke imkanı
- **Alternatifler**:
  - Clerk/Auth0: Üçüncü parti bağımlılık, maliyet
  - Passport.js: NextAuth.js kadar Next.js friendly değil

### 4. QR Kod Generation ve Storage
- **Karar**:
  - Library: `qrcode` npm package
  - Storage: Database'de SVG string olarak
  - URL Format: `https://domain.com/menu/{businessSlug}`
- **Neden**:
  - SVG vektörel, her boyutta kaliteli
  - Database'de saklama cloud storage bağımlılığını ortadan kaldırır
  - Slug-based URL SEO friendly ve okunabilir
- **Alternatifler**:
  - PNG/JPG storage: Boyut problemi, kalite kaybı
  - Cloud storage (S3): Ekstra maliyet, komplekslik
  - UUID-based URL: Okunabilir değil

### 5. API Design: **RESTful**
- **Karar**: REST API endpoints
- **Neden**:
  - Basit CRUD operasyonları için yeterli
  - Next.js Server Actions ile uyumlu
  - Caching stratejileri kolay
- **Alternatifler**:
  - GraphQL: Over-engineering for simple CRUD
  - tRPC: Type-safety faydalı ama REST yeterli

### 6. Frontend Route Structure
```
/                         → Landing page
/menu/[slug]              → Public menu view (QR redirect)
/admin                    → Login page
/admin/dashboard          → Business dashboard
/admin/categories         → Category management
/admin/products           → Product management
/admin/qr-code            → QR code download
```

### 7. Database Schema (Prisma)
**Core Models**:
- **Business**: İşletme bilgileri (name, slug, logo, theme settings)
- **User**: Admin kullanıcıları (email, password hash, businessId)
- **Category**: Menü kategorileri (name, order, businessId)
- **Product**: Ürünler (name, description, price, imageUrl, categoryId)

**İlişkiler**:
- Business 1:N User (bir işletmenin birden fazla admin'i olabilir)
- Business 1:N Category
- Category 1:N Product

## Risks / Trade-offs

### [Risk] QR Kod SVG Boyutu
**Açıklama**: Çok uzun URL'ler için SVG string büyüyebilir
**Mitigation**: Slug max 50 karakter limit, domain kısa tutulacak

### [Risk] Multi-Tenancy Data Leakage
**Açıklama**: Bir işletme başka işletmenin datasını görebilir
**Mitigation**:
- Prisma middleware ile tüm sorgulara `businessId` filter otomatik ekleme
- Row-level security guards
- Business ID JWT token'da saklama

### [Risk] Dosya Upload (Ürün Görselleri)
**Açıklama**: Görsel storage stratejisi belirsiz
**Mitigation**:
- V1: Cloudinary/Uploadthing gibi managed service
- V2: S3-compatible storage'a geçiş

### [Risk] Performans - Büyük Menüler
**Açıklama**: Yüzlerce ürünlü menüler yavaş yüklenebilir
**Mitigation**:
- Next.js ISR (Incremental Static Regeneration) ile `/menu/[slug]` cache
- Lazy loading for images
- Pagination veya virtualization (gerekirse)

### [Trade-off] REST yerine GraphQL
**Seçim**: REST tercih edildi
**Kayıp**: Frontend'de over-fetching olabilir (tüm product fields gelir)
**Kazanç**: Basitlik, hızlı development, caching kolaylığı

## Migration Plan

**İlk Deployment**:
1. Database provision (PostgreSQL - Railway/Supabase)
2. Prisma migrate deploy
3. Seed script ile demo business oluşturma
4. Frontend + Backend Vercel/Railway'e deploy
5. Environment variables ayarlama

**Rollback Stratejisi**:
- Database migrations Prisma ile versiyonlu
- `prisma migrate resolve` ile rollback
- Vercel deployment rollback one-click

## Open Questions

1. **Ürün görselleri için storage provider?**
   - Cloudinary (ücretsiz tier 25GB)
   - Uploadthing (developer-friendly)
   - Vercel Blob (Next.js native)

2. **Theme/Branding özelleştirmesi?**
   - Her işletme kendi renklerini seçebilmeli mi?
   - Varsayılan temalar sunulmalı mı?

3. **QR Kod download formatı?**
   - SVG, PNG, PDF?
   - Print-ready template sunulmalı mı?

4. **Analytics gereksinimi?**
   - Menü görüntüleme sayıları takip edilsin mi?
   - Hangi ürünlere bakıldığı track edilsin mi?
