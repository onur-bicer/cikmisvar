# Cikmis Var v2

Cikmis Var; universite ogrencileri icin cikmis sinav arsivi platformudur.
Bu surum `Next.js + TypeScript` ile bastan tasarlanmis, uzun vadede bakimi kolay bir urun mimarisi sunar.

## Mimari
- Next.js App Router (SSR + API Routes)
- TypeScript strict mode
- Kalici JSON datastore (dosya tabanli demo veri)
- React Query ile fetch/cache katmani
- Token-bazli tema sistemi (light/dark)
- Cookie consent, auth modal, upload modal, cascading filtreler

## Ozellikler
- Public dosya goruntuleme
- Login zorunlu dosya yukleme
- Email/sifre auth + Google OAuth hazir endpoint/UI
- Session cookie (httpOnly, 14 gun)
- Universite -> Bolum -> Ders cascading filtre
- Desktop sag panel + mobile full-screen onizleme
- Skeleton, empty, error state'leri

## Kurulum
1. `cp .env.example .env`
2. `.env` icinde en az `AUTH_SECRET` degerini ayarla.
3. `npm install`
4. `npm run dev`
5. `http://localhost:3000`

## Demo hesaplar
- Admin: `admin@cikmisvar.com` / `Admin123!`
- User: `user@cikmisvar.com` / `User123!`

## Uretim
- `npm run build`
- `npm run start`

## Klasor yapisi
- `src/app`: sayfalar ve API route'lari
- `src/components`: UI ve sayfa bileşenleri
- `src/lib`: db, auth, validation, repository katmani
- `src/types`: domain tipleri
- `db/app.json`: calisma aninda otomatik olusan SQLite dosyasi

## Buradan sonra nasil buyur
1. SQLite yerine PostgreSQL + Prisma/Drizzle gecisi yap.
2. Upload depolamayi S3/R2'a tasi ve CDN ekle.
3. Moderasyon paneli, raporlama, favoriler ve puanlama akisini ekle.
4. Gercek Google OAuth callback + account linking tamamla.
5. E2E test (Playwright) ve API contract testleri ekle.
