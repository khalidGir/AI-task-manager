# Infrastructure Setup

This directory contains Docker configurations for the AI Task Manager application.

## Docker Compose Files

- `docker-compose.yml`: Production setup with all services
- `docker-compose.dev.yml`: Development setup with hot-reloading

## Services

The application consists of the following services:

### Backend Services
- **Express Backend**: Node.js/Express API server on port 5000
- **NestJS Backend**: NestJS API server on port 5001
- **FastAPI Backend**: Python/FastAPI server on port 5002

### Frontend Services
- **React Frontend**: React SPA served via Nginx on port 3000
- **Vue Frontend**: Vue SPA served via Nginx on port 8080

### Database
- **MongoDB**: Database server on port 27017

## Usage

### For Production:
```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```

### For Development:
```bash
docker-compose -f infra/docker/docker-compose.dev.yml up -d
```

### To Stop All Services:
```bash
docker-compose -f infra/docker/docker-compose.yml down
# or for dev
docker-compose -f infra/docker/docker-compose.dev.yml down
```

## Environment Variables

Each service has its own `.env` file with default configurations. You can modify these files to customize your deployment.