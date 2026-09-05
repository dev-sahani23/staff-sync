import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
<<<<<<< HEAD
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes/index.ts';
import { swaggerDocument } from './docs/swagger.ts';
=======
import apiRoutes from './routes/index.js';
>>>>>>> a9215566614b82e4a2bbce8a890046231bd2fd52

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Interactive Swagger OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger API Docs available at http://localhost:${PORT}/api/docs`);
=======
  console.log(`Server is running on http://localhost:${PORT}/api`);
>>>>>>> a9215566614b82e4a2bbce8a890046231bd2fd52
});
