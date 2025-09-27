# Parshv Consultancy Website

This repository contains the source code for **Parshv Consultancy**, a modern recruitment services website.  
It is built with a **Next.js** frontend and a **Node.js + Express** backend.  
The frontend uses **Tailwind CSS**, **Framer Motion** for animations, and **React** components.  
The backend provides RESTful APIs for job postings and resume uploads, backed by a MySQL database.

## Project Structure

```
parshv-consultancy/
├── next-app/       # Frontend (Next.js app)
│   ├── app/        # App directory for pages and API routes
│   ├── components/ # Reusable React components
│   ├── lib/        # Client-side helpers (e.g. API wrappers)
│   ├── public/     # Static assets
│   ├── package.json
│   └── ...
└── backend/        # Backend (Node.js + Express)
    ├── config/     # Database configuration
    ├── routes/     # API route handlers
    ├── uploads/    # Uploaded resume files (ignored by Git)
    ├── server.js   # Entry point
    └── package.json
```

## Running Locally

1. **Install dependencies for the frontend:**

   ```bash
   cd parshv-consultancy/next-app
   npm install
   ```

2. **Install dependencies for the backend:**

   ```bash
   cd parshv-consultancy/backend
   npm install
   ```

3. **Set up the MySQL database.**  
   Create a database named `parshv_consultancy` and run the following SQL to set up the tables:

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
     resume_path VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Configure your database connection.**  
   Edit `backend/config/db.js` and update the `host`, `user`, `password`, and `database` values to match your MySQL configuration.

5. **Start the backend server:**

   ```bash
   cd parshv-consultancy/backend
   npm start
   ```

   The backend will listen on port **4000** by default.

6. **Start the frontend development server:**

   ```bash
   cd parshv-consultancy/next-app
   npm run dev
   ```

   The Next.js app will be available at `http://localhost:3000`.

## Functionality Overview

- **Landing Page:** Introduces the company, highlights services, and provides call‑to‑action buttons for employers and candidates.
- **About Page:** Describes the company’s mission and values.
- **Blog Page:** Lists blog posts loaded from an API route. Each post displays a title, excerpt, and publication date.
- **Contact Page:** Contains a form for visitors to send messages. Data is sent to an API route.
- **Jobs Page:** Fetches and displays job listings from the Express backend.
- **Express API:**
  - `GET /api/jobs` – returns all job postings.
  - `POST /api/jobs` – creates a new job posting.
  - `GET /api/jobs/:id` – returns a single job posting by ID.
  - `GET /api/resumes` – lists uploaded resumes.
  - `POST /api/resumes` – uploads a resume and records candidate details.

## Notes

- The frontend uses **Framer Motion** for smooth entrance animations on sections and cards.
- Styling is handled with **Tailwind CSS**, with a modern palette that reflects professionalism and growth.
- File uploads are stored under `backend/uploads/`.  
  Make sure this directory exists and is writable.  
  In a production environment, consider using an object storage service (e.g. S3) instead of the local filesystem.