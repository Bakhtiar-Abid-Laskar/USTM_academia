This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google Drive PDF Storage Setup

This project uses Google Drive to store PDF documents.

Required setup:

1. Create a Google Cloud project.
2. Enable Google Drive API.
3. Create a service account.
4. Create a Google Drive folder for project PDFs.
5. Share the folder with the service account email.
6. Add the required environment variables.
7. Restart the development server.

Add these variables to your `.env.local`:

```bash
GOOGLE_DRIVE_FOLDER_ID="your_google_drive_folder_id"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your_service_account_email"
GOOGLE_PRIVATE_KEY="your_service_account_private_key"
# Or alternatively use the JSON string:
# GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'

MAX_PDF_UPLOAD_SIZE_MB="25"
```
