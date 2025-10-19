# Parshv Consultancy Website

This repository contains the source code for **Parshv Consultancy**, a recruitment services website with a **Next.js** frontend and a **Node.js + Express** backend. The frontend uses **Tailwind CSS**, **Framer Motion**, and reusable React components. The backend provides RESTful APIs on top of MySQL for job postings, resume uploads, and contact messages.

## Project Structure

```
parshv-consultancy/
|-- next-app/     # Frontend (Next.js app)
|   |-- app/      # App router pages and API routes
|   |-- components/ # Reusable React components
|   |-- public/   # Static assets
|   `-- package.json
`-- backend/      # Backend (Node.js + Express)
    |-- config/   # Database configuration
    |-- routes/   # API route handlers
    |-- uploads/  # Uploaded resume files (gitignored)
    `-- package.json
```

## Prerequisites

- Node.js 18+
- MySQL 8 (or compatible)

## Environment Variables

| Location    | Variable                   | Purpose                                         |
|-------------|----------------------------|-------------------------------------------------|
| next-app    | `NEXT_PUBLIC_API_BASE_URL` | Base URL for the Express API (e.g. http://localhost:4000) |
| next-app    | `API_BASE_URL` *(optional)*| Same as above, but available to server routes only |
| backend     | `DB_HOST`                  | MySQL host                                      |
| backend     | `DB_USER`                  | MySQL user                                      |
| backend     | `DB_PASSWORD`              | MySQL password                                  |
| backend     | `DB_NAME`                  | MySQL database name (defaults to `parshv_consultancy`) |

Create `.env.local` files in both `next-app/` and `backend/` (or export the variables in your shell) to override defaults as needed.

## Database Setup

Create a database named `parshv_consultancy` and run the following SQL to provision the required tables:

```sql
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  salary VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  resume_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running Locally

1. **Install frontend dependencies**
   ```bash
   cd next-app
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The API listens on `http://localhost:4000` by default.

4. **Start the frontend dev server**
   ```bash
   cd next-app
   npm run dev
   ```
   The Next.js app will be available at `http://localhost:3000`.

## Functionality Overview

- **Landing Page** - Introduces the company and provides calls-to-action for employers and candidates.
- **About Page** - Shares the company's mission and values.
- **Blog Page** - Lists blog posts served from a Next.js API route.
- **Jobs Page** - Fetches live job listings from the Express backend.
- **Contact Page** - Submits enquiries to the Express API, which stores them in MySQL.
- **Express API**
  - `GET /api/jobs` - List all job postings.
  - `POST /api/jobs` - Create a new job posting.
  - `GET /api/jobs/:id` - Retrieve a single job posting.
  - `GET /api/resumes` - List uploaded resumes.
  - `POST /api/resumes` - Upload a resume (PDF/DOC/DOCX up to 5 MB).
  - `POST /api/contact` - Persist a contact enquiry.

## Security Notes

- Resume uploads are limited to PDF or Word documents up to 5 MB and are deleted if database persistence fails. For production, consider storing files in object storage (S3, etc.) and scanning for malware.
- Contact submissions are validated server-side and saved in the `contact_messages` table for follow-up.

## Tailwind CSS

The project enables the `@tailwindcss/line-clamp` plugin so the `line-clamp-*` utilities used in the job and blog cards work as intended.
