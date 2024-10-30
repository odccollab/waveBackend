"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = __importDefault(require("./swagger"));
const UserRoute2_1 = __importDefault(require("./routes/UserRoute2"));
const ContactRoute_1 = __importDefault(require("./routes/ContactRoute"));
const CreditRoute_1 = __importDefault(require("./routes/CreditRoute"));
const NotificationRoute_1 = __importDefault(require("./routes/NotificationRoute"));
const TransactionRoute_1 = __importDefault(require("./routes/TransactionRoute"));
const RechargeRoute_1 = __importDefault(require("./routes/RechargeRoute"));
const PaiementRoute_1 = __importDefault(require("./routes/PaiementRoute"));
const CompteRoute_1 = __importDefault(require("./routes/CompteRoute"));
const BankRoute_1 = __importDefault(require("./routes/BankRoute"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const TransfertDRoute_1 = __importDefault(require("./routes/TransfertDRoute"));
const app = (0, express_1.default)();
const httpServer = new http_1.Server(app);
(0, swagger_1.default)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // Permettre toutes les origines pour Socket.IO
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/user", UserRoute2_1.default);
app.use("/trans", TransfertDRoute_1.default);
// Route principale pour les transferts
app.use('/api/transfer', TransactionRoute_1.default);
// Route principale pour les notifications
app.use('/api/user', NotificationRoute_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Dans app.ts
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Dans votre app.ts ou index.ts
app.use('/test1', ContactRoute_1.default);
app.use('/v1', CreditRoute_1.default);
// Dans app.ts
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});
app.use('/recharge', RechargeRoute_1.default);
app.use('/paiement', PaiementRoute_1.default);
app.use('/compte', CompteRoute_1.default);
app.use('/banks', BankRoute_1.default);
