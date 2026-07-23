# Procurement Management Platform

A robust, enterprise-grade Procurement Management Platform built with modern web technologies.

## Tech Stack

*   **Backend:** Django 5, Django REST Framework
*   **Frontend:** React 19, Vite, Tailwind CSS
*   **Database:** PostgreSQL 16
*   **Caching/Queue:** Redis 7
*   **Object Storage:** MinIO
*   **Infrastructure:** Docker, Docker Compose, Nginx

## Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)
*   [Git](https://git-scm.com/downloads)

## Quick Start

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd procurement_system
    ```

2.  Copy the example environment variables file and update it if necessary:
    ```bash
    cp .env.example .env
    ```

3.  Start the application using Docker Compose:
    ```bash
    docker-compose up -d
    ```

4.  The application will be accessible at:
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:8000/api`
    *   MinIO Console: `http://localhost:9001`

## Development Setup

For local development with hot-reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

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

## API Documentation

[Link to API Documentation (Swagger/ReDoc) - Placeholder]

## Team

*   Obsan
*   Mary

## License

[License Information - Placeholder]