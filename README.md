# Text Emotion Analyzer — NRC Emotion Lexicon

Aplikasi web untuk menganalisis emosi dalam teks menggunakan **NRC Emotion Lexicon**. Input teks diproses melalui pipeline preprocessing NLP, lalu setiap token dicocokkan ke leksikon untuk menghasilkan distribusi 10 kategori emosi.

---

## Fitur

- Load otomatis NRC Emotion Lexicon (~14.000+ kata) saat aplikasi pertama dibuka
- Pipeline preprocessing teks: Case Folding → Remove Punctuation → Tokenizing → Stemming
- Analisis 10 kategori emosi: `anger`, `anticipation`, `disgust`, `fear`, `joy`, `sadness`, `surprise`, `trust`, `positive`, `negative`
- Tampilan distribusi emosi per token (detail kata + stem)
- Bar chart persentase dan intensitas emosi
- Riwayat 5 analisis terakhir (bisa diklik untuk load ulang)

---

## Teknologi

| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 18 | UI framework |
| Tailwind CSS | 3 | Styling |
| NRC Emotion Lexicon | v0.92 | Data leksikon emosi |
| Create React App | 5 | Build toolchain |

---

## Cara Kerja Aplikasi

### 1. Load Lexicon

Saat pertama dibuka, aplikasi fetch file teks leksikon dari `public/NRC-Emotion-Lexicon-Wordlevel-v0.92.txt`. File ini berformat TSV (Tab-Separated Values) dengan struktur:

```
word      emotion   value
accept    fear      0
accept    anger     0
accept    trust     1
...
```

Setiap baris adalah pasangan `kata + emosi + nilai (0 atau 1)`. Aplikasi mem-parse semua baris dan menyimpannya sebagai object JavaScript:

```js
{
  "accept": { fear: false, anger: false, trust: true, ... },
  "love":   { joy: true, trust: true, positive: true, ... },
  ...
}
```

Jika file gagal dimuat, ada fallback lexicon minimal.

---

### 2. Pipeline Preprocessing

Setiap teks yang dianalisis diproses dalam 4 tahap berurutan:

```
Input Teks
    |
    v
[1] Case Folding       →  semua huruf jadi lowercase
    |
    v
[2] Remove Punctuation →  hapus semua tanda baca (!.,?'" dll)
    |
    v
[3] Tokenizing         →  pecah teks jadi array kata per spasi
    |
    v
[4] Stemming           →  potong suffix umum bahasa Inggris
                           (-ing, -ed, -s, -es, -ly)
```

Contoh:

```
Input       : "She's feeling so happy and joyful!"
Case Fold   : "she's feeling so happy and joyful!"
Remove Punct: "shes feeling so happy and joyful"
Tokenize    : ["shes", "feeling", "so", "happy", "and", "joyful"]
Stemming    : ["she", "feel", "so", "happy", "and", "joyful"]
```

---

### 3. Pencocokan Leksikon

Untuk setiap token, aplikasi melakukan 2 kali lookup ke leksikon:

1. Cek token **original** (sebelum stemming)
2. Jika ada stemmed version berbeda, cek token **setelah stemming** juga

Emosi yang ditemukan dikumpulkan per token, lalu dijumlah secara keseluruhan.

---

### 4. Kalkulasi Hasil

```
totalEmotions = jumlah semua emosi yang terdeteksi di seluruh token

persentase[emosi] = (count[emosi] / totalEmotions) * 100
```

---

## Struktur Folder

```
src/
├── constants/
│   └── emotions.js             # Data emotionColors & allEmotions (shared ke semua section)
│
├── pages/
│   └── home.js                 # Semua state, semua logic, render sections
│
├── sections/
│   ├── LoadingSection.js       # Layar loading saat lexicon pertama dimuat
│   ├── HeaderSection.js        # Judul app + info jumlah kata di lexicon
│   ├── InputSection.js         # Textarea input, tombol analisis, hasil preprocessing, distribusi emosi
│   ├── HistorySection.js       # Riwayat 5 analisis terakhir
│   ├── WordDetailSection.js    # Detail emosi per kata/token
│   └── VisualizationSection.js # Bar chart persentase & intensitas
│
├── App.js                      # Entry point, hanya render <Home />
├── App.css
├── index.js
└── index.css

public/
└── NRC-Emotion-Lexicon-Wordlevel-v0.92.txt   # File lexicon utama
```

