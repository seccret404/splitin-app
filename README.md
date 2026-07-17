<div align="center">

# SplitIn

### Bagi tagihan nongkrong, anti ribut.

Aplikasi *bill splitter* untuk anak muda Indonesia — input menu, pilih siapa yang ikut,
langsung tahu jatah tiap orang, lalu tagih lewat WhatsApp. Dibangun dengan
**React Native (Expo) + NativeWind + TypeScript**.

`Expo SDK 52` · `Expo Router` · `NativeWind 4` · `TypeScript` · `Dwibahasa ID/EN`

</div>

---

## Apa itu SplitIn?

Tiap habis nongkrong bareng, ujung-ujungnya ribet: siapa pesan apa, kena pajak &
*service charge* berapa, terus nagihnya gimana. **SplitIn** menyelesaikan seluruh
alur itu dalam satu aplikasi:

1. **Hitung** — masukkan menu + harga, tandai siapa pesan apa (atau bagi rata),
   pajak/service/diskon dibagi otomatis dan proporsional.
2. **Bagikan** — hasilnya jadi "struk" estetik yang bisa di-*share* sebagai gambar
   ke story IG/TikTok, atau rekap teks rapi ke WhatsApp.
3. **Tagih & lunasi** — tandai siapa sudah bayar, rekap utang berjalan lintas sesi,
   dan kirim tagihan lengkap dengan nomor e-wallet kamu via WhatsApp.

Tanpa registrasi — akun otomatis nempel di perangkat, semua data tersimpan lokal di HP.

---

## Fitur

| Fitur | Penjelasan |
|---|---|
| **Splash & onboarding** | Splash beranimasi, lalu sekali isi nama + avatar (emoji & warna). |
| **Login by-device** | Tanpa password/registrasi. Identitas tersimpan di perangkat (AsyncStorage). |
| **Split per pesanan** | Tiap menu di-assign ke orang yang memesannya; tiap orang bayar sesuai porsinya. |
| **Split rata** | Mode "patungan" — total dibagi rata ke semua orang. |
| **Pajak, service & diskon** | PB1 / service charge (preset %) + diskon flat, dibagi proporsional ke tiap orang. |
| **Pembulatan presisi** | Sisa pembulatan diserap orang dengan tagihan terbesar → Σ jatah selalu = total. |
| **Struk estetik** | Hasil di-render jadi kartu cantik & di-*capture* jadi gambar PNG siap share. |
| **Foto background** | Tambah satu foto sebagai latar struk biar makin estetik untuk konten medsos. |
| **Share ke WhatsApp** | Rekap teks kreatif (per orang + rincian) langsung ke WhatsApp. |
| **Tagih & status lunas** | Centang siapa sudah bayar, tombol tagih per orang lewat WA. |
| **Utang berjalan** | Tab *Tagih*: rekap siapa belum bayar berapa, akumulasi lintas semua sesi. |
| **Tujuan pembayaran** | Simpan e-wallet (QRIS/GoPay/OVO/Dana/ShopeePay) — ikut otomatis saat menagih. |
| **Riwayat** | Semua sesi tersimpan lokal, bisa dibuka ulang & dihapus. |
| **SplitIn Wrapped** | Recap ala Spotify Wrapped (persona, partner setia, menu favorit) dalam kartu Story 9:16. |
| **Dwibahasa (ID/EN)** | Ganti bahasa di Profil; default mengikuti bahasa HP. |
| **Tema light bersih** | Palet putih + abu + teal + oranye + slate, ikon vektor (Ionicons), haptics. |

> **Segera hadir:** scan struk otomatis (OCR) — foto struk, menu & harga keisi sendiri.

---

## Teknologi

