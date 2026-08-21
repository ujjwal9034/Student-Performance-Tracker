# 🎓 Student Performance Tracker

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Material UI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A high-performance, full-stack academic management and student intelligence platform.**

[Key Features](#-key-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Deployment](#-deployment-guide) • [Author](#-author)

</div>

---

## 📖 Overview

The **Student Performance Tracker** is an enterprise-grade academic portal designed for schools, universities, and educators to streamline student management, track grading benchmarks, record tamper-resistant attendance, and deliver deep academic performance analytics.

Equipped with a modern React + Vite frontend, a blazing-fast FastAPI backend, and dynamic PDF reporting engines, this application bridges the gap between students, educators, and administrators through real-time data transparency and automated communication workflows.

---

## 🚀 Key Features

### 👥 1. Role-Based Portals (RBAC)
*   **Super Admin Dashboard:** Manage teacher allocations, oversee student registrations, configure system parameters, and monitor institutional statistics.
*   **Teacher Portal:** Mark and inspect attendance sessions, record Midterm and End-Sem grades, generate dynamic rotating QR codes, and export class reports.
*   **Student Portal:** Track attendance heatmaps, inspect multi-semester grade progressions, view subject breakdown charts, and download verified academic transcripts.

### ⚡ 2. Secure Rotating QR Attendance System
*   **Anti-Proxy Verification:** Teachers generate live QR codes that rotate automatically using cryptographic timestamps and random nonces to prevent screenshot sharing and attendance spoofing.
*   **Instant Check-In:** Students scan via mobile or web camera for one-click verification and real-time attendance logging.

### 📊 3. Visual Analytics & Heatmaps
*   **Attendance Calendar Heatmaps:** Color-coded historical attendance matrix providing students with an immediate visual summary of their participation trends.
*   **Comparative Academic Charts:** Interactive Recharts visualizations displaying Midterm vs. Final performance distributions, subject percentiles, and semester GPAs.

### 📄 4. Dynamic PDF Transcript Engine
*   **One-Click Report Cards:** Built with Python’s `ReportLab`, students and teachers can instantly generate print-ready, professional PDF academic transcripts complete with institutional branding, grades, and attendance metrics.

### 📬 5. Automated Communications
*   **Instant Email Dispatch:** Automated onboarding and password dispatch to students and teachers using secure Gmail SMTP protocols.

### 🌓 6. Adaptive UI & Theme Switching
*   **Light & Dark Modes:** Polished, responsive UI built on Material UI (MUI) and custom design tokens for effortless switching between sleek dark mode and high-visibility light mode.

### 📡 7. Server Health & Cloud Warm-up Monitor
*   **Smart Cloud Status:** Real-time polling indicator on the frontend that notifies users when cloud-hosted databases or cold-start services (e.g. Render) are waking up.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React 18 (SPA)
*   **Build Tool:** Vite 5
*   **UI System:** Material UI (MUI) v5 + Custom Tailwind/CSS tokens
*   **Data Visualization:** Recharts
*   **Icons:** Lucide React & MUI Icons
*   **HTTP Client:** Axios with dynamic base URL resolution

### Backend
*   **Framework:** FastAPI (Python 3.10+)
*   **ASGI Server:** Uvicorn
*   **ORM & Database:** SQLAlchemy with SQLite (local) & PostgreSQL (cloud production)
*   **Data Validation:** Pydantic v2
*   **Security & Hashing:** Passlib with `bcrypt`, JWT Tokens
*   **PDF Generation:** ReportLab
*   **Email Dispatch:** Python `smtplib` + MIME multipart

---

## 📂 System Architecture

```text
Student_Performance_Tracker/
├── backend/
│   ├── main.py              # FastAPI application entry & route orchestration
│   ├── models.py            # SQLAlchemy database models & schemas
│   ├── database.py          # Database session management & engine config
│   ├── auth.py              # Security, password hashing & JWT handling
│   ├── email_service.py     # Automated SMTP email dispatch
│   ├── pdf_generator.py     # ReportLab dynamic PDF transcript generator
│   ├── seed_data.py         # Realistic mock dataset generator (100+ students)
│   ├── create_admin.py      # Default super-admin initialization script
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, Home, ProtectedRoute)
│   │   ├── context/         # AuthContext & ThemeContext state providers
│   │   ├── pages/           # Admin, Teacher, Student Dashboards & Auth views
│   │   ├── api.js           # Centralized Axios API client & environment resolver
│   │   └── App.jsx          # Root application component & routing layout
│   ├── package.json         # Node.js dependencies & scripts
│   └── vite.config.js       # Vite configuration
│
├── render.yaml              # Render Cloud Infrastructure as Code Blueprint
└── README.md                # Project documentation
```

---

## 💻 Getting Started

### Prerequisites
*   **Python:** `3.10` or higher
*   **Node.js:** `18.0.0` or higher
*   **Git**

---

### 🐍 1. Backend Setup (FastAPI)

1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    *   **macOS / Linux:**
        ```bash
        python3 -m venv venv_mac
        source venv_mac/bin/activate
        ```
    *   **Windows:**
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the `backend/` directory:
    ```env
    EMAIL_SENDER=your-email@gmail.com
    EMAIL_PASSWORD=your-gmail-app-password
    SUPER_ADMIN_EMAIL=your-email@gmail.com
    ```
    *(Note: `EMAIL_PASSWORD` should be a 16-character Google App Password).*

5.  **Initialize Super Admin & Seed Sample Data:**
    ```bash
    python create_admin.py
    python seed_data.py
    ```

6.  **Start the development server:**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    *   Interactive API Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
    *   Alternative Docs (ReDoc): [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### ⚛️ 2. Frontend Setup (React + Vite)

1.  **Navigate to frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Launch the development server:**
    ```bash
    npm run dev
    ```
    *   Access the web app at: [http://localhost:5173/](http://localhost:5173/)

---

## 📝 Demo Credentials

| Role | Email | Password | Access / Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@example.com` *(or your .env email)* | `admin123` *(or 984321)* | Full system management, teacher & student creation |
| **Teacher** | `teacher1@university.edu` | `teacher123` | Attendance sessions, rotating QR generator, grading |
| **Student** | `aarav.sharma12@university.edu` | `student123` | Personal analytics, QR scanner, PDF transcript download |

*(Tip: Run `python seed_data.py` to populate additional test accounts across all departments and semesters).*

---

## ☁️ Deployment Guide

### 📦 Backend on Render (One-Click Deploy)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ujjwal9034/Student-Performance-Tracker)

1. Connect your GitHub repository to Render.
2. Select **Web Service** with runtime `Python`.
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables: `EMAIL_SENDER`, `EMAIL_PASSWORD`, `SUPER_ADMIN_EMAIL`, `DATABASE_URL`.

### ⚡ Frontend on Vercel
1. Import the repository into **Vercel**.
2. Set the **Root Directory** to `frontend`.
3. Add the Environment Variable:
   *   `VITE_API_URL` = `https://your-backend-service.onrender.com`
4. Deploy!

---

## 🛡️ Security & Best Practices

*   **Password Security:** All authentication credentials hashed with `bcrypt` salt rounds.
*   **Anti-Tamper Attendance:** Timed nonces and rotating challenge tokens invalidate stale QR scans.
*   **Environment Segregation:** Secrets and sensitive SMTP credentials kept out of source control.
*   **Strict CORS Policy:** Granular allowlist for trusted origins.

---

## 👤 Author

**Ujjwal Pratap Singh**
*   **GitHub:** [@ujjwal9034](https://github.com/ujjwal9034)
*   **Project Repository:** [Student-Performance-Tracker](https://github.com/ujjwal9034/Student-Performance-Tracker)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
