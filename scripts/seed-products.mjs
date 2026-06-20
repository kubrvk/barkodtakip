// 100+ ürün ekleme scripti – Admin hesabı için
// Çalıştır: node scripts/seed-products.mjs

import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const API_KEY = env.EXPO_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

const ADMIN_EMAIL = 'admin@barkodtakip.com';
const ADMIN_PASSWORD = 'Admin2024!';

// ──────────────────────────────────────────────
// ÜRÜN VERİSİ – 120 ürün
// ──────────────────────────────────────────────
const products = [
  // ELEKTRONİK (A1–A3)
  { name: 'Bluetooth Kulaklık Pro', sku: 'ELK-001', barcode: '8690000000001', stock: 45, min: 10, unit: 'adet', loc: 'A1' },
  { name: 'USB-C Şarj Kablosu 2m', sku: 'ELK-002', barcode: '8690000000002', stock: 120, min: 30, unit: 'adet', loc: 'A1' },
  { name: 'Kablosuz Mouse', sku: 'ELK-003', barcode: '8690000000003', stock: 38, min: 8, unit: 'adet', loc: 'A1' },
  { name: 'Mekanik Klavye', sku: 'ELK-004', barcode: '8690000000004', stock: 22, min: 5, unit: 'adet', loc: 'A1' },
  { name: 'HDMI Kablo 1.5m', sku: 'ELK-005', barcode: '8690000000005', stock: 75, min: 20, unit: 'adet', loc: 'A1' },
  { name: 'USB Hub 4 Port', sku: 'ELK-006', barcode: '8690000000006', stock: 55, min: 12, unit: 'adet', loc: 'A1' },
  { name: 'Webcam 1080p', sku: 'ELK-007', barcode: '8690000000007', stock: 18, min: 5, unit: 'adet', loc: 'A1' },
  { name: 'Harici SSD 1TB', sku: 'ELK-008', barcode: '8690000000008', stock: 14, min: 3, unit: 'adet', loc: 'A1' },
  { name: 'Akıllı Saat Şarj Kablosu', sku: 'ELK-009', barcode: '8690000000009', stock: 90, min: 20, unit: 'adet', loc: 'A1' },
  { name: 'Powerbank 20000mAh', sku: 'ELK-010', barcode: '8690000000010', stock: 32, min: 8, unit: 'adet', loc: 'A1' },

  // TELEFON AKSESUAR (A2)
  { name: 'Ekran Koruyucu iPhone 15', sku: 'TEL-001', barcode: '8690000000011', stock: 200, min: 50, unit: 'adet', loc: 'A2' },
  { name: 'Telefon Kılıfı Şeffaf', sku: 'TEL-002', barcode: '8690000000012', stock: 150, min: 30, unit: 'adet', loc: 'A2' },
  { name: 'Magsafe Tutucu Araç', sku: 'TEL-003', barcode: '8690000000013', stock: 60, min: 15, unit: 'adet', loc: 'A2' },
  { name: 'Selfie Çubuğu', sku: 'TEL-004', barcode: '8690000000014', stock: 40, min: 10, unit: 'adet', loc: 'A2' },
  { name: 'Wireless Şarj Pad', sku: 'TEL-005', barcode: '8690000000015', stock: 28, min: 8, unit: 'adet', loc: 'A2' },
  { name: 'AUX Dönüştürücü USB-C', sku: 'TEL-006', barcode: '8690000000016', stock: 85, min: 20, unit: 'adet', loc: 'A2' },
  { name: 'Samsung Kılıf Deri', sku: 'TEL-007', barcode: '8690000000017', stock: 45, min: 10, unit: 'adet', loc: 'A2' },
  { name: 'Popsoket Telefon Tutucu', sku: 'TEL-008', barcode: '8690000000018', stock: 110, min: 25, unit: 'adet', loc: 'A2' },
  { name: 'Mikrofiber Ekran Bezi', sku: 'TEL-009', barcode: '8690000000019', stock: 300, min: 50, unit: 'adet', loc: 'A2' },
  { name: 'Type-C OTG Adaptör', sku: 'TEL-010', barcode: '8690000000020', stock: 70, min: 15, unit: 'adet', loc: 'A2' },

  // BİLGİSAYAR ÇEVRE BİRİMLERİ (A3)
  { name: 'Laptop Soğutucu Stand', sku: 'BLG-001', barcode: '8690000000021', stock: 25, min: 6, unit: 'adet', loc: 'A3' },
  { name: 'Mouse Pad Büyük', sku: 'BLG-002', barcode: '8690000000022', stock: 80, min: 20, unit: 'adet', loc: 'A3' },
  { name: 'Laptop Çantası 15"', sku: 'BLG-003', barcode: '8690000000023', stock: 30, min: 8, unit: 'adet', loc: 'A3' },
  { name: 'USB 3.0 Flash Bellek 64GB', sku: 'BLG-004', barcode: '8690000000024', stock: 95, min: 20, unit: 'adet', loc: 'A3' },
  { name: 'Kablo Düzenleyici Set', sku: 'BLG-005', barcode: '8690000000025', stock: 60, min: 15, unit: 'adet', loc: 'A3' },
  { name: 'Monitor Standı Yükseltici', sku: 'BLG-006', barcode: '8690000000026', stock: 18, min: 4, unit: 'adet', loc: 'A3' },
  { name: 'SD Kart Okuyucu', sku: 'BLG-007', barcode: '8690000000027', stock: 42, min: 10, unit: 'adet', loc: 'A3' },
  { name: 'Ethernet Kablosu Cat6 3m', sku: 'BLG-008', barcode: '8690000000028', stock: 55, min: 15, unit: 'adet', loc: 'A3' },
  { name: 'DisplayPort Kablo', sku: 'BLG-009', barcode: '8690000000029', stock: 30, min: 8, unit: 'adet', loc: 'A3' },
  { name: 'Bluetooth Hoparlör Mini', sku: 'BLG-010', barcode: '8690000000030', stock: 20, min: 5, unit: 'adet', loc: 'A3' },

  // OFİS MALZEMELERİ (B1)
  { name: 'A4 Fotokopi Kağıdı 500 yaprak', sku: 'OFİ-001', barcode: '8690000000031', stock: 80, min: 20, unit: 'paket', loc: 'B1' },
  { name: 'Tükenmez Kalem Mavi (12li)', sku: 'OFİ-002', barcode: '8690000000032', stock: 150, min: 30, unit: 'kutu', loc: 'B1' },
  { name: 'Silgi Beyaz', sku: 'OFİ-003', barcode: '8690000000033', stock: 200, min: 50, unit: 'adet', loc: 'B1' },
  { name: 'Makas Ofis', sku: 'OFİ-004', barcode: '8690000000034', stock: 45, min: 10, unit: 'adet', loc: 'B1' },
  { name: 'Yapışkanlı Not Kağıdı 100lü', sku: 'OFİ-005', barcode: '8690000000035', stock: 120, min: 25, unit: 'paket', loc: 'B1' },
  { name: 'Ataş Kutusu 100lü', sku: 'OFİ-006', barcode: '8690000000036', stock: 90, min: 20, unit: 'kutu', loc: 'B1' },
  { name: 'Zımba Makinesi', sku: 'OFİ-007', barcode: '8690000000037', stock: 25, min: 5, unit: 'adet', loc: 'B1' },
  { name: 'Zımba Teli 1000li', sku: 'OFİ-008', barcode: '8690000000038', stock: 110, min: 30, unit: 'kutu', loc: 'B1' },
  { name: 'Fosforlu Kalem Set 6lı', sku: 'OFİ-009', barcode: '8690000000039', stock: 65, min: 15, unit: 'set', loc: 'B1' },
  { name: 'Bant Makinesi + Bant', sku: 'OFİ-010', barcode: '8690000000040', stock: 35, min: 8, unit: 'adet', loc: 'B1' },

  // AMBALAJ MALZEMELERİ (B2)
  { name: 'Termal Etiket 10x6cm 500lü', sku: 'AMB-001', barcode: '8690000000041', stock: 40, min: 10, unit: 'rulo', loc: 'B2' },
  { name: 'Barkod Etiketi 5x3cm 1000li', sku: 'AMB-002', barcode: '8690000000042', stock: 25, min: 8, unit: 'rulo', loc: 'B2' },
  { name: 'Oluklu Mukavva Kutu 30x20x15', sku: 'AMB-003', barcode: '8690000000043', stock: 200, min: 50, unit: 'adet', loc: 'B2' },
  { name: 'Balonlu Naylon Zarf A4', sku: 'AMB-004', barcode: '8690000000044', stock: 300, min: 75, unit: 'adet', loc: 'B2' },
  { name: 'Kargo Bandı Şeffaf 50m', sku: 'AMB-005', barcode: '8690000000045', stock: 60, min: 15, unit: 'rulo', loc: 'B2' },
  { name: 'Köpük Dolgu Malzeme', sku: 'AMB-006', barcode: '8690000000046', stock: 80, min: 20, unit: 'paket', loc: 'B2' },
  { name: 'Stretch Film 50cm 300m', sku: 'AMB-007', barcode: '8690000000047', stock: 30, min: 8, unit: 'rulo', loc: 'B2' },
  { name: 'Doldurma Kağıdı 5kg', sku: 'AMB-008', barcode: '8690000000048', stock: 20, min: 5, unit: 'paket', loc: 'B2' },
  { name: 'Plastik Torba 30x40 100lü', sku: 'AMB-009', barcode: '8690000000049', stock: 50, min: 12, unit: 'paket', loc: 'B2' },
  { name: 'Kargo Kutusu 20x20x20', sku: 'AMB-010', barcode: '8690000000050', stock: 150, min: 40, unit: 'adet', loc: 'B2' },

  // TEMİZLİK ÜRÜNLERİ (B3)
  { name: 'El Dezenfektanı 500ml', sku: 'TEM-001', barcode: '8690000000051', stock: 60, min: 15, unit: 'adet', loc: 'B3' },
  { name: 'Yüzey Temizleyici Sprey', sku: 'TEM-002', barcode: '8690000000052', stock: 45, min: 10, unit: 'adet', loc: 'B3' },
  { name: 'Kağıt Havlu Rulo', sku: 'TEM-003', barcode: '8690000000053', stock: 120, min: 30, unit: 'rulo', loc: 'B3' },
  { name: 'Çöp Torbası 65x80 50li', sku: 'TEM-004', barcode: '8690000000054', stock: 80, min: 20, unit: 'rulo', loc: 'B3' },
  { name: 'Mikrofiber Bez 5li', sku: 'TEM-005', barcode: '8690000000055', stock: 55, min: 12, unit: 'paket', loc: 'B3' },
  { name: 'Cam Temizleyici 750ml', sku: 'TEM-006', barcode: '8690000000056', stock: 30, min: 8, unit: 'adet', loc: 'B3' },
  { name: 'Islak Mendil 80li', sku: 'TEM-007', barcode: '8690000000057', stock: 100, min: 25, unit: 'paket', loc: 'B3' },
  { name: 'Latex Eldiven M (100lü)', sku: 'TEM-008', barcode: '8690000000058', stock: 40, min: 10, unit: 'kutu', loc: 'B3' },
  { name: 'Toz Bezi Elektrostatik 20li', sku: 'TEM-009', barcode: '8690000000059', stock: 70, min: 15, unit: 'paket', loc: 'B3' },
  { name: 'Zemin Temizleyici 5L', sku: 'TEM-010', barcode: '8690000000060', stock: 25, min: 6, unit: 'adet', loc: 'B3' },

  // KIRTASİYE (C1)
  { name: 'Spiral Defter A4', sku: 'KRT-001', barcode: '8690000000061', stock: 85, min: 20, unit: 'adet', loc: 'C1' },
  { name: 'Plastik Dosya A4', sku: 'KRT-002', barcode: '8690000000062', stock: 200, min: 50, unit: 'adet', loc: 'C1' },
  { name: 'Karton Klasör', sku: 'KRT-003', barcode: '8690000000063', stock: 90, min: 20, unit: 'adet', loc: 'C1' },
  { name: 'Metre Cetvel 30cm', sku: 'KRT-004', barcode: '8690000000064', stock: 60, min: 15, unit: 'adet', loc: 'C1' },
  { name: 'Resim Kağıdı A3 50li', sku: 'KRT-005', barcode: '8690000000065', stock: 35, min: 8, unit: 'paket', loc: 'C1' },
  { name: 'Kurşun Kalem 2B (12li)', sku: 'KRT-006', barcode: '8690000000066', stock: 110, min: 25, unit: 'kutu', loc: 'C1' },
  { name: 'Pergel Seti', sku: 'KRT-007', barcode: '8690000000067', stock: 28, min: 6, unit: 'adet', loc: 'C1' },
  { name: 'Pelür Kağıt A4 200li', sku: 'KRT-008', barcode: '8690000000068', stock: 45, min: 10, unit: 'paket', loc: 'C1' },
  { name: 'Dosya Askısı Metal 10lu', sku: 'KRT-009', barcode: '8690000000069', stock: 60, min: 15, unit: 'paket', loc: 'C1' },
  { name: 'Kartvizit Kutusu', sku: 'KRT-010', barcode: '8690000000070', stock: 40, min: 10, unit: 'adet', loc: 'C1' },

  // GÜVENLIK VE KİŞİSEL KORUMA (C2)
  { name: 'N95 Maske 10lu', sku: 'GVN-001', barcode: '8690000000071', stock: 50, min: 12, unit: 'paket', loc: 'C2' },
  { name: 'Güvenlik Gözlüğü', sku: 'GVN-002', barcode: '8690000000072', stock: 30, min: 8, unit: 'adet', loc: 'C2' },
  { name: 'İş Eldiveni Deri L', sku: 'GVN-003', barcode: '8690000000073', stock: 55, min: 12, unit: 'çift', loc: 'C2' },
  { name: 'Yüksek Görünürlük Yeleği', sku: 'GVN-004', barcode: '8690000000074', stock: 25, min: 6, unit: 'adet', loc: 'C2' },
  { name: 'Baret Sarı', sku: 'GVN-005', barcode: '8690000000075', stock: 20, min: 5, unit: 'adet', loc: 'C2' },
  { name: 'Kulak Tıkacı 50 çift', sku: 'GVN-006', barcode: '8690000000076', stock: 40, min: 10, unit: 'kutu', loc: 'C2' },
  { name: 'Çelik Burunlu Ayakkabı 42', sku: 'GVN-007', barcode: '8690000000077', stock: 8, min: 3, unit: 'çift', loc: 'C2' },
  { name: 'İlk Yardım Seti', sku: 'GVN-008', barcode: '8690000000078', stock: 12, min: 3, unit: 'adet', loc: 'C2' },
  { name: 'Yangın Söndürücü 6kg', sku: 'GVN-009', barcode: '8690000000079', stock: 6, min: 2, unit: 'adet', loc: 'C2' },
  { name: 'Güvenlik Kilidi Asma', sku: 'GVN-010', barcode: '8690000000080', stock: 35, min: 8, unit: 'adet', loc: 'C2' },

  // MUTFAK & YIYECEK (C3)
  { name: 'Filtre Kahve 250g', sku: 'MTF-001', barcode: '8690000000081', stock: 30, min: 8, unit: 'paket', loc: 'C3' },
  { name: 'Çay Bardağı 6lı', sku: 'MTF-002', barcode: '8690000000082', stock: 20, min: 5, unit: 'set', loc: 'C3' },
  { name: 'Şeker 1kg', sku: 'MTF-003', barcode: '8690000000083', stock: 25, min: 6, unit: 'paket', loc: 'C3' },
  { name: 'Plastik Bardak 100lü', sku: 'MTF-004', barcode: '8690000000084', stock: 40, min: 10, unit: 'paket', loc: 'C3' },
  { name: 'Peçete 100lü', sku: 'MTF-005', barcode: '8690000000085', stock: 60, min: 15, unit: 'paket', loc: 'C3' },
  { name: 'Plastik Kaşık 100lü', sku: 'MTF-006', barcode: '8690000000086', stock: 45, min: 10, unit: 'paket', loc: 'C3' },
  { name: 'Çay Filtre Kağıt 100lü', sku: 'MTF-007', barcode: '8690000000087', stock: 35, min: 8, unit: 'kutu', loc: 'C3' },
  { name: 'Kahve Kreması 200lü', sku: 'MTF-008', barcode: '8690000000088', stock: 20, min: 5, unit: 'kutu', loc: 'C3' },
  { name: 'Bisküvi Çeşit 3lü Paket', sku: 'MTF-009', barcode: '8690000000089', stock: 50, min: 12, unit: 'paket', loc: 'C3' },
  { name: 'Maden Suyu 330ml (24lü)', sku: 'MTF-010', barcode: '8690000000090', stock: 15, min: 4, unit: 'koli', loc: 'C3' },

  // DEPO EKİPMANLARI (D1)
  { name: 'Palet Plastik 80x120', sku: 'DEP-001', barcode: '8690000000091', stock: 20, min: 5, unit: 'adet', loc: 'D1' },
  { name: 'Taşıma Arabası 300kg', sku: 'DEP-002', barcode: '8690000000092', stock: 4, min: 1, unit: 'adet', loc: 'D1' },
  { name: 'Bant Kesici Metal', sku: 'DEP-003', barcode: '8690000000093', stock: 12, min: 3, unit: 'adet', loc: 'D1' },
  { name: 'Etiket Yazıcı Şerit 12mm', sku: 'DEP-004', barcode: '8690000000094', stock: 30, min: 8, unit: 'adet', loc: 'D1' },
  { name: 'Spiral Kablo Bağı 100lü', sku: 'DEP-005', barcode: '8690000000095', stock: 60, min: 15, unit: 'paket', loc: 'D1' },
  { name: 'Kutu Kesici Maket Bıçak', sku: 'DEP-006', barcode: '8690000000096', stock: 25, min: 6, unit: 'adet', loc: 'D1' },
  { name: 'Yedek Bıçak 10lu', sku: 'DEP-007', barcode: '8690000000097', stock: 40, min: 10, unit: 'paket', loc: 'D1' },
  { name: 'Raflar Plastik 5 Katlı', sku: 'DEP-008', barcode: '8690000000098', stock: 6, min: 2, unit: 'adet', loc: 'D1' },
  { name: 'Sarı İşaret Şeridi 50m', sku: 'DEP-009', barcode: '8690000000099', stock: 15, min: 4, unit: 'rulo', loc: 'D1' },
  { name: 'Barkod Okuyucu El Tipi', sku: 'DEP-010', barcode: '8690000000100', stock: 5, min: 2, unit: 'adet', loc: 'D1' },

  // ARAÇ MALZEMELERİ (34 ABC 123)
  { name: 'Araç Dezenfektan Spreyi', sku: 'ARC-001', barcode: '8690000000101', stock: 20, min: 5, unit: 'adet', loc: '34 ABC 123' },
  { name: 'Güneş Kremi SPF50 150ml', sku: 'ARC-002', barcode: '8690000000102', stock: 15, min: 4, unit: 'adet', loc: '34 ABC 123' },
  { name: 'Araç Paspası Kauçuk', sku: 'ARC-003', barcode: '8690000000103', stock: 8, min: 2, unit: 'set', loc: '34 ABC 123' },
  { name: 'Çekici Halat 3 Ton', sku: 'ARC-004', barcode: '8690000000104', stock: 3, min: 1, unit: 'adet', loc: '34 ABC 123' },
  { name: 'Araç Sigortası Seti', sku: 'ARC-005', barcode: '8690000000105', stock: 10, min: 3, unit: 'set', loc: '34 ABC 123' },

  // EKSTREmik düşük stoklu (kritik uyarı için)
  { name: 'Pil AA 4lü', sku: 'EXT-001', barcode: '8690000000106', stock: 3, min: 20, unit: 'paket', loc: 'A1' },
  { name: 'Pil AAA 4lü', sku: 'EXT-002', barcode: '8690000000107', stock: 2, min: 15, unit: 'paket', loc: 'A1' },
  { name: 'Yazıcı Toner Siyah', sku: 'EXT-003', barcode: '8690000000108', stock: 1, min: 4, unit: 'adet', loc: 'A3' },
  { name: 'Uzatma Kablosu 10m', sku: 'EXT-004', barcode: '8690000000109', stock: 2, min: 5, unit: 'adet', loc: 'D1' },
  { name: 'Amortisör Bantı 5m', sku: 'EXT-005', barcode: '8690000000110', stock: 0, min: 8, unit: 'rulo', loc: 'B2' },

  // YEDEK PARÇA (E1)
  { name: 'Vida Seti M3 (100 adet)', sku: 'YDK-001', barcode: '8690000000111', stock: 300, min: 50, unit: 'kutu', loc: 'E1' },
  { name: 'Somun Seti M4 (50 adet)', sku: 'YDK-002', barcode: '8690000000112', stock: 200, min: 40, unit: 'kutu', loc: 'E1' },
  { name: 'Plastik Dübel 8mm 50li', sku: 'YDK-003', barcode: '8690000000113', stock: 150, min: 30, unit: 'paket', loc: 'E1' },
  { name: 'Çivi 60mm 1kg', sku: 'YDK-004', barcode: '8690000000114', stock: 20, min: 5, unit: 'kg', loc: 'E1' },
  { name: 'Sigorta 10A 5li', sku: 'YDK-005', barcode: '8690000000115', stock: 40, min: 10, unit: 'paket', loc: 'E1' },
  { name: 'Priz Fiş 2li', sku: 'YDK-006', barcode: '8690000000116', stock: 25, min: 6, unit: 'adet', loc: 'E1' },
  { name: 'Beyaz Led Ampul E27', sku: 'YDK-007', barcode: '8690000000117', stock: 35, min: 8, unit: 'adet', loc: 'E1' },
  { name: 'Bant İzolasyon 18mm', sku: 'YDK-008', barcode: '8690000000118', stock: 50, min: 12, unit: 'rulo', loc: 'E1' },
  { name: 'Silikon Dolgu 300ml', sku: 'YDK-009', barcode: '8690000000119', stock: 18, min: 5, unit: 'adet', loc: 'E1' },
  { name: 'Tornavida Seti 6lı', sku: 'YDK-010', barcode: '8690000000120', stock: 12, min: 3, unit: 'set', loc: 'E1' },
];

