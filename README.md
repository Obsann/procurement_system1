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

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo and select the `render.yaml` file at the root
3. Render will automatically create the web service + free PostgreSQL database
4. Once deployed, set these **additional** environment variables in the Render dashboard:
   - `DJANGO_ALLOWED_HOSTS` → your Render URL (e.g. `procuresync-api.onrender.com`)
   - `DJANGO_CORS_ALLOWED_ORIGINS` → your Vercel URL (e.g. `https://procuresync.vercel.app`)
5. After first deploy, run the seed command via Render's **Shell** tab:
   ```bash
   python manage.py seed_data --settings=config.settings.production
   ```

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`
4. Add this **Environment Variable** in Vercel's settings:
   - `VITE_API_BASE_URL` → `https://<your-render-service-name>.onrender.com/api`
5. Click **Deploy**

The `frontend/vercel.json` is already configured to handle React Router's client-side routing.

---

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