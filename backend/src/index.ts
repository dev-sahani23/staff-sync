import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes/index.ts';
import { swaggerDocument } from './docs/swagger.ts';

dotenv.config();

const app = express();

app.use(cors());
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
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/api`);
  console.log(`Swagger API Docs available at http://localhost:${PORT}/api/docs`);
});
// Trigger reload: Updated dashboard chart data and service mapping

