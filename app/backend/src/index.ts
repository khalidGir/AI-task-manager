import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import taskRouter from './routes/task.routes';
import aiRouter from './routes/ai.routes';
import eventRouter from './routes/event.routes';
import analyticsRouter from './routes/analytics.routes';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/analytics', analyticsRouter); // Add this line

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI Task Manager API'
  });
});

app.get('/', (req, res) => {
  res.send('AI Task Manager API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
