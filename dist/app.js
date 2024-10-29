"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = __importDefault(require("./swagger"));
const RechargeRoute_1 = __importDefault(require("./routes/RechargeRoute"));
const PaiementRoute_1 = __importDefault(require("./routes/PaiementRoute"));
const CompteRoute_1 = __importDefault(require("./routes/CompteRoute"));
const BankRoute_1 = __importDefault(require("./routes/BankRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = new http_1.Server(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Permettre toutes les origines pour Socket.IO
        methods: ["GET", "POST"]
    }
});
exports.io = io;
// Appliquer le middleware CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200', // Remplacer par l'URL de ton application Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
(0, swagger_1.default)(app);
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/recharge', RechargeRoute_1.default);
app.use('/paiement', PaiementRoute_1.default);
app.use('/compte', CompteRoute_1.default);
app.use('/banks', BankRoute_1.default);
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
