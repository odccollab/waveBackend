import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import swaggerSetup from './swagger'
import UserRoute2  from "./routes/UserRoute2";
import contactRoutes from './routes/ContactRoute';
import creditRoutes from './routes/CreditRoute';
import notificationRoute from './routes/NotificationRoute';
import transactionRoute from './routes/TransactionRoute';
dotenv.config();

import cors from 'cors';
import TransfertDRoute from "./routes/TransfertDRoute";
const app: Express = express();
swaggerSetup(app)
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user",UserRoute2)
app.use("/trans",TransfertDRoute)
// Route principale pour les transferts
app.use('/api/transfer', transactionRoute);

// Route principale pour les notifications
app.use('/api/user', notificationRoute);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Dans app.ts
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});


// Dans votre app.ts ou index.ts
app.use('/test1', contactRoutes);
app.use('/v1', creditRoutes);

// Dans app.ts
app.get('/test', (req, res) => { 
    res.json({ message: 'Server is running' });
});
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
