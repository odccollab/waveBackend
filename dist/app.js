"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = __importDefault(require("./swagger"));
const cors_1 = __importDefault(require("cors"));
const TransactionRoute_1 = __importDefault(require("./routes/TransactionRoute"));
const UserRoute_1 = __importDefault(require("./routes/UserRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, swagger_1.default)(app);
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Route principale pour les transferts
app.use('/api/transfer', TransactionRoute_1.default);
// Route principale pour les notifications
app.use('/api/user', UserRoute_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
exports.default = app;
