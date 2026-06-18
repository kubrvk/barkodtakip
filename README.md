# BarkodTakip

React Native + Expo ile mobil oncelikli, webde de yayinlanabilir barkod/stok takip MVP'si.

## Calistirma

```bash
npm install
npm run web
```

## Firebase baglama

`.env.example` dosyasini `.env` olarak kopyalayip Firebase Web App bilgilerini doldurun. Bilgiler bos kalirsa uygulama demo verilerle calisir.

## Web deploy

```bash
npm run build:web
firebase deploy --only hosting
```

Expo web build cikisi `dist` klasorune alinacak ve Firebase Hosting bu klasoru yayinlayacak sekilde ayarlidir.

## GitHub Actions ile otomatik deploy

`main` branch'e push gelince `.github/workflows/firebase-hosting.yml` calisir:

1. `npm ci`
2. `npm run test`
3. `npm run build:web`
4. `dist` klasorunu Firebase Hosting live kanalina deploy eder

GitHub repo ayarlarinda su secret'i ekleyin:

- `FIREBASE_SERVICE_ACCOUNT`

Firebase project id `.firebaserc` ve GitHub Actions workflow icinde `barkodtakips` olarak ayarlidir.
