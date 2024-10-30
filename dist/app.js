"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const TransfertDRoute_1 = __importDefault(require("./routes/TransfertDRoute"));
const app = (0, express_1.default)();
(0, swagger_1.default)(app);
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
app.use('/users', ContactRoute_1.default);
app.use('/v1', CreditRoute_1.default);
// Dans app.ts
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});
app.use('/recharge', RechargeRoute_1.default);
app.use('/paiement', PaiementRoute_1.default);
app.use('/compte', CompteRoute_1.default);
app.use('/banks', BankRoute_1.default);
// app.post('api/transfer/receive', transferController.receiveTransfer);
// app.post('/createUser', async (req: Request, res: Response) => {
//   const { nom, email, password, prenom, telephone,type } = req.body;
// let credit=3
// const data= {
//     nom,
//     email,
//     password,
//     prenom,
//     telephone,
//     type,
//     credit,
//   }
//   try {
//     const user = await User.create(data);
//     res.status(201).json(user);
//   } catch (err: any) {
//     console.error(err.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });
// app.post('/createPost', async (req: Request, res: Response) => {
//     const {  content,title ,state} = req.body;
//     try {
//       const user = await Post.create({
//         data: {
//           content,
//           title,
//           state: state,
//           user: { connect: { id: req.body.userId } },
//         },
//       });
//       res.status(201).json(user);
//     } catch (err: any) {
//       console.error(err.message);
//       res.status(500).json({ message: 'Server Error' });
//     }
//   });
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
