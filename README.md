<div align="center">

# 📚 USTM Academia

**The Academic Resource Portal for USTM**

*Find Your Papers. Ace Your Exams.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com)

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
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 Overview

**USTM Academia** is a centralized, web-based academic resource portal built exclusively for 
students of the **University of Science and Technology Meghalaya (USTM)**. The platform provides 
structured, on-demand access to critical academic resources—**previous year question papers** 
and **course syllabi**—organized logically by Course → Semester → Subject.

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
- ✅ Fast, mobile-friendly access without login requirements
- ✅ Secure admin dashboard for content management
- ✅ Advanced search and filtering capabilities
- ✅ Historical archives for exam trend analysis

### Key Value Proposition

🚀 **For Students:** Instant, verified access to academic resources without friction.  
🔐 **For Admins:** Centralized content management with role-based access control.  
📱 **For Everyone:** Fully responsive, optimized for mobile and desktop devices.

---

## ✨ Features

- **🌐 Public Student Portal**
  - ✅ Browse courses, semesters, and subjects without login
  - ✅ Advanced search and multi-filter capabilities
  - ✅ In-browser PDF viewer with download option
  - ✅ Fully responsive mobile-first design
  - ✅ Instant, cached document access

- **🔐 Secure Admin Dashboard**
  - ✅ Role-based authentication and authorization
  - ✅ Manage courses, semesters, subjects, and documents
  - ✅ Bulk PDF upload with Google Drive integration
  - ✅ Real-time upload logs and audit trail
  - ✅ Settings management for administrators

- **📄 Document Management**
  - ✅ Support for multiple document types (Syllabus, Question Papers, etc.)
  - ✅ Support for multiple exam types (Mid-term, End-semester, etc.)
  - ✅ Metadata tagging and categorization
  - ✅ Scalable Google Drive storage backend
  - ✅ Secure file access and permissions

- **⚡ Performance & Accessibility**
  - ✅ Optimized Lighthouse scores (Core Web Vitals compliant)
  - ✅ Server-side rendering for fast initial loads
  - ✅ Incremental static regeneration (ISR)
  - ✅ WCAG 2.1 AA accessibility standards
  - ✅ SEO-optimized metadata and schema

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Modern, type-safe UI framework |
| **Styling** | Tailwind CSS, PostCSS | Utility-first responsive design |
| **UI Components** | Radix UI, Lucide Icons | Accessible, composable UI library |
| **Forms** | React Hook Form, Zod | Type-safe form handling & validation |
| **Backend** | Next.js App Router, Supabase | Serverless API endpoints & database |
| **Database** | PostgreSQL (Supabase) | Relational data storage |
| **Authentication** | Supabase Auth | Secure admin authentication |
| **File Storage** | Google Drive API | Scalable PDF storage backend |
| **PDF Viewer** | react-pdf | Browser-based document viewing |
| **Security** | bcryptjs | Password hashing & encryption |
| **Type Safety** | TypeScript 5 | Full end-to-end type coverage |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0 (or npm/yarn)
- **Git**
- **Supabase Account** (free tier available)
- **Google Cloud Project** with Drive API enabled

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/ustm-academia.git
cd ustm-academia
```

2. **Install dependencies:**

```bash
pnpm install
# or: npm install / yarn install
```

3. **Set up environment variables:**

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Drive
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...",...}'
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
MAX_PDF_UPLOAD_SIZE_MB=25

# Admin secret
ADMIN_SECRET_KEY=your-secure-random-key
```

Refer to [.env.local.example](./.env.local.example) for all available variables.

4. **Set up Supabase database:**

```bash
# Option A: Use the SQL migration files in /supabase directory
# Import schema.sql into your Supabase database via SQL editor

# Option B: Run migrations via CLI (if configured)
supabase db push
```

5. **Configure Google Drive API:**

