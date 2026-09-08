import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes/index.ts';
import { swaggerDocument } from './docs/swagger.ts';
import prisma from './prisma/index.ts';

const app = express();

// CORS — use explicit origin in production (set CORS_ORIGIN in Render dashboard too)
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logging & Performance Diagnostics via Morgan
app.use(morgan('dev'));

// Interactive Swagger OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', apiRoutes);

app.get('/', (_req, res) => {
  res.json({
    status: 'StaffSync API Running',
    documentation: '/api/docs',
    health: '/api/health',
    dbStatus: '/api/db-status',
  });
});

app.get('/api/db-status', async (_req, res) => {
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'NOT_SET';
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'connected', url: maskedUrl });
  } catch (err: any) {
    res.status(500).json({ status: 'error', url: maskedUrl, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/api`);
  console.log(`Swagger API Docs available at http://localhost:${PORT}/api/docs`);
});
// Trigger reload: Updated dashboard chart data and service mapping

