# AI-Powered Task Manager

A lean, AI-augmented task management platform engineered for rapid execution and scalable deployment. The product delivers streamlined task operations, automated prioritization, and insights-driven decision support.

## 🚀 Features

- **AI-Powered Prioritization**: Tasks automatically ranked by importance and urgency
- **Task Management**: Create, update, complete, and organize tasks
- **Activity Timeline**: Track all user actions with filtering options
- **Analytics Dashboard**: Get insights into your productivity with visual charts
- **JWT Authentication**: Secure login and signup functionality
- **Responsive Design**: Works seamlessly across all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Component-based UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Zustand** - State management
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js + Express** - Server runtime and framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database access with PostgreSQL
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Infrastructure
- **Docker** - Containerization
- **PostgreSQL** - Production database
- **Redis** - Caching layer (optional)

## 📋 Project Structure

```
├── app/
│   ├── backend/          # Node.js + Express API server
│   │   ├── src/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── routes/         # API route definitions
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Auth and other middleware
│   │   │   └── tests/          # Unit and integration tests
│   │   ├── prisma/             # Database schema & migrations
│   │   └── Dockerfile          # Backend container config
│   └── frontend/         # React + TypeScript frontend
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Route components
│       │   ├── services/       # API calls
│       │   ├── store/          # Zustand stores
│       │   └── tests/          # Component tests
│       └── Dockerfile          # Frontend container config
├── docs/                 # Documentation
│   ├── deployment_checklist.md
│   └── system/           # System documentation
├── infra/                # Infrastructure as code
│   └── docker/           # Docker configurations
├── docker-compose.prod.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (or Docker for database)

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-task-manager
```

2. Install backend dependencies:
```bash
cd app/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
# For backend
cd ../backend
cp .env.example .env
# Edit .env with your configuration
```

5. Set up database:
```bash
# In backend directory
npx prisma db push
```

6. Run the applications:
```bash
# Terminal 1 - Backend
cd app/backend
npm run dev

# Terminal 2 - Frontend
cd app/frontend
npm run dev
```

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment Variables
Create a `.env` file in the project root with:
```bash
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key
```

## 🧪 Testing

### Backend Tests
```bash
cd app/backend
npm run test
```

### Frontend Component Tests
```bash
cd app/frontend
npm run test:unit
```

### E2E Tests
```bash
cd app/frontend
npm run test:e2e
```

## 🔐 Security

- JWT-based authentication with refresh tokens
- Passwords hashed with bcrypt
- Input validation and sanitization
- CORS configured for production domains
- Environment variables for sensitive data

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user
- `POST /api/v1/auth/login` - User login

### Tasks
- `GET /api/v1/tasks` - Get all user tasks
- `POST /api/v1/tasks` - Create a new task
- `PATCH /api/v1/tasks/:id` - Update a task
- `PATCH /api/v1/tasks/:id/complete` - Mark task as completed
- `PATCH /api/v1/tasks/:id/pending` - Mark task as pending
- `DELETE /api/v1/tasks/:id` - Delete a task

### AI
- `POST /api/v1/ai/prioritize` - AI-prioritize user tasks

### Events (Timeline)
- `GET /api/v1/events` - Get user activity events (with optional `filter` query param)

### Analytics
- `GET /api/v1/analytics/overview` - Get analytics dashboard data

## 🚀 Production Deployment

For production deployment, see the [deployment checklist](./docs/deployment_checklist.md) which includes:
- Security best practices
- Environment configuration
- Database setup
- Docker orchestration
- Monitoring considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the project maintainers.