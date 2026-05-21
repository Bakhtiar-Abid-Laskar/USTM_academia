<div align="center">

# 📚 USTM Academia

**The Official Academic Resource Portal for USTM**

*Find Your Papers. Ace Your Exams.*

[![Live Site](https://img.shields.io/badge/Live-ustm--academia.vercel.app-blue?style=flat-square&logo=vercel)](https://ustm-academia.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com)
[![Algolia](https://img.shields.io/badge/Algolia-Search-5468FF?style=flat-square&logo=algolia)](https://algolia.com)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [PWA Support](#-pwa-support)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 Overview

**USTM Academia** is a centralized, web-based academic resource portal built exclusively for
students of the **University of Science and Technology Meghalaya (USTM)**. The platform provides
structured, on-demand access to critical academic resources — **previous year question papers (PYQs)**
and **course syllabi** — organized logically by **Course → Semester → Subject**.

**🌐 Live at:** [ustm-academia.vercel.app](https://ustm-academia.vercel.app)

### Problem Solved

USTM students currently lack a single authoritative source for question papers and syllabi,
leading to:
- ❌ Students relying on informal WhatsApp groups and unverified sources
- ❌ Inefficient manual searches across fragmented platforms
- ❌ Potential access to incorrect or outdated material
- ❌ Mobile-unfriendly document storage

### Solution

USTM Academia eliminates these challenges by providing:
- ✅ One centralized, reliable repository for all academic documents
- ✅ Fast, mobile-friendly access — no login required for students
- ✅ Algolia-powered instant search across all documents
- ✅ Secure admin dashboard for content management
- ✅ PWA support — installable on mobile devices
- ✅ Google Drive integration for scalable PDF storage

### Key Value Proposition

🚀 **For Students:** Instant, verified access to PYQs and syllabi — zero friction, no login.
🔐 **For Admins:** Centralized content management with Supabase Auth and role-based access.
📱 **For Everyone:** Fully responsive PWA, optimized for mobile and desktop.

---

## ✨ Features

- **🌐 Public Student Portal**
  - Browse courses, semesters, and subjects without login
  - Algolia-powered instant search with faceted filters (Department, Course, Type, Exam, Year)
  - In-browser PDF viewing via Google Drive embed
  - Download PDFs directly
  - Fully responsive mobile-first design with smooth animations

- **🔐 Secure Admin Dashboard**
  - Supabase-based authentication and authorization
  - Full CRUD for Departments, Courses, Semesters, Subjects, and Documents
  - Single and bulk PDF upload with Google Drive integration
  - Document replacement and metadata editing
  - Real-time upload logs and audit trail
  - Admin settings management

- **📄 Document Management**
  - Document types: Syllabus, Previous Year Question Papers
  - Exam types: Mid-term, End-semester
  - Metadata tagging: year, exam type, document type, subject code
  - Google Drive storage backend with auto-generated preview/view/download URLs
  - Algolia auto-sync via Supabase webhooks

- **⚡ Performance & Accessibility**
  - Server-side rendering (SSR) and Incremental Static Regeneration (ISR, 1-hour cache)
  - PWA with offline fallback page and service worker
  - WCAG 2.1 AA accessible UI (focus rings, ARIA labels, contrast compliance)
  - SEO-optimized: Open Graph, Twitter Cards, dynamic metadata, sitemap.xml, robots.txt
  - Rate-limited search API to prevent abuse

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14.2.35 (App Router) | Server components, SSR, ISR, API routes |
| **Language** | TypeScript 5 | End-to-end type safety |
| **UI** | React 18 | Component-based UI |
| **Styling** | Tailwind CSS 3.4, PostCSS | Utility-first responsive design |
| **UI Components** | Radix UI, shadcn/ui, Lucide Icons | Accessible, composable UI primitives |
| **Forms** | React Hook Form 7, Zod 4 | Type-safe form handling & validation |
| **Database** | PostgreSQL (Supabase) | Relational data with full-text search |
| **Authentication** | Supabase Auth | Secure admin authentication |
| **Search** | Algolia (InstantSearch React 7) | Real-time faceted search |
| **File Storage** | Google Drive API (googleapis) | Scalable PDF storage & preview |
| **PDF Viewer** | Google Drive embed + react-pdf | Browser-based document viewing |
| **Security** | bcryptjs, rate limiting | Password hashing & API protection |
| **Hosting** | Vercel | Edge-optimized deployment |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0 (recommended) or npm/yarn
- **Git**
- **Supabase Account** — [supabase.com](https://supabase.com) (free tier)
- **Google Cloud Project** with Drive API enabled
- **Algolia Account** — [algolia.com](https://algolia.com) (free tier)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Bakhtiar-Abid-Laskar/USTM_academia.git
cd USTM_academia
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Drive (OAuth2 flow)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_PDF_UPLOAD_SIZE_MB=50

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your-algolia-app-id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your-algolia-search-key
ALGOLIA_ADMIN_KEY=your-algolia-admin-key

# Supabase Webhook Secrets (for Algolia auto-sync)
SUPABASE_WEBHOOK_SECRET1=your-webhook-secret
SUPABASE_WEBHOOK_SECRET2=your-webhook-secret
SUPABASE_WEBHOOK_SECRET3=your-webhook-secret
```

4. **Set up Supabase database:**

Import the schema into your Supabase project via the SQL Editor:

```bash
# The complete schema is located at:
supabase/001_complete_schema.sql
```

See [supabase/README.md](./supabase/README.md) for detailed database setup instructions.

5. **Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side operations | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | ✅ |
| `GOOGLE_REDIRECT_URI` | OAuth2 redirect URI | ✅ |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth2 refresh token | ✅ |
| `GOOGLE_DRIVE_FOLDER_ID` | Target Google Drive folder for uploads | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application base URL | ✅ |
| `MAX_PDF_UPLOAD_SIZE_MB` | Maximum PDF upload size in MB | ❌ (default: `50`) |
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Algolia application ID | ✅ |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | Algolia search-only API key | ✅ |
| `ALGOLIA_ADMIN_KEY` | Algolia admin API key (for indexing) | ✅ |
| `SUPABASE_WEBHOOK_SECRET1/2/3` | Webhook secrets for Algolia auto-sync | ✅ |

---

## 💻 Usage

### For Students (Public Portal)

**Browse Documents:**

1. Visit [ustm-academia.vercel.app](https://ustm-academia.vercel.app)
2. Browse courses from the homepage or navigate to **Courses**
3. Select a course → semester → subject
4. View PDFs in-browser or download them

**Search Documents:**

1. Click the **Search** icon in the header or navigate to `/search`
2. Type keywords (subject name, course, paper type, etc.)
3. Use faceted filters: Department, Course, Type, Exam, Year
4. Click any result card to view the document

### For Administrators (Dashboard)

1. Navigate to `/admin/login` and sign in with admin credentials
2. Access the dashboard at `/admin/dashboard`
3. Manage the academic hierarchy:
   - **Departments** → Courses → Semesters → Subjects
4. Upload documents:
   - **Single upload:** `/admin/documents/upload`
   - **Bulk upload:** `/admin/documents/bulk-upload` (multiple PDFs at once)
5. Documents are automatically synced to Algolia search via Supabase webhooks

---

## 📁 Project Structure

```
ustm-academia/
├── public/                              # Static assets
│   ├── icons/                           # PWA icons (192x192, 512x512)
│   ├── manifest.json                    # PWA manifest
│   ├── sw.js                            # Service worker
│   ├── offline.html                     # Offline fallback page
│   ├── robots.txt                       # SEO robots
│   └── ustm-logo.png                    # USTM logo
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── api/                         # API routes
│   │   │   ├── admin/                   # Protected admin endpoints
│   │   │   │   ├── bulk-upload/         # Bulk PDF upload
│   │   │   │   ├── courses/             # Course CRUD
│   │   │   │   ├── departments/         # Department CRUD
│   │   │   │   ├── documents/           # Document CRUD + replace
│   │   │   │   ├── semesters/           # Semester CRUD
│   │   │   │   ├── subjects/            # Subject CRUD
│   │   │   │   └── upload/              # Single PDF upload
│   │   │   ├── search/                  # Public search (rate-limited)
│   │   │   ├── courses/                 # Public course data
│   │   │   └── webhooks/algolia/        # Algolia auto-sync webhook
│   │   ├── admin/                       # Admin pages
│   │   │   ├── (dashboard)/             # Dashboard layout group
│   │   │   │   ├── dashboard/           # Admin overview
│   │   │   │   ├── courses/             # Course management
│   │   │   │   ├── departments/         # Department management
│   │   │   │   ├── documents/           # Document management + bulk upload
│   │   │   │   ├── semesters/           # Semester management
│   │   │   │   ├── subjects/            # Subject management
│   │   │   │   └── settings/            # Admin settings
│   │   │   └── login/                   # Admin login page
│   │   ├── courses/                     # Public course browsing
│   │   │   └── [slug]/                  # Course → Semester → Subject hierarchy
│   │   │       └── [semester]/
│   │   │           └── [subject]/
│   │   ├── search/                      # Algolia-powered search page
│   │   ├── view/[id]/                   # Document PDF viewer
│   │   ├── about/                       # About page
│   │   ├── help/                        # Help page
│   │   ├── sitemap.xml/                 # Dynamic sitemap generation
│   │   ├── globals.css                  # Global styles & animations
│   │   └── layout.tsx                   # Root layout
│   ├── components/                      # React components
│   │   ├── Search/                      # Algolia search components
│   │   │   └── GlobalSearch.tsx         # InstantSearch + HitCards + Filters
│   │   ├── admin/                       # Admin-specific components
│   │   │   ├── sidebar.tsx              # Dashboard sidebar
│   │   │   └── breadcrumb.tsx           # Admin breadcrumbs
│   │   ├── public/                      # Public-facing components
│   │   │   └── layout.tsx               # PublicHeader + PublicFooter
│   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   └── ServiceWorkerRegister.tsx    # PWA service worker registration
│   ├── lib/                             # Utility functions
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser Supabase client
│   │   │   ├── server.ts                # Server Supabase client
│   │   │   └── middleware.ts            # Auth middleware
│   │   ├── google-drive.ts              # Google Drive API wrapper
│   │   ├── rate-limit.ts                # API rate limiting
│   │   ├── validations.ts               # Zod schemas for forms
│   │   └── utils.ts                     # Helper functions (cn, etc.)
│   ├── types/
│   │   └── index.ts                     # TypeScript type definitions
│   └── middleware.ts                    # Next.js request middleware (admin protection)
├── supabase/
│   ├── 001_complete_schema.sql          # Full database schema
│   └── README.md                        # Database setup guide
├── scripts/
│   └── sync-algolia.mjs                 # Manual Algolia full re-sync script
├── docs/
│   ├── android-build-guide.md           # Android APK build guide
│   └── pwa-apk-checklist.md             # PWA-to-APK checklist
├── package.json
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── postcss.config.mjs
```

---

## 🔌 API Reference

### Public Endpoints

#### Search Documents

```
GET /api/search?q={query}&page={0}&limit={20}
```

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `q` | string | Search query (max 200 chars) | `""` |
| `page` | number | Page number (0-indexed) | `0` |
| `limit` | number | Results per page (max 100) | `20` |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Data Structures - End Semester 2024",
      "year": 2024,
      "file_url": "https://drive.google.com/...",
      "is_downloadable": true,
      "course": { "id": "uuid", "short_name": "B.Tech CSE", "slug": "btech-cse" },
      "semester": { "id": "uuid", "label": "Semester 4", "semester_number": 4 },
      "subject": { "id": "uuid", "name": "Data Structures", "slug": "data-structures" },
      "document_type": { "id": "uuid", "name": "Question Paper", "slug": "question-paper" },
      "exam_type": { "id": "uuid", "name": "End Semester", "slug": "end-semester" }
    }
  ],
  "total": 42,
  "page": 0,
  "limit": 20,
  "pages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "query": "data structures"
}
```

**Rate Limit:** Search requests are rate-limited per client IP.

#### Get Courses

```
GET /api/courses
```

### Admin Endpoints (Protected)

All admin endpoints require Supabase session authentication via cookies.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/departments` | GET, POST | List/create departments |
| `/api/admin/courses` | GET, POST | List/create courses |
| `/api/admin/semesters` | GET, POST | List/create semesters |
| `/api/admin/subjects` | GET, POST | List/create subjects |
| `/api/admin/documents` | GET, POST, DELETE | List/create/delete documents |
| `/api/admin/documents/replace` | POST | Replace existing document PDF |
| `/api/admin/upload` | POST | Upload single PDF to Google Drive |
| `/api/admin/bulk-upload` | POST | Upload multiple PDFs to Google Drive |

#### Algolia Webhook (Auto-sync)

```
POST /api/webhooks/algolia
Authorization: Bearer <webhook_secret>
```

Triggered by Supabase database webhooks when documents, subjects, or courses are created/updated/deleted. Automatically keeps the Algolia search index in sync.

---

## 📱 PWA Support

USTM Academia is a Progressive Web App (PWA) and can be installed on mobile devices:

- **Service Worker:** Caches static assets for offline access
- **Offline Page:** Shows a branded offline fallback when network is unavailable
- **Installable:** "Add to Home Screen" prompt on supported browsers
- **App Manifest:** Custom icons, splash screen, standalone display mode

For building an Android APK from the PWA, see:
- [Android Build Guide](./docs/android-build-guide.md)
- [PWA-to-APK Checklist](./docs/pwa-apk-checklist.md)

---

## 🗺️ Roadmap

- [x] Next.js App Router setup with TypeScript
- [x] Supabase database schema and migrations
- [x] Supabase authentication for admins
- [x] Admin dashboard with full CRUD operations
- [x] Single and bulk PDF upload via Google Drive
- [x] Public student portal with course browsing
- [x] Algolia-powered instant search with faceted filters
- [x] ISR caching and performance optimization
- [x] PWA with service worker and offline support
- [x] SEO optimization (sitemap, Open Graph, meta tags)
- [x] Loading skeletons and smooth animations
- [x] Rate limiting on search API
- [ ] Email notifications for new uploads
- [ ] Advanced analytics dashboard
- [ ] Dark mode support
- [ ] Multi-language support (Hindi, Khasi)
- [ ] Notes and study material uploads by students

---

## 🤝 Contributing

Contributions from developers and the USTM community are welcome!

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/USTM_academia.git
   cd USTM_academia
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "feat: add feature description"
   ```
5. **Push** and **open a Pull Request** with a clear description

### Guidelines

- Follow TypeScript and Tailwind CSS best practices
- Ensure `pnpm build` passes without errors before submitting
- Update documentation for new features
- Reference related issues in PR descriptions

---

## 🙏 Acknowledgements

- **University of Science and Technology Meghalaya (USTM)** — for the vision and support
- **[Next.js](https://nextjs.org)** — React framework for production
- **[Supabase](https://supabase.com)** — PostgreSQL backend-as-a-service
- **[Algolia](https://algolia.com)** — Real-time search engine
- **[Radix UI](https://radix-ui.com)** — Accessible UI primitives
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first CSS framework
- **[Google Drive API](https://developers.google.com/drive)** — Scalable file storage
- **[Vercel](https://vercel.com)** — Edge-optimized hosting platform

### Built By

- **Bakhtiar Abid Laskar** — Lead Developer — [@Bakhtiar-Abid-Laskar](https://github.com/Bakhtiar-Abid-Laskar)

---

<div align="center">

**Made with ❤️ for USTM students**

[Live Site](https://ustm-academia.vercel.app) · [Report Bug](https://github.com/Bakhtiar-Abid-Laskar/USTM_academia/issues) · [Request Feature](https://github.com/Bakhtiar-Abid-Laskar/USTM_academia/issues)

</div>