See [Google Drive Setup](./QUICK_START_GUIDE.md#google-drive-setup) for detailed 
instructions on service account creation and folder sharing.

6. **Run the development server:**

```bash
pnpm dev
# or: npm run dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ Yes | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role for server-side operations | ✅ Yes | — |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google service account credentials | ✅ Yes | — |
| `GOOGLE_DRIVE_FOLDER_ID` | Google Drive folder ID for PDFs | ✅ Yes | — |
| `MAX_PDF_UPLOAD_SIZE_MB` | Max upload size in MB | ❌ No | `25` |
| `ADMIN_SECRET_KEY` | Secret key for admin operations | ✅ Yes | — |

---

## 💻 Usage

### For Students (Public Portal)

**Browse Documents:**

1. Navigate to [http://localhost:3000/courses](http://localhost:3000/courses)
2. Select a course → semester → subject
3. View available documents
4. Click to view or download PDFs

**Search Documents:**

```
Navigate to /search and enter keywords:
- Course name: "Computer Science"
- Exam type: "End Semester"
- Subject: "Data Structures"
Results are filtered in real-time.
```

### For Administrators (Dashboard)

**Access Admin Panel:**

```bash
1. Navigate to http://localhost:3000/admin/login
2. Enter your admin credentials
3. Access dashboard at http://localhost:3000/admin/dashboard
```

**Upload Documents:**

```bash
POST /api/admin/upload
Content-Type: multipart/form-data

{
  "file": <PDF file>,
  "course_id": "uuid",
  "semester_id": "uuid",
  "subject_id": "uuid",
  "document_type_id": "uuid",
  "exam_type_id": "uuid"
}
```

**Create Course:**

```bash
POST /api/admin/courses
Content-Type: application/json

{
  "name": "Computer Science",
  "code": "CS",
  "department_id": "uuid"
}
```

---

## 📁 Project Structure

```
ustm-academia/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API routes
│   │   │   ├── admin/               # Admin endpoints
│   │   │   │   ├── courses/
│   │   │   │   ├── documents/
│   │   │   │   ├── upload/
│   │   │   │   └── ...
│   │   │   ├── search/              # Search endpoint
│   │   │   └── courses/             # Public endpoints
│   │   ├── admin/                   # Admin pages
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── courses/
│   │   │   │   ├── documents/
│   │   │   │   └── ...
│   │   │   └── login/               # Admin login
│   │   ├── courses/                 # Public student pages
│   │   │   └── [slug]/              # Course detail
│   │   ├── search/                  # Search page
│   │   └── layout.tsx               # Root layout
│   ├── components/                  # React components
│   │   ├── admin/                   # Admin-specific components
│   │   │   ├── sidebar.tsx
│   │   │   └── breadcrumb.tsx
│   │   ├── public/                  # Public-facing components
│   │   └── ui/                      # Shared UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── lib/                         # Utility functions
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── google-drive.ts          # Drive API wrapper
│   │   ├── utils.ts                 # Helper functions
│   │   └── validations.ts           # Zod schemas
│   ├── types/                       # TypeScript types
│   │   └── index.ts
│   └── middleware.ts                # Request middleware
├── supabase/                        # Database migrations
│   ├── schema.sql
│   └── ...
├── .env.local                       # Environment variables (git-ignored)
├── .env.local.example               # Example env file
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🔌 API Reference

### Public Endpoints

#### Get All Courses

```bash
GET /api/courses
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Computer Science",
    "code": "CS",
    "department": "Engineering"
  }
]
```

#### Search Documents

```bash
GET /api/search?q=data&course_id=uuid&exam_type=mid-term
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Data Structures - Mid Term",
      "subject": "Data Structures",
      "semester": 3,
      "file_url": "https://..."
    }
  ],
  "total": 42
}
```

### Admin Endpoints

#### Create Course

```bash
POST /api/admin/courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Computer Science",
  "code": "CS",
  "department_id": "uuid"
}
```

#### Upload Document

```bash
POST /api/admin/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Multipart fields:
- file: <PDF file>
- course_id: "uuid"
- semester_id: "uuid"
- subject_id: "uuid"
- document_type_id: "uuid"
- exam_type_id: "uuid"
```

#### Delete Document

```bash
DELETE /api/admin/documents/:id
Authorization: Bearer <admin_token>
```

---

## 🗺️ Roadmap

- [x] Project setup and initial configuration
- [x] Database schema and migrations
- [x] Supabase authentication
- [x] Admin dashboard and CRUD operations
- [x] PDF upload and storage
- [x] Public student portal
- [x] Search and filtering
- [x] Performance optimization
- [ ] Email notifications for new uploads
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Offline document access
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] AI-powered study recommendations

---

## 🤝 Contributing

We welcome contributions from developers and USTM community members!

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/ustm-academia.git
   cd ustm-academia
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit with clear messages:
   ```bash
   git commit -m "feat: add feature description"
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** with a clear description

### Contribution Guidelines

- Follow the [Code of Conduct](./CODE_OF_CONDUCT.md)
- Ensure all tests pass before submitting PR
- Update documentation for new features
- Add unit tests for new functionality
- Follow TypeScript and Tailwind CSS best practices
- Reference related issues in PR descriptions

For detailed guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) file for details.

This means you're free to use, modify, and distribute this project for commercial and 
non-commercial purposes, provided you include the original copyright notice.

---

## 🙏 Acknowledgements

- **University of Science and Technology Meghalaya (USTM)** — for the vision and support
- **Next.js Team** — for the exceptional React framework
- **Supabase** — for the amazing PostgreSQL backend-as-a-service
- **Radix UI** — for accessible, unstyled UI components
- **Tailwind Labs** — for the utility-first CSS framework
- **Google Cloud** — for reliable file storage via Google Drive API

### Contributors

- **Lead Developer:** Bakhtiyar Khan
- **Design:** Design team at USTM

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

<div align="center">

**Made with ❤️ for USTM students**

Have questions? Open an issue or reach out to the development team.

</div>
