## Why

İşletmelerin (restoranlar, kafeler, barlar vb.) müşterilerine dijital menü sunabilmesi için QR kod tabanlı sanal bir menü uygulaması geliştirmek. Fiziksel menülerin maliyetini azaltmak, menü güncellemelerini kolaylaştırmak ve müşteri deneyimini iyileştirmek.

## What Changes

- **Yeni bir monorepo projesi oluşturulacak** (frontend + backend)
- **Frontend uygulaması**: Next.js ile müşteri menü görüntüleme ve işletmeci yönetim paneli
- **Backend API**: NestJS ile RESTful API, Prisma ORM ile veritabanı yönetimi
- **QR kod sistemi**: Her işletme için benzersiz QR kodlar oluşturulacak
- **İki kullanıcı tipi**: Müşteri (readonly menü erişimi) ve İşletmeci (CRUD operasyonları)
- **Menü yapısı**: Kategoriler ve ürünler hiyerarşisi

## Capabilities

### New Capabilities
- `menu-display`: Müşterilerin QR kod okutarak menüyü görüntülemesi, kategorilere göre filtreleme, ürün detaylarını inceleme
- `menu-management`: İşletmecinin kategori ve ürün ekleme, silme, güncelleme operasyonları
- `qr-code-generation`: Her işletme için benzersiz QR kod oluşturma ve yönetme
- `business-auth`: İşletmeci kullanıcılarının kimlik doğrulama ve yetkilendirme sistemi

### Modified Capabilities
<!-- Yeni bir proje olduğu için mevcut capability değişikliği yok -->

## Impact

**Yeni Bileşenler**:
- Monorepo yapısı (frontend + backend workspace'leri)
- Next.js frontend uygulaması (App Router, TypeScript)
- NestJS backend API (TypeScript, REST endpoints)
- Prisma schema ve migrations (PostgreSQL/MySQL)
- QR kod generation servisi

**Dependencies**:
- Next.js 14+
- NestJS
- Prisma ORM
- QR kod generation kütüphanesi (qrcode veya benzeri)
- Authentication library (JWT, NextAuth vb.)

**Deployment Gereksinimleri**:
- Node.js runtime environment
- Veritabanı (PostgreSQL/MySQL)
- Static asset hosting (QR kod görselleri)
