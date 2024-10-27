// app.ts
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import swaggerSetup from './swagger';
import cors from 'cors';
import transactionRoute from './routes/TransactionRoute';
import notificationRoute from './routes/UserRoute';

dotenv.config();

const app: Express = express();
swaggerSetup(app);

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route principale pour les transferts
app.use('/api/transfer', transactionRoute);

// Route principale pour les notifications
app.use('/api/user', notificationRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
