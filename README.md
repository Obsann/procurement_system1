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

### Backend → Render (No Credit Card Required)

Since Render requires a credit card to use Blueprints, you can bypass that by deploying manually on their free tier:

1. **Create the Database:**
   - Go to [render.com](https://render.com) → **New** → **PostgreSQL**
   - Name it `procuresync-db` and select the **Free** instance type. Click Create.
   - Once created, copy the **Internal Database URL**.
2. **Create the Web Service:**
   - Go back to Dashboard → **New** → **Web Service**
   - Connect your GitHub repo.
   - Set **Root Directory** to `backend`
   - Set **Build Command** to: `pip install -r requirements.txt && python manage.py collectstatic --noinput --settings=config.settings.production && python manage.py migrate --settings=config.settings.production`
   - Set **Start Command** to: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - Select the **Free** instance type.
3. **Add Environment Variables:**
   - In the Advanced section (or Environment tab), add:
     - `DJANGO_SETTINGS_MODULE` = `config.settings.production`
     - `DJANGO_SECRET_KEY` = (generate any long random string)
     - `POSTGRES_DB` = (from your Render database)
     - `POSTGRES_USER` = (from your Render database)
     - `POSTGRES_PASSWORD` = (from your Render database)
     - `POSTGRES_HOST` = (from your Render database, the internal host)
     - `POSTGRES_PORT` = `5432`
     - `DJANGO_ALLOWED_HOSTS` = your Render URL (e.g. `procuresync-api.onrender.com`)
     - `DJANGO_CORS_ALLOWED_ORIGINS` = your Vercel URL (e.g. `https://procuresync.vercel.app`)
     - `DJANGO_SECURE_COOKIES` = `True`
     - `USE_S3` = `False`
4. Click **Create Web Service**.
5. After it deploys, go to the **Shell** tab and run:
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