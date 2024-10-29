import express, { Express } from 'express';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import swaggerSetup from './swagger';
import RechargeRouter from './routes/RechargeRoute';
import PaiementRouter from './routes/PaiementRoute';
import CompteRouter from './routes/CompteRoute';
import BankRoute from './routes/BankRoute';

dotenv.config();
const app: Express = express();
const httpServer: HttpServer = new HttpServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*", // Permettre toutes les origines pour Socket.IO
    methods: ["GET", "POST"]
  }
});

// Appliquer le middleware CORS
app.use(cors({
  origin: 'http://localhost:4200', // Remplacer par l'URL de ton application Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

swaggerSetup(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/recharge', RechargeRouter);
app.use('/paiement', PaiementRouter);
app.use('/compte', CompteRouter);
app.use('/banks', BankRoute);

// Configuration Socket.IO
io.on("connection", (socket) => {
  console.log("Nouvelle connexion client : ", socket.id);

  socket.on("disconnect", () => {
    console.log("Client déconnecté : ", socket.id);
  });
});

// Démarrer le serveur HTTP
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Exporter io pour l'utiliser dans d'autres modules
export { io };