async function run() {
  // 1) Admin girişi – referer ile
  const REFERER = `https://${PROJECT_ID}.firebaseapp.com`;
  const headers = {
    'Content-Type': 'application/json',
    'Referer': REFERER,
    'Origin': REFERER,
  };

  console.log('🔐 Admin hesabına giriş yapılıyor...');
  const loginRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }),
    }
  );
  const loginData = await loginRes.json();
  if (loginData.error) {
    console.error('❌ Giriş hatası:', loginData.error.message);
    process.exit(1);
  }

  const { idToken, localId: uid } = loginData;
  console.log(`✅ Giriş başarılı. UID: ${uid}`);
  console.log(`\n📦 ${products.length} ürün Firestore'a yazılıyor...\n`);

  let success = 0;
  let fail = 0;

  for (const p of products) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products/${uid}/items`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        fields: {
          name:         { stringValue: p.name },
          sku:          { stringValue: p.sku },
          barcode:      { stringValue: p.barcode },
          currentStock: { integerValue: p.stock },
          minStock:     { integerValue: p.min },
          unit:         { stringValue: p.unit },
          locationCode: { stringValue: p.loc },
          description:  { stringValue: '' },
          createdAt:    { timestampValue: new Date().toISOString() },
          updatedAt:    { timestampValue: new Date().toISOString() },
        },
      }),
    });

    if (res.ok) {
      success++;
      process.stdout.write(`✓ ${p.sku} – ${p.name}\n`);
    } else {
      const err = await res.json();
      fail++;
      process.stdout.write(`✗ ${p.sku} – ${err?.error?.message ?? 'Hata'}\n`);
    }

    // Rate limiting için kısa bekleme
    await new Promise(r => setTimeout(r, 60));
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Başarılı : ${success} ürün`);
  if (fail > 0) console.log(`❌ Başarısız: ${fail} ürün`);
  console.log(`📍 Lokasyonlar: A1, A2, A3, B1, B2, B3, C1, C2, C3, D1, E1, 34 ABC 123`);
  console.log('─'.repeat(50));
}

run().catch(e => {
  console.error('❌ Beklenmeyen hata:', e.message);
  process.exit(1);
});
