"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
// import { Server as SocketIOServer } from 'socket.io';
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = __importDefault(require("./swagger"));
// import RechargeRouter from './routes/RechargeRoute';
// import PaiementRouter from './routes/PaiementRoute'; 
// import CompteRouter from './routes/CompteRoute';
const TransactionRoute_1 = __importDefault(require("./routes/TransactionRoute")); // Ajout de l'import
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = new http_1.Server(app);
// const io = new SocketIOServer(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });
(0, swagger_1.default)(app);
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use('/recharge', RechargeRouter);
// app.use('/paiement', PaiementRouter);
// app.use('/compte', CompteRouter);
app.use('/api', TransactionRoute_1.default); // Ajout de la route des transactions
// Configuration Socket.IO
// io.on("connection", (socket) => {
//   console.log("Nouvelle connexion client : ", socket.id);
//   socket.on("disconnect", () => {
//     console.log("Client déconnecté : ", socket.id);
//   });
// });
// Démarrer le serveur HTTP
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Exporter io pour l'utiliser dans d'autres modules
// export { io };
