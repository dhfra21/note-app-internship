# Notes App

A full-stack notes application built with Next.js, NestJS, and PostgreSQL.

## Features

- User authentication with JWT
- CRUD operations for notes
- Profile picture upload
- Rate limiting (NestJS + Nginx)
- Redis caching
- Nginx reverse proxy

## Architecture

```
Internet → Nginx (Port 80) → Frontend (Port 3000) → Backend (Port 3001) → Database
```

## Quick Start with Docker Compose

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd note-app-internship
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Health Check: http://localhost/health

### Services

- **Frontend**: Next.js application (Port 3000)
- **Backend**: NestJS API (Port 3001)
- **Database**: PostgreSQL (Port 5432)
- **Redis**: Caching and rate limiting (Port 6379)
- **Nginx**: Reverse proxy (Port 80)

## Development Setup

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

### Frontend (Next.js)

```bash
npm install
npm run dev
```

### Database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Rate Limiting

The application implements **dual-layer rate limiting**:

### Nginx Layer (Additional Protection)
- **Auth endpoints**: 5 requests/minute
- **API endpoints**: 30 requests/minute
- **General**: 100 requests/minute

### NestJS Layer (Application Level)
- **Auth endpoints**: 5 requests/minute
- **CRUD operations**: 30 requests/minute

## Security Features

- JWT authentication
- Rate limiting (Nginx + NestJS)
- Security headers
- Input validation
- CORS configuration

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/users/upload-profile-picture` - Upload profile picture
- `GET /api/users/profile` - Get user profile

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Production Deployment

1. **Update domain in nginx.conf**
   ```nginx
   server_name yourdomain.com;
   ```

2. **Add SSL certificates**
   ```bash
   # Add SSL configuration to nginx.conf
   ```

3. **Set environment variables**
   ```bash
   # Update docker-compose.yml with production values
   ```

## Monitoring

- **Nginx logs**: `/var/log/nginx/notes-app-*.log`
- **Application logs**: Docker container logs
- **Health check**: `GET /health`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 3000, 3001, 5432, 6379 are available
2. **Database connection**: Check if PostgreSQL is running
3. **Redis connection**: Verify Redis service is up
4. **Nginx configuration**: Validate nginx.conf syntax

### Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs nginx
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart nginx

# Rebuild and restart
docker-compose up -d --build
```