| Kategori | Teknologi |
|---|---|
| **Framework** | [Expo](https://expo.dev) SDK 52 · React Native 0.76 |
| **Bahasa** | TypeScript (strict) |
| **Navigasi** | [Expo Router](https://docs.expo.dev/router/introduction/) v4 (file-based, typed routes) |
| **Styling** | [NativeWind](https://www.nativewind.dev) 4 (Tailwind CSS untuk RN) |
| **Animasi** | React Native Reanimated |
| **Ikon** | `@expo/vector-icons` (Ionicons) |
| **Font** | Inter (`@expo-google-fonts/inter`) |
| **Penyimpanan** | `@react-native-async-storage/async-storage` (lokal) |
| **i18n** | `expo-localization` + kamus ID/EN buatan sendiri |
| **Media & share** | `expo-image-picker` · `react-native-view-shot` · `expo-sharing` · `expo-linking` |
| **Lainnya** | `expo-linear-gradient` · `expo-haptics` |
| **Testing** | `tsx` (unit test untuk logika murni) |

---

## Menjalankan

### Prasyarat
- Node.js 18+
- App **Expo Go** di HP (Android/iOS), atau emulator Android / simulator iOS

### Instalasi & jalankan
```bash
npm install --legacy-peer-deps
npx expo start
```
Scan QR yang muncul pakai **Expo Go**, atau tekan `a` (Android) / `i` (iOS).

> Fitur foto & share WhatsApp paling pas diuji di **perangkat fisik**.

### Skrip yang tersedia
| Perintah | Fungsi |
|---|---|
| `npm start` | Jalankan Metro / Expo dev server |
| `npm run android` | Buka di Android |
| `npm run ios` | Buka di iOS |
| `npm run web` | Buka di browser |
| `npm run typecheck` | Cek TypeScript (`tsc --noEmit`) |
| `npm test` | Jalankan unit test logika split & fitur |

---

## Struktur Proyek

```
app/                       # Rute (Expo Router, file-based)
  _layout.tsx              #   Root: font, provider, splash, stack
  index.tsx                #   Splash beranimasi -> onboarding / tabs
  onboarding.tsx           #   Login by-device (nama + avatar)
  split.tsx                #   Form bikin split (menu, orang, pajak)
  result.tsx               #   Struk estetik + foto + share WA/gambar
  wrapped.tsx              #   SplitIn Wrapped (kartu Story 9:16)
  (tabs)/
    _layout.tsx            #   Tab bar (Split, Tagih, History, Profil)
    index.tsx              #   Home / dashboard
    tagih.tsx              #   Utang berjalan & tagih
    history.tsx            #   Riwayat split
    profile.tsx            #   Profil, e-wallet, bahasa, reset

src/
  components/ui/           # Design system - 1 file per komponen + barrel
  context/AppContext.tsx   # State global (user, history, bahasa)
  data/avatars.ts          # Palet warna & emoji avatar
  i18n/                    # translations.ts (ID/EN), useT/useFmt, detect
  lib/
    split.ts               # Engine perhitungan split (inti aplikasi)
    debt.ts                # Agregasi utang lintas sesi
    stats.ts               # Engine SplitIn Wrapped
    share.ts               # Teks WhatsApp + share gambar
    storage.ts             # AsyncStorage (user, history, lang)
    format.ts              # Format Rupiah, tanggal, waktu relatif
    id.ts                  # Generator id lokal
  types.ts                 # Tipe data (Bill, Diner, BillItem, User, ...)

scripts/                   # Unit test (test-split.ts, test-features.ts)
```

---

## Cara perhitungan ([`src/lib/split.ts`](src/lib/split.ts))

1. **Subtotal** = Σ (harga × qty) tiap menu.
2. **Mode per pesanan** — biaya tiap menu dibagi ke orang yang menandainya
   (kosong = semua). Pajak, service, dan diskon dibagi **proporsional** terhadap
   porsi tiap orang.
3. **Mode rata** — total tagihan dibagi rata ke semua orang.
4. **Pembulatan** — sisa rupiah diserap orang dengan tagihan terbesar, sehingga
   jumlah seluruh jatah selalu **persis sama** dengan total tagihan (anti "uang bocor").

---

## Testing

Logika inti (perhitungan split, agregasi utang, Wrapped) di-unit-test tanpa perlu
menjalankan UI:

```bash
npm test
```
Mencakup skenario: split per pesanan, bagi rata, item tanpa assign, pajak/service
proporsional, pembulatan, diskon, qty, agregasi utang & status lunas, dan recap Wrapped.

---

## Internationalization (i18n)

- Semua teks UI, pesan WhatsApp, dan Wrapped ditarik dari [`src/i18n/translations.ts`](src/i18n/translations.ts).
- TypeScript memaksa kamus `id` & `en` punya struktur key yang **identik** — tidak ada
  teks yang ketinggalan diterjemahkan.
- Bahasa default mengikuti perangkat (`expo-localization`); bisa diganti manual di Profil
  dan tersimpan.
- Menambah bahasa baru = tambah satu objek di `translations.ts`.

---

## Design Tokens ([`tailwind.config.js`](tailwind.config.js))

| Token | Nilai | Pemakaian |
|---|---|---|
| `ink` | `#FFFFFF` | Background halaman |
| `card` | `#F4F6F7` | Card default (panel abu) |
| `surface` | `#E9ECEE` | Input, chip, inset kecil |
| `fg` | `#303841` | Teks utama (slate) |
| `muted` | `#6B7580` | Teks sekunder |
| `primary` | `#76ABAE` | Teal — aksen utama, tab aktif |
| `accent` | `#FF5722` | Oranye — CTA & highlight |

Font: **Inter** (Regular -> Black). Sudut: card 16px, tombol/input 12px. Ikon: Ionicons.

---

## Data & Privasi

- **100% lokal** — semua data (profil, riwayat, bahasa) disimpan di AsyncStorage HP.
- Tidak ada server, akun cloud, atau tracking.
- "Login" hanya identitas yang nempel di perangkat; reset kapan saja lewat Profil.

---

## Roadmap

- [ ] Scan struk via OCR (foto -> menu otomatis)
- [ ] Squad/Circle tersimpan (grup teman tetap)
- [ ] Patungan langganan (Netflix/Spotify) + reminder bulanan
- [ ] Sync antar perangkat & split real-time bareng

---

<div align="center">

Dibikin buat anak nongkrong.

</div>
