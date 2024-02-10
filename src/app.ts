// app.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PostgresqlService } from './postgresql/postgresql.service';
import { routerV1 } from './routes';
import { UploadService } from './upload/upload.service';

// Load environment variables and connect to the database
dotenv.config();
PostgresqlService.connect();
UploadService.connect();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  })
);

// Routes
app.use('/api/v1', routerV1);
app.use('/api', routerV1); // For compatibility with the previous version of the API

// Error handling
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