**Aturan folder:**
- Semua **state dan logic** ada di `pages/home.js`
- Setiap **section** hanya terima props dan render UI, tidak ada logic di dalamnya
- Konstanta yang dipakai lebih dari satu section ada di `constants/emotions.js`

---

## Instalasi & Menjalankan

### Opsi A — Docker (paling mudah, tanpa install Node.js)

Cukup punya **Docker** + **Docker Compose**.

```bash
# 1. Clone repo
git clone <url-repo>
cd nrc-emotion-lexicon

# 2. Build & jalankan
docker compose up --build
```

Buka browser ke `http://localhost:3000`. Untuk berhenti: `docker compose down`.

Tanpa Compose:

```bash
docker build -t nrc-emotion-lexicon .
docker run -p 3000:80 nrc-emotion-lexicon
```

> Image produksi memakai **multi-stage build**: tahap pertama build dengan Node,
> tahap kedua menyajikan file statis lewat **Nginx** (dikonfigurasi untuk SPA).

### Opsi B — Lokal dengan Node.js

#### Prasyarat

- Node.js >= 14
- npm >= 6

#### Langkah

```bash
# 1. Clone repo
git clone <url-repo>
cd nrc-emotion-lexicon

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm start
```

Aplikasi akan terbuka otomatis di `http://localhost:3000`.

> **Penting:** File `NRC-Emotion-Lexicon-Wordlevel-v0.92.txt` harus ada di folder `public/`. Tanpa file ini, aplikasi akan fallback ke lexicon minimal (hanya ~4 kata contoh).

### Build Production

```bash
npm run build
```

Output ada di folder `build/`, siap di-deploy ke static hosting (Vercel, Netlify, GitHub Pages, dll).

---

## Cara Menggunakan

1. **Tunggu loading** — saat pertama dibuka, aplikasi load lexicon. Progress bar akan muncul sampai selesai.
2. **Ketik atau paste teks** ke dalam textarea.
3. **Klik "Analisis Emosi"** — hasil muncul di bawah textarea.
4. **Baca hasil:**
   - *Langkah Preprocessing* — lihat tiap tahap transformasi teks
   - *Distribusi Emosi* — mini bar chart 10 emosi
   - *Detail Kata* (sidebar kanan bawah) — emosi yang terdeteksi per token
   - *Visualisasi Data* (bawah halaman) — bar chart lengkap persentase & intensitas
5. **Klik item riwayat** (sidebar kanan atas) untuk load ulang analisis sebelumnya.
6. **Klik "Clear"** untuk reset input dan hasil.

---

## Kategori Emosi NRC

| Emosi | Keterangan |
|---|---|
| anger | Emosi dasar — kemarahan |
| anticipation | Emosi dasar — antisipasi/harapan |
| disgust | Emosi dasar — jijik |
| fear | Emosi dasar — ketakutan |
| joy | Emosi dasar — kebahagiaan |
| sadness | Emosi dasar — kesedihan |
| surprise | Emosi dasar — kejutan |
| trust | Emosi dasar — kepercayaan |
| positive | Sentimen positif |
| negative | Sentimen negatif |

NRC Emotion Lexicon dibuat oleh **Saif Mohammad** dari National Research Council Canada. Leksikon ini memetakan kata-kata bahasa Inggris ke 8 emosi dasar Plutchik + 2 sentimen (positif/negatif).

---

## Catatan

- Stemming yang dipakai adalah **rule-based sederhana** (suffix stripping: `-ing`, `-ed`, `-s`, `-es`, `-ly`), bukan stemmer linguistik penuh. Akurasi bisa meningkat jika diganti library seperti `stemmer` atau `natural`.
- Leksikon hanya mencakup bahasa **Inggris**. Teks bahasa Indonesia tidak akan banyak menghasilkan match.
- Stopword (the, is, and, dll) tidak difilter — ikut dianalisis, tapi umumnya tidak ada di leksikon emosi.
