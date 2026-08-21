# 🎓 Student Performance Tracker

Welcome to the **Student Performance Tracker**! This is a modern, student-friendly, full-stack application designed to help academic institutions, teachers, and students manage grades, record attendance, track performance metrics, and stay connected.

Featuring beautiful analytics, automatic email alerts, interactive dashboards, and easy-to-download PDF report cards, this tool is built to make academic management effortless.

---

## 🚀 Key Features

*   **👥 Role-Based Portals:** Dedicated interactive dashboards for **Admins**, **Teachers**, and **Students**.
*   **📊 Dynamic Attendance Heatmaps:** Students can visualize their attendance patterns with a clean, color-coded calendar heatmap.
*   **📈 Academic Performance Analytics:** Interactive charts for tracking grades across semesters (Midterm vs. End Sem).
*   **📄 PDF Report Cards:** Students can download a print-ready, beautifully designed PDF report card with a single click.
*   **📧 Automated Welcomes & Notifications:** Automated registration emails sent to students and teachers using Gmail SMTP.
*   **🔒 Secure Accounts:** Passwords hashed with `bcrypt`, protected routes, and session validation.
*   **📡 Smart Database Connection Status:** If hosted on free cloud tiers (like Render), a floating status banner at the bottom of the screen keeps you updated while the server wakes up.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | Modern, high-performance web framework for Python. |
| **Frontend** | [React](https://react.dev/) + [Vite](https://vite.dev/) | Ultra-fast, component-based frontend tooling. |
| **UI Library** | [Material-UI (MUI)](https://mui.com/) | Sleek, customizable modern components. |
| **Charts** | [Recharts](https://recharts.org/) | Composable, elegant charts for student insights. |
| **Database** | [SQLAlchemy](https://www.sqlalchemy.org/) | Supports local SQLite databases and production PostgreSQL. |
| **PDF Engine** | [ReportLab](https://www.reportlab.com/) | Generates professional-looking academic transcripts dynamically. |

---

## 💻 Local Setup & Installation

Follow these steps to run both the backend and frontend servers locally on your machine.

### 🐍 Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**
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

4.  **Create your local environment file:**
    Create a file named `.env` in the `backend/` directory:
    ```env
    EMAIL_SENDER=your-gmail@gmail.com
    EMAIL_PASSWORD=your-gmail-app-password
    SUPER_ADMIN_EMAIL=your-gmail@gmail.com
    ```
    *(Note: The email password must be a 16-character Google App Password, not your personal password).*

5.  **Seed the default Admin account:**
    ```bash
    python create_admin.py
    ```
    This seeds the default Super Admin user (`your-gmail@gmail.com` with password `984321`).

6.  **Run the server:**
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The interactive API docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### ⚛️ Frontend Setup (React + Vite)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install packages:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The site will start up at [http://localhost:5173/](http://localhost:5173/) (or the next available port).

---

## ☁️ Deployment Guide

### 📦 Database & Backend on Render (Free Tier)
1.  Sign in to [Render](https://render.com/).
2.  Create a **New Web Service** and link it to your GitHub repository.
3.  Set the following configuration:
    *   **Root Directory:** `backend`
    *   **Runtime:** `Python`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4.  Add these **Environment Variables** in Render's dashboard:
    *   `EMAIL_SENDER` - Your Gmail address.
    *   `EMAIL_PASSWORD` - Your Gmail App Password.
    *   `SUPER_ADMIN_EMAIL` - Your email (must match the admin account email).
    *   `DATABASE_URL` - Link to your persistent PostgreSQL database (e.g. Render Postgres or Neon).

### ⚡ Frontend on Vercel
1.  Sign in to [Vercel](https://vercel.com/).
2.  Deploy the `frontend` folder.
3.  Set the environment variable `VITE_API_URL` to your production backend URL (e.g., `https://your-backend.onrender.com`).

## 📝 Credentials for Testing

*   **Super Admin:** Use the admin email and password configured in your local `.env` file (defaults to `admin@example.com` and `admin123` if not set).
