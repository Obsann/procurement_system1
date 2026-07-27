# ProcureSync - Procurement Management Platform

A robust, enterprise-grade Procurement Management Platform built with modern web technologies.

## Tech Stack

*   **Backend:** Django 5, Django REST Framework
*   **Frontend:** React 19, Vite, Tailwind CSS
*   **Database:** PostgreSQL 16 (SQLite for local dev)
*   **Caching/Queue:** Redis 7
*   **Object Storage:** MinIO
*   **Infrastructure:** Docker, Docker Compose, Nginx

## Local Development Setup

To run the application locally without Docker:

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations and seed the database with demo users and realistic data:
   ```bash
   python manage.py migrate --settings=config.settings.development
   python manage.py seed_data --settings=config.settings.development
   ```
4. Start the development server:
   ```bash
   python manage.py runserver --settings=config.settings.development
   ```
   The backend API will run on `http://127.0.0.1:8000/`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## Demo Users

The `seed_data` script populates the database with Amharic-named users with different roles for testing. 
**The password for all accounts is `demo1234`.**

| Email | Name | Role |
| :--- | :--- | :--- |
| `abebe@demo.com` | Abebe Kebede | Requester |
| `almaz@demo.com` | Almaz Tesfaye | Budget Holder |
| `chaltu@demo.com` | Chaltu Tadesse | Procurement Officer |
| `dawit@demo.com` | Dawit Bekele | Financial Reviewer |
| `selamawit@demo.com` | Selamawit Alemu | Warehouse Officer |
| `yared@demo.com` | Yared Assefa | System Administrator |

## Branching Strategy

We follow a feature-branch workflow:
*   `main`: Production-ready code.
*   `develop`: Integration branch for features.
*   `feature/*`: New features (e.g., `feature/user-auth`). Branch off from `develop` and merge back into `develop` via Pull Request.
*   `bugfix/*`: Bug fixes.

## Project Structure

*   `backend/`: Django REST Framework API.
*   `frontend/`: React application.
*   `nginx/`: Nginx reverse proxy configuration.

## Team

*   Obsan
*   Mary