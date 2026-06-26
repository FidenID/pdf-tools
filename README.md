# FileTools 🗜️

All-in-one web-based file tools: compress, convert, and encrypt files — running locally on your server with a clean web UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🖼️ Image Compression
- Compress JPG, PNG, WebP, AVIF images
- Adjustable quality (1–100%)
- Optional max-width resize
- Output format: JPEG, WebP, PNG, AVIF
- Batch compression with per-file size stats

### 📦 ZIP Compression
- Bundle multiple files into a ZIP archive
- Maximum DEFLATE compression (level 9)
- Custom archive name
- Drag-and-drop file ordering

### 📄 Document Converter (requires LibreOffice)
| From | To |
|------|----|
| PDF | DOCX, XLSX, PPTX, HTML, TXT, ODT |
| Word (DOCX/DOC) | PDF, HTML, TXT, ODT, RTF |
| Excel (XLSX/XLS) | PDF, CSV, HTML, ODS |
| PowerPoint (PPTX/PPT) | PDF, HTML, ODP |
| ODT/RTF/HTML | PDF, DOCX, TXT |

### 🖼️ Images → PDF
- Combine multiple images into a single PDF
- Supports JPG, PNG, WebP, GIF
- Drag to reorder pages

### 📸 PDF → Images (requires poppler-utils)
- Extract each PDF page as PNG or JPG
- Configurable DPI (72–300)
- Single page: direct image download
- Multi-page: ZIP of all images

### 🔐 PDF Encryption (requires qpdf)
- Encrypt PDF with user + owner passwords
- 128-bit or 256-bit AES encryption
- Decrypt password-protected PDFs

### 🗜️ PDF Compression (requires Ghostscript)
- 4 quality presets: Screen, eBook, Printer, Prepress
- Fallback to pdf-lib re-save if Ghostscript unavailable

### ✂️ PDF Split
- Split all pages into individual PDF files
- Custom page range (e.g. `1-3,5,7-9`)
- Multi-page output as ZIP

### 🔗 PDF Merge
- Combine multiple PDFs into one
- Drag to reorder before merging

## 🚀 Quick Start

```bash
# Install dependencies (Node 18+ or Bun)
npm install       # or: bun install

# Run development server
npm run dev       # or: bun dev

# Build for production
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Server Requirements

The following tools enable additional features. Install them on the server:

```bash
# Ubuntu/Debian
sudo apt install libreoffice    # Document conversion
sudo apt install qpdf           # PDF encryption/decryption
sudo apt install poppler-utils  # PDF → images
sudo apt install ghostscript    # PDF compression

# macOS (Homebrew)
brew install libreoffice qpdf poppler ghostscript
```

The app works without these tools — features that need them will show a helpful error with the install command.

## 📁 Project Structure

```
file-tools/
├── app/
│   ├── api/
│   │   ├── compress/
│   │   │   ├── image/route.ts     # Image compression
│   │   │   └── zip/route.ts       # ZIP creation
│   │   ├── convert/
│   │   │   ├── office/route.ts    # LibreOffice conversion
│   │   │   ├── images-to-pdf/     # Images → PDF
│   │   │   └── pdf-to-images/     # PDF → Images
│   │   └── pdf/
│   │       ├── encrypt/route.ts   # PDF encryption
│   │       ├── decrypt/route.ts   # PDF decryption
│   │       ├── merge/route.ts     # PDF merge
│   │       ├── split/route.ts     # PDF split
│   │       └── compress/route.ts  # PDF compression
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── components/
    ├── FileDropzone.tsx
    ├── ToolCard.tsx
    └── tools/
        ├── ImageCompress.tsx
        ├── ZipCompress.tsx
        ├── OfficeConverter.tsx
        ├── PdfEncrypt.tsx
        ├── PdfCompress.tsx
        ├── PdfMerge.tsx
        ├── PdfSplit.tsx
        ├── PdfToImages.tsx
        └── ImagesToPdf.tsx
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Image processing**: sharp
- **PDF manipulation**: pdf-lib
- **Archives**: JSZip
- **Icons**: lucide-react
- **Runtime**: Node.js / Bun

## 📜 License

MIT
