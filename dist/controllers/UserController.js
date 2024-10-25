"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const utils_1 = __importDefault(require("../utils/utils"));
const User_1 = __importDefault(require("../models/User"));
class UserController {
    static loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const { mail, password } = req.body;
            try {
                const user = yield User_1.default.findUnique({ mail: mail });
                if (!user || !utils_1.default.compPass(password, user.password)) {
                    res.status(400).json({ message: 'Invalid credentials' });
                    return;
                }
                const SECRET_KEY = process.env.SECRET_KEY;
                if (!SECRET_KEY) {
                    throw new Error('SECRET_KEY is not defined in the environment variables');
                }
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    type: user.type,
                    nom: user.nom,
                    prenom: user.prenom,
                    image: user.image // Assuming 'i' refers to a photo field, adjust if needed
                }, SECRET_KEY, { expiresIn: '7h' });
                res.json({ success: "connected", token });
            }
            catch (err) {
                console.error(err);
                res.status(500).json('Server Error');
            }
        });
    }
    //-------------------------CREATE_USER------------------------
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nom, prenom, mail, password, passconfirm, telephone, type, image } = req.body;
            // Check if passwords match
            if (password !== passconfirm) {
                res.status(400).json('Les mots de passe ne correspondent pas');
                return;
            }
            console.log(typeof (image));
            try {
                let user = yield prisma_1.default.user.findUnique({ where: { mail } });
                if (!user) {
                    user = yield prisma_1.default.user.findUnique({ where: { telephone } });
                }
                if (user) {
                    res.status(409).json('Un utilisateur avec cet e-mail ou numéro de téléphone existe déjà.');
                    return;
                }
                // Set initial credit based on the user type
                let credit = type === "client" ? 3 : 10;
                // Hash the password
                const hashedPassword = utils_1.default.hashPassword(password);
                // Create the user
                user = yield prisma_1.default.user.create({
                    data: {
                        nom,
                        prenom,
                        mail,
                        password: hashedPassword,
                        telephone,
                        type,
                        credit,
                        image
                    },
                });
                res.status(201).json(user);
            }
            catch (err) {
                console.error(err);
                // json a generic server error response
                res.status(500).json('Erreur du serveur');
            }
        });
    }
    // Helper function for pagination
    static getPaginationParams(req) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        return { offset, limit };
    }
    static profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let userId = +req.params.userId;
            if (!userId) {
                userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            }
            try {
                // Fetch basic user info
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        image: true,
                        telephone: true,
                        credit: true,
                        mail: true,
                        // Count followers and followings
                        _count: {
                            select: {
                                followers: true,
                                followings: true,
                                votesReceived: true, // Count of received votes
                                ventes: true, // Count of sales
                                commandes: true, // Count of orders
                            },
                        },
                        // Aggregation for posts: total views and total likes
                        posts: {
                            select: {
                                _count: {
                                    select: {
                                        viewers: true, // Total views across all posts
                                        likeDislike: true, // Total likes across all posts
                                    },
                                },
                            },
                        },
                    },
                });
                if (!user) {
                    return res.status(404).json({ message: "Utilisateur non trouvé" });
                }
                // const { offset, limit } = UserController.getPaginationParams(req);
                // const type = req.query.type as string;
                //
                // let data: any = {};
                // let hasMore = false;
                //
                // if (type === "post") {
                //   // Fetch only posts with pagination
                //   data.posts = await PostController.getPostOrStoryByUser(userId, "post", offset, limit);
                //   const totalPosts = await PostController.getPostOrStoryByUser(userId, "post");
                //   hasMore = offset + data.posts.length < totalPosts.length;
                // } else if (type === "story") {
                //   // Fetch only stories with pagination
                //   data.stories = await PostController.getPostOrStoryByUser(userId, "story");
                //   const totalStories = await PostController.getPostOrStoryByUser(userId, "story");
                //   hasMore = offset + data.stories.length < totalStories.length;
                // } else if (type === "article") {
                //   // Fetch only articles with pagination
                //   data.articles = await prisma.article.findMany({
                //     where: { idVendeur: userId },
                //     skip: offset,
                //     take: limit,
                //   });
                //   const totalArticles = await prisma.article.count({ where: { idVendeur: userId } });
                //   hasMore = offset + data.articles.length < totalArticles;
                // } else {
                //   // Fetch all (posts, stories, articles) with pagination limit for the initial fetch
                //   data.posts = await PostController.getPostOrStoryByUser(userId, "post", 0, limit);
                //   data.stories = await PostController.getPostOrStoryByUser(userId, "story");
                //   data.articles = await prisma.article.findMany({
                //     where: { idVendeur: userId },
                //     skip: 0,
                //     take: limit,
                //   });
                //
                //   hasMore =
                //       (data.posts?.length || 0) === limit ||
                //       (data.stories?.length || 0) === limit ||
                //       (data.articles?.length || 0) === limit;
                //
                // }
                res.status(200).json({
                    user,
                    message: Object.values(user).some((arr) => arr.length)
                        ? "Données trouvées"
                        : "Aucune donnée trouvée pour cet utilisateur",
                });
            }
            catch (error) {
                console.error("Error fetching profile data:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des données de profil", error });
            }
        });
    }
    static getSuggestedFriends(userId_1, offset_1) {
        return __awaiter(this, arguments, void 0, function* (userId, offset, limit = 30) {
            return prisma_1.default.user.findMany({
                where: {
                    AND: [
                        { id: { not: userId } }, // Exclude current user
                        {
                            followers: {
                                none: {
                                    followerId: userId
                                }
                            }
                        },
                        {
                            followings: {
                                none: {
                                    userId: userId
                                }
                            }
                        }
                    ],
                },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    image: true,
                },
                skip: offset,
                take: limit,
            });
        });
    }
    static getNotFollowedBack(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, offset = 0, limit = 30) {
            return prisma_1.default.user.findMany({
                where: {
                    AND: [
                        { followers: { some: { userId: userId } } }, // Les utilisateurs qui suivent userId
                        { followings: { none: { followerId: userId } } }, // Mais que userId ne suit pas en retour
                    ],
                },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    image: true,
                },
                skip: offset,
                take: limit,
            });
        });
    }
    static getMutualFriends(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, offset = 0, limit = 30) {
            return prisma_1.default.user.findMany({
                where: {
                    AND: [
                        { id: { not: userId } },
                        { followers: { some: { userId: userId } } },
                        { followings: { some: { followerId: userId } } },
                    ],
                },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    image: true,
                },
                skip: offset,
                take: limit,
            });
        });
    }
    static getSuggestedAndNotFollowedBack(userId_1, offset_1) {
        return __awaiter(this, arguments, void 0, function* (userId, offset, limit = 30) {
            const [suggestedFriends, notFollowedBack] = yield Promise.all([
                this.getSuggestedFriends(userId, offset, limit),
                this.getNotFollowedBack(userId, offset, limit)
            ]);
            console.log("kdkkdkd", notFollowedBack);
            return {
                suggestedFriends,
                notFollowedBack
            };
        });
    }
    static getSuggestedFriendsC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +req.params.userId || +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const offset = req.query.offset ? +req.query.offset : undefined;
            const limit = req.query.limit ? +req.query.limit : undefined;
            try {
                const suggestedFriends = yield UserController.getSuggestedFriends(userId, offset, limit);
                res.status(200).json({ suggestedFriends, message: "Amis suggérés récupérés avec succès" });
            }
            catch (error) {
                console.error("Erreur lors de la récupération des amis suggérés:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des données", error });
            }
        });
    }
    static getNotFollowedBackC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +req.params.userId || +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const offset = req.query.offset ? +req.query.offset : undefined;
            const limit = req.query.limit ? +req.query.limit : undefined;
            try {
                const notFollowedBack = yield UserController.getNotFollowedBack(userId, offset, limit);
                res.status(200).json({ notFollowedBack, message: "Utilisateurs non suivis en retour récupérés avec succès" });
            }
            catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs non suivis en retour:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des données", error });
            }
        });
    }
    static getMutualFriendsC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +req.params.userId || +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const offset = req.query.offset ? +req.query.offset : undefined;
            const limit = req.query.limit ? +req.query.limit : undefined;
            try {
                const mutualFriends = yield UserController.getMutualFriends(userId, offset, limit);
                res.status(200).json({ mutualFriends, message: "Amis mutuels récupérés avec succès" });
            }
            catch (error) {
                console.error("Erreur lors de la récupération des amis mutuels:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des données", error });
            }
        });
    }
    static getSuggestedAndNotFollowedBackC(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +req.params.userId || +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const offset = req.query.offset ? +req.query.offset : undefined;
            const limit = req.query.limit ? +req.query.limit : undefined;
            try {
                const result = yield UserController.getSuggestedAndNotFollowedBack(userId, offset, limit);
                res.status(200).json(Object.assign(Object.assign({}, result), { message: "Amis suggérés et utilisateurs non suivis en retour récupérés avec succès" }));
            }
            catch (error) {
                console.error("Erreur lors de la récupération des amis suggérés et utilisateurs non suivis en retour:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des données", error });
            }
        });
    }
    static getFilteredUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = req.query.query;
            const offset = Number(req.query.offset) || 0;
            const limit = Number(req.query.limit) || 50;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            try {
                const users = yield prisma_1.default.user.findMany({
                    where: {
                        AND: [
                            // Filter by name or first name if query is provided
                            query
                                ? {
                                    OR: [
                                        { nom: { contains: query, mode: 'insensitive' } },
                                        { prenom: { contains: query, mode: 'insensitive' } }
                                    ]
                                }
                                : {},
                        ],
                    },
                    select: {
                        id: true,
                        nom: true,
                        prenom: true,
                        image: true,
                    },
                    skip: offset,
                    take: limit,
                });
                console.log(users);
                res.status(200).json({ users, message: "Filtered users retrieved successfully" });
            }
            catch (error) {
                console.error("Error retrieving filtered users:", error);
                res.status(500).json({ message: "Error retrieving filtered users", error });
            }
        });
    }
    static rechargerCompte(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { amount } = req.body;
            const userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.type) == "client") {
                return res.status(403).json({ error: "Vous ne pouvez pas recharger votre compte client" });
            }
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            if (amount < 1000) {
                return res.status(400).json({ error: "Le montant doit être supérieur ou égal à 1000" });
            }
            try {
                // Rechercher l'utilisateur par son ID
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        id: userId,
                    },
                });
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                // Calculer les crédits à ajouter
                const creditsToAdd = Math.floor(amount / 1000);
                // Mettre à jour les crédits de l'utilisateur
                const updatedUser = yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        credit: {
                            increment: creditsToAdd, // Incrémenter les crédits actuels
                        },
                    },
                });
                return res.json({ success: true, credits: updatedUser.credit });
            }
            catch (err) {
                console.error(err);
                return res.status(500).json({ error: "Server Error" });
            }
        });
    }
    static ChangeEnTailleur(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            try {
                const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
                if (!user) {
                    return res.status(404).send("User not found");
                }
                if (user.credit < 10) {
                    return res.status(400).send("Insufficient credits to upgrade to Tailleur");
                }
                const updatedUser = yield prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        credit: user.credit - 10,
                        type: 'tailleur',
                    },
                });
                res.json({ message: "Account upgraded to Tailleur", credits: updatedUser.credit });
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Server Error");
            }
        });
    }
    static sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { receiver, content, type, typeId } = req.body;
                const senderId = +req.user.id;
                if (!senderId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const sender = yield prisma_1.default.user.findUnique({ where: { id: senderId } });
                if (!sender) {
                    return res.status(404).json({ message: 'Sender not found' });
                }
                const receiverUser = yield prisma_1.default.user.findUnique({ where: { id: +receiver } });
                if (!receiverUser) {
                    return res.status(404).json({ message: 'Receiver not found' });
                }
                let relatedEntity = null;
                let idUser;
                if (type && typeId) {
                    if (type === 'post') {
                        relatedEntity = yield prisma_1.default.post.findUnique({ where: { id: +typeId } });
                        idUser = relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.idUser;
                    }
                    else if (type === 'comment') {
                        relatedEntity = yield prisma_1.default.comment.findUnique({ where: { id: +typeId } });
                        idUser = relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.userId;
                    }
                    else if (type === 'message') {
                        relatedEntity = yield prisma_1.default.message.findUnique({ where: { id: +typeId } });
                        idUser = relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId;
                        if (!(((relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.senderId) == senderId && (relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId) == receiver) ||
                            ((relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.receiverId) == senderId && (relatedEntity === null || relatedEntity === void 0 ? void 0 : relatedEntity.senderId) == receiver))) {
                            return res.status(403).json({ message: 'You are not allowed to send a message between this sender and receiver' });
                        }
                    }
                    else {
                        return res.status(400).json({ message: 'Invalid type specified' });
                    }
                    if (!relatedEntity || (idUser !== receiver && type !== 'message')) {
                        return res.status(404).json({ message: `${type} not found or this ${type} does not belong to the receiver` });
                    }
                }
                const message = yield prisma_1.default.message.create({
                    data: {
                        senderId,
                        receiverId: +receiver,
                        content,
                        from: type || null,
                        fromId: typeId || null,
                    },
                });
                // Fetch sender and receiver details
                const detailedSender = yield prisma_1.default.user.findUnique({
                    where: { id: senderId },
                    select: { id: true, nom: true, prenom: true, image: true, mail: true, telephone: true }
                });
                const detailedReceiver = yield prisma_1.default.user.findUnique({
                    where: { id: +receiver },
                    select: { id: true, nom: true, prenom: true, image: true, mail: true, telephone: true }
                });
                res.status(201).json({
                    message: 'Message sent successfully',
                    data: Object.assign(Object.assign({}, message), { sender: detailedSender, receiver: detailedReceiver, relatedEntity: relatedEntity || null })
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    static getMessageUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = +req.user.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const users = yield prisma_1.default.message.findMany({
                    where: {
                        OR: [
                            { senderId: userId },
                            { receiverId: userId },
                        ],
                    },
                    select: {
                        sender: {
                            select: { id: true, nom: true, prenom: true, image: true },
                        },
                        receiver: {
                            select: { id: true, nom: true, prenom: true, image: true },
                        },
                        createdAt: true,
                        content: true,
                        senderId: true,
                        receiverId: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                const userMessagesMap = new Map();
                users.forEach((message) => {
                    const otherUser = message.senderId !== userId ? message.sender : message.receiver;
                    const otherUserId = otherUser.id;
                    if (!userMessagesMap.has(otherUserId)) {
                        userMessagesMap.set(otherUserId, {
                            user: otherUser,
                            lastMessage: {
                                content: message.content,
                                createdAt: message.createdAt,
                            },
                        });
                    }
                });
                const uniqueUsersWithLastMessage = Array.from(userMessagesMap.values());
                res.json(uniqueUsersWithLastMessage);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    static getDiscussion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = +req.user.id;
                const { otherUserId } = req.params;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const messages = yield prisma_1.default.message.findMany({
                    where: {
                        OR: [
                            { senderId: userId, receiverId: Number(otherUserId) },
                            { senderId: Number(otherUserId), receiverId: userId },
                        ],
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                mail: true,
                                telephone: true,
                                image: true,
                            },
                        },
                        receiver: {
                            select: {
                                id: true,
                                nom: true,
                                prenom: true,
                                mail: true,
                                telephone: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                });
                const enrichedMessages = yield Promise.all(messages.map((message) => __awaiter(this, void 0, void 0, function* () {
                    let relatedEntity = null;
                    if (message.from && message.fromId) {
                        if (message.from === 'post') {
                            relatedEntity = yield prisma_1.default.post.findUnique({
                                where: { id: message.fromId },
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            nom: true,
                                            prenom: true,
                                            image: true,
                                        },
                                    },
                                    viewers: {
                                        select: {
                                            userId: true,
                                        },
                                    },
                                    contenuMedia: {
                                        select: {
                                            url: true,
                                        },
                                    }
                                }
                            });
                        }
                        else if (message.from === 'comment') {
                            relatedEntity = yield prisma_1.default.comment.findUnique({ where: { id: message.fromId },
                            });
                        }
                        else if (message.from === 'message') {
                            relatedEntity = yield prisma_1.default.message.findUnique({
                                where: { id: message.fromId },
                                include: {
                                    sender: {
                                        select: {
                                            id: true,
                                            nom: true,
                                            prenom: true,
                                            mail: true,
                                            telephone: true,
                                            image: true,
                                        },
                                    },
                                    receiver: {
                                        select: {
                                            id: true,
                                            nom: true,
                                            prenom: true,
                                            mail: true,
                                            telephone: true,
                                            image: true,
                                        },
                                    },
                                },
                            });
                        }
                    }
                    return Object.assign(Object.assign({}, message), { relatedEntity });
                })));
                res.json(enrichedMessages);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    static manageFavorites(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { postId } = req.body;
            const userId = +req.user.id; // Assumes `req.id` is set by authentication middleware
            try {
                // Vérifier l'existence de l'utilisateur
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    include: { favoris: true },
                });
                if (!user) {
                    return res.status(400).send('Vous n\'êtes pas connecté');
                }
                // Vérifier l'existence du post
                const post = yield prisma_1.default.post.findUnique({
                    where: { id: postId },
                });
                if (!post) {
                    return res.status(404).send('Le post n\'existe pas');
                }
                // Vérifier si le post est déjà dans les favoris de l'utilisateur
                const isFavorited = user.favoris.some(favPost => favPost.id === postId);
                if (!isFavorited) {
                    // Ajouter le post aux favoris
                    yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            favoris: {
                                connect: { id: postId },
                            },
                        },
                    });
                    return res.json({ message: "Post ajouté aux favoris" });
                }
                else {
                    // Retirer le post des favoris
                    yield prisma_1.default.user.update({
                        where: { id: userId },
                        data: {
                            favoris: {
                                disconnect: { id: postId },
                            },
                        },
                    });
                    return res.json({ message: "Post retiré des favoris" });
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Erreur du serveur');
            }
        });
    }
    static getUserFavorites(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = +req.user.id; // Assumes `req.user` is set by authentication middleware
            try {
                // Find the user and their favorite posts along with necessary details (user, viewers, contenuMedia)
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    include: {
                        favoris: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        nom: true,
                                        prenom: true,
                                        image: true,
                                    },
                                },
                                viewers: {
                                    select: {
                                        userId: true,
                                    },
                                },
                                contenuMedia: {
                                    select: {
                                        url: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!user) {
                    return res.status(400).send("Vous n'êtes pas connecté");
                }
                // Get all favorite post IDs
                const favoritePostIds = user.favoris.map(post => post.id);
                // Fetch all post reactions for the user's favorite posts
                const postReactions = yield prisma_1.default.likeDislike.findMany({
                    where: {
                        userId: userId,
                        postId: { in: favoritePostIds },
                    },
                    select: {
                        postId: true,
                        type: true, // Assuming 'type' can be 'like', 'dislike', or 'neutral'
                    },
                });
                // Fetch users followed by the authenticated user
                const followedUsers = yield prisma_1.default.follower.findMany({
                    where: {
                        followerId: userId, // The authenticated user follows these users
                        userId: { in: user.favoris.map(post => post.user.id) }, // Filter by the authors of the favorite posts
                    },
                    select: {
                        userId: true,
                    },
                });
                // Map through the user's favorite posts to enhance them with like status, favorite, and following information
                const enhancedFavorites = user.favoris.map(post => {
                    // Determine the reaction type for the post
                    const reaction = postReactions.find(reaction => reaction.postId === post.id);
                    let likeStatus = 'neutral'; // Default status
                    if (reaction) {
                        likeStatus = reaction.type; // Update status based on reaction
                    }
                    return Object.assign(Object.assign({}, post), { likeStatus, favorite: true, following: followedUsers.some(follow => follow.userId === post.user.id) });
                });
                // Return the enhanced list of favorite posts
                res.json({ favorites: enhancedFavorites });
            }
            catch (err) {
                console.error(err);
                res.status(500).send('Erreur du serveur');
            }
        });
    }
    static getNotif(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            try {
                const notifications = yield prisma_1.default.notification.findMany({
                    where: {
                        userId: +userId,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                if (!notifications.length) {
                    return res.status(404).json({ message: 'No notifications found' });
                }
                return res.status(200).json({ notifications });
            }
            catch (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    //----------------ADD_NOTIFICATION----------------------------
    static addNotification(userId, content, fromUserId, // Optional parameter for the user who sent the notification
    type, // Optional parameter for the type of notification
    idType // Optional parameter for an additional identifier type
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create a new notification for the user
                yield prisma_1.default.notification.create({
                    data: {
                        userId,
                        content,
                        fromUserId, // Include optional parameter
                        type, // Include optional parameter
                        idType // Include optional parameter
                    }
                });
            }
            catch (err) {
                console.error('Erreur lors de l\'ajout de la notification:', err);
            }
        });
    }
    //---------------------------------------VOTE-----------------------------------------
    static manageVotes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { voteForUserId } = req.body;
            const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Récupération de l'ID de l'utilisateur depuis le middleware d'authentification
            try {
                // Vérifier l'existence de l'utilisateur à voter
                const userToVote = yield prisma_1.default.user.findUnique({ where: { id: voteForUserId } });
                if (!userToVote) {
                    return res.status(404).send("L'utilisateur n'existe pas");
                }
                // Vérifier que l'utilisateur ne vote pas pour lui-même
                if (userId === voteForUserId) {
                    return res.status(400).send("Vous ne pouvez pas voter pour vous-même");
                }
                // Trouver le vote existant
                const existingVote = yield prisma_1.default.vote.findFirst({
                    where: { idVoteur: userId, userId: voteForUserId },
                });
                if (!existingVote) {
                    // L'utilisateur n'a pas encore voté, donc on ajoute le vote
                    yield prisma_1.default.vote.create({
                        data: {
                            idVoteur: userId,
                            userId: voteForUserId,
                        },
                    });
                    return res.json({ message: "Vous avez voté pour cet utilisateur" });
                }
                else {
                    // L'utilisateur a déjà voté, donc on supprime le vote
                    yield prisma_1.default.vote.delete({
                        where: { id: existingVote.id },
                    });
                    return res.json({ message: "Vous avez retiré votre vote" });
                }
            }
            catch (err) {
                console.error(err.message);
                return res.status(500).send('Erreur du serveur');
            }
        });
    }
    //------------------------------------ADD_Follower--------------------------------
    static addFollower(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { followedId } = req.body;
            if (!followedId) {
                return res.status(400).send({ error: 'Invalid followedId' });
            }
            console.log('followedId:', followedId);
            try {
                // Trouver l'utilisateur connecté
                const userConnected = yield prisma_1.default.user.findUnique({
                    where: { id: +req.user.id }
                });
                const userToFollow = yield prisma_1.default.user.findUnique({
                    where: { id: +followedId },
                    include: {
                        followers: {
                            select: {
                                followerId: true // Sélectionne uniquement les IDs des utilisateurs qui suivent cet utilisateur
                            }
                        }
                    },
                });
                //tesr est ce que le user to follow n'est pas un user simple 
                if (!userConnected) {
                    return res.status(404).send("User connected not found");
                }
                if (!userToFollow) {
                    return res.status(404).send("User to follow not found");
                }
                if (followedId === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    return res.status(400).send("Vous ne pouvez pas vous suivre vous-même");
                }
                // Vérification si l'utilisateur suit déjà
                const alreadyFollowing = yield prisma_1.default.follower.findFirst({
                    where: {
                        followerId: userConnected.id,
                        userId: +followedId
                    }
                });
                if (alreadyFollowing) {
                    // Arrêter de suivre
                    yield prisma_1.default.follower.delete({
                        where: {
                            id: alreadyFollowing.id
                        }
                    });
                    return res.status(200).send("Vous avez arrêté de suivre cet utilisateur");
                }
                // Ajouter un nouveau follower
                yield prisma_1.default.follower.create({
                    data: {
                        followerId: userConnected.id,
                        userId: +followedId
                    }
                });
                let message = `${userConnected.image} ${userConnected.prenom} ${userConnected.nom} à commencer a vous suivre `;
                UserController.addNotification(Number(followedId), message, userConnected.id, "user", userConnected.id);
                return res.json("vous avez commence a suivre ce user");
            }
            catch (err) {
                console.error(err);
                return res.status(500).send("Server Error");
            }
        });
    }
    //------------------------------------GET_FOLLOWERS--------------------------------
    static getFollowers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const id = req.params.id ? Number(req.params.id) : Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            const userConnected = yield prisma_1.default.user.findUnique({
                where: { id: id },
            });
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.type) !== 'tailleur') {
                return res.status(403).json({ message: 'Vous devez être un tailleur pour avoir des followers' });
            }
            if (!userConnected) {
                return res.status(404).send("User connected not found");
            }
            // Récupérer les followers de l'utilisateur connecté
            const followers = yield prisma_1.default.follower.findMany({
                where: { userId: Number((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) },
                include: {
                    follower: {
                        select: {
                            id: true,
                            nom: true,
                            prenom: true,
                            image: true,
                        },
                    },
                },
            });
            //Formater les données pour la réponse
            const formattedFollowers = followers.map((f) => ({
                _id: f.follower.id,
                nom: f.follower.nom,
                prenom: f.follower.prenom,
                image: f.follower.image,
            }));
            if (formattedFollowers.length == 0)
                return res.json({ message: "Actuellement, Vous n'avez de  followers", data: [] });
            else
                return res.json({ message: "followers trouvés", data: formattedFollowers });
        });
    }
    //------------------GET_Followings-----------------------------
    static getFollowings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = req.params.id ? Number(req.params.id) : Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            try {
                const userConnected = yield prisma_1.default.user.findUnique({
                    where: { id: id },
                });
                console.log(userConnected);
                if (!userConnected) {
                    return res.status(404).send("User connected not found");
                }
                // Récupérer les suivis de l'utilisateur connecté à partir de la table Follower
                const followings = yield prisma_1.default.follower.findMany({
                    where: { followerId: userConnected.id },
                    include: { user: true },
                });
                // Construire la liste des suivis avec les détails de l'utilisateur
                const followingDetails = followings.map((following) => ({
                    _id: following.user.id,
                    nom: following.user.nom,
                    prenom: following.user.prenom,
                    image: following.user.image,
                }));
                if (followingDetails.length == 0)
                    return res.json({ message: "Actuellement, Vous ne suivez personne" });
                else
                    return res.json({ data: followingDetails });
            }
            catch (err) {
                console.error(err.message);
                return res.status(500).send('Erreur du serveur');
            }
        });
    }
    static ajoutArticle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { libelle, prixUnitaire, quantiteStock, categorie, description } = req.body;
                const idVendeur = +req.user.id; // ID du vendeur à partir de req.user
                const vendeur = yield prisma_1.default.user.findUnique({
                    where: { id: idVendeur },
                });
                if (!vendeur || vendeur.type !== "vendeur") {
                    return res.status(403).json("seule vendeur peux ajouter article ");
                }
                // Créer l'article+
                const article = yield prisma_1.default.article.create({
                    data: {
                        libelle,
                        prixUnitaire,
                        quantiteStock,
                        categorie,
                        description,
                        idVendeur: +idVendeur,
                    },
                    include: {
                        vendeur: { select: { nom: true, prenom: true, telephone: true, image: true } },
                        commandes: true,
                    },
                });
                return res.status(201).json(article);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "An error occurred while adding the article." });
            }
        });
    }
    // Méthode pour obtenir les articles du vendeur connecté
    static getArticle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idVendeur = req.params.id ? Number(req.params.id) : Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Get vendor ID from req.user
                const page = parseInt(req.query.page) || 1; // Default to page 1
                const limit = parseInt(req.query.limit) || 10; // Default limit of 10 items
                const offset = (page - 1) * limit;
                const articles = yield prisma_1.default.article.findMany({
                    where: { idVendeur: +idVendeur },
                    skip: offset,
                    take: limit,
                });
                const totalArticles = yield prisma_1.default.article.count({
                    where: { idVendeur: +idVendeur },
                });
                return res.status(200).json({
                    articles,
                    totalArticles,
                    hasMore: offset + articles.length < totalArticles, // Determine if there's more data
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "An error occurred while retrieving articles." });
            }
        });
    }
    // Méthode pour mettre à jour un article
    static updateArticle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, libelle, prixUnitaire, quantiteStock, categorie, description } = req.body;
                const idVendeur = req.user.id; // ID du vendeur à partir de req.user
                // Mettre à jour l'article
                const article = yield prisma_1.default.article.update({
                    where: { id },
                    data: {
                        libelle,
                        prixUnitaire,
                        quantiteStock,
                        categorie,
                        description,
                    },
                    select: {
                        id: true,
                        idVendeur: true,
                        libelle: true,
                        prixUnitaire: true,
                        quantiteStock: true,
                        categorie: true,
                        description: true,
                    },
                });
                if (article.idVendeur !== +idVendeur) {
                    return res.status(403).json({ message: "Unauthorized to update this article." });
                }
                return res.status(200).json(article);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "An error occurred while updating the article." });
            }
        });
    }
    // Méthode pour supprimer un article (soft delete)
    static deleteArticle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                const idVendeur = req.user.id; // ID du vendeur à partir de req.user
                // Vérifiez que l'article appartient au vendeur
                const article = yield prisma_1.default.article.findUnique({
                    where: { id },
                    select: { idVendeur: true },
                });
                if (!article || article.idVendeur !== +idVendeur) {
                    return res.status(403).json({ message: "Unauthorized to delete this article." });
                }
                // Supprimer l'article
                yield prisma_1.default.article.delete({
                    where: { id },
                });
                return res.status(200).json({ message: "Article deleted successfully." });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "An error occurred while deleting the article." });
            }
        });
    }
    // Méthode pour créer une commande
    static createCommande(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { articles } = req.body;
            const idUser = +req.user.id; // Utilisation de l'ID de l'utilisateur à partir de req.user
            try {
                // Utilisation d'une transaction pour s'assurer que toutes les opérations sont atomiques
                const result = yield prisma_1.default.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    if (articles.length === 0) {
                        throw new Error("La commande doit contenir au moins un article");
                    }
                    // 1. Obtenir l'ID du vendeur à partir du premier article
                    const firstArticle = yield prisma.article.findUnique({
                        where: { id: +articles[0].idArticle },
                        select: { idVendeur: true },
                    });
                    if (!firstArticle) {
                        throw new Error(`Article avec l'ID ${articles[0].idArticle} non trouvé`);
                    }
                    const vendeurId = firstArticle.idVendeur;
                    // 2. Créer la commande
                    const commande = yield prisma.commande.create({
                        data: {
                            idUser: +idUser,
                            idVendeur: vendeurId, // Ajouter l'ID du vendeur
                            createdAt: new Date(),
                            prixTotal: 0, // Initialiser avec 0, nous le mettrons à jour plus tard
                            etat: "non_confirme", // Etat initial
                        },
                    });
                    let prixTotal = 0;
                    // 3. Associer les articles et mettre à jour le stock
                    for (const articleCommande of articles) {
                        const { idArticle, quantite } = articleCommande;
                        // Récupérer l'article pour obtenir le prix et vérifier le stock
                        const article = yield prisma.article.findUnique({
                            where: { id: idArticle },
                        });
                        if (!article || article.quantiteStock < quantite) {
                            throw new Error(`Stock insuffisant pour l'article avec l'ID ${idArticle}`);
                        }
                        // Décrémenter le stock de l'article
                        yield prisma.article.update({
                            where: { id: idArticle },
                            data: {
                                quantiteStock: article.quantiteStock - quantite,
                            },
                        });
                        // Calculer le montant total pour cet article
                        prixTotal += article.prixUnitaire * quantite;
                        // Associer l'article à la commande dans la table de liaison CommandeArticle
                        yield prisma.commandeArticle.create({
                            data: {
                                idCommande: commande.id,
                                idArticle: idArticle,
                                quantite: quantite,
                            },
                        });
                    }
                    // 4. Mettre à jour le montant total de la commande
                    const updatedCommande = yield prisma.commande.update({
                        where: { id: commande.id },
                        data: { prixTotal: prixTotal },
                    });
                    return updatedCommande;
                }));
                res.status(201).json({
                    message: 'Commande créée avec succès',
                    commande: result,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Erreur lors de la création de la commande: " + error });
            }
        });
    }
    static orderDuVendeur(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const sellerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!sellerId) {
                return res.status(401).json({ message: "Utilisateur non authentifié" });
            }
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;
                const orders = yield prisma_1.default.commande.findMany({
                    where: {
                        idVendeur: +sellerId,
                    },
                    include: {
                        articles: true,
                        user: {
                            select: {
                                nom: true,
                                prenom: true,
                                image: true,
                                telephone: true,
                            },
                        },
                    },
                    skip: offset,
                    take: limit,
                });
                // Custom sorting to prioritize 'non confirmé' status orders
                const sortedOrders = orders.sort((a, b) => {
                    if (a.etat === "non_confirme" && b.etat !== "non_confirme")
                        return -1;
                    if (a.etat !== "non_confirme" && b.etat === "non_confirme")
                        return 1;
                    return 0;
                });
                const totalOrders = yield prisma_1.default.commande.count({
                    where: { idVendeur: +sellerId },
                });
                res.status(200).json({
                    orders: sortedOrders,
                    totalOrders,
                    hasMore: offset + orders.length < totalOrders,
                });
            }
            catch (error) {
                console.error("Error fetching orders for seller:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des commandes", error });
            }
        });
    }
    static orderDuClient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const clientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!clientId) {
                return res.status(401).json({ message: "Utilisateur non authentifié" });
            }
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;
                const orders = yield prisma_1.default.commande.findMany({
                    where: {
                        idUser: +clientId,
                    },
                    include: {
                        articles: true,
                        vendeur: {
                            select: {
                                nom: true,
                                prenom: true,
                                image: true,
                                telephone: true,
                            },
                        },
                    },
                    skip: offset,
                    take: limit,
                });
                // Custom sorting to prioritize 'non confirmé' status orders
                const sortedOrders = orders.sort((a, b) => {
                    if (a.etat === "non_confirme" && b.etat !== "non_confirme")
                        return -1;
                    if (a.etat !== "non_confirme" && b.etat === "non_confirme")
                        return 1;
                    return 0;
                });
                const totalOrders = yield prisma_1.default.commande.count({
                    where: { idUser: +clientId },
                });
                res.status(200).json({
                    orders: sortedOrders,
                    totalOrders,
                    hasMore: offset + orders.length < totalOrders,
                });
            }
            catch (error) {
                console.error("Error fetching orders for client:", error);
                res.status(500).json({ message: "Erreur lors de la récupération des commandes", error });
            }
        });
    }
    // Méthode pour valider une commande
    static validateOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const orderId = parseInt(req.params.orderId, 10);
            const sellerId = +((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); // Utilisation de l'ID du vendeur à partir de req.user
            console.log("sedddd", sellerId, typeof (sellerId));
            if (!sellerId) {
                return res.status(401).json({ message: "Utilisateur non authentifié" });
            }
            try {
                // Vérifiez si la commande appartient bien au vendeur
                const order = yield prisma_1.default.commande.findUnique({
                    where: {
                        id: orderId,
                    },
                    include: {
                        user: true, // Inclure l'utilisateur pour vérification
                    },
                });
                if (!order) {
                    return res.status(404).json({ message: "Commande non trouvée" });
                }
                if (order.idVendeur !== +sellerId) {
                    return res.status(403).json({ message: "Vous n'êtes pas autorisé à valider cette commande" });
                }
                // Déterminer le nouvel état de la commande
                const newState = order.etat === "validee" ? "non_confirme" : "validee";
                // Mettre à jour l'état de la commande
                const updatedOrder = yield prisma_1.default.commande.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        etat: newState, // Modifier l'état de la commande
                    },
                });
                res.json(updatedOrder);
            }
            catch (error) {
                res.status(500).json({ message: "Erreur lors de la validation de la commande", error });
            }
        });
    }
    // Méthode pour lister les commandes passées par un client
    static sousCancell(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the order including the articles and their quantities
                const order = yield prisma_1.default.commande.findUnique({
                    where: {
                        id: orderId,
                    },
                    include: {
                        articles: {
                            select: {
                                idArticle: true,
                                quantite: true, // Quantité commandée pour chaque article
                            },
                        },
                    },
                });
                if (!order) {
                    throw new Error('Commande non trouvée');
                }
                // Return the articles to stock
                for (const article of order.articles) {
                    yield prisma_1.default.article.update({
                        where: { id: article.idArticle },
                        data: {
                            quantiteStock: {
                                increment: article.quantite, // Réajuster le stock en ajoutant la quantité commandée
                            },
                        },
                    });
                }
                // Delete the order
                yield prisma_1.default.commande.delete({
                    where: { id: order.id },
                });
                return { success: true };
            }
            catch (error) {
                console.error('Erreur lors du traitement de la commande:', error);
                return { success: false, error: error }; // Return error message for clarity
            }
        });
    }
    static deleteOrderAfter1W() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Date d'une semaine avant
            try {
                // Trouver toutes les commandes non validées et plus anciennes d'une semaine
                const pendingOrders = yield prisma_1.default.commande.findMany({
                    where: {
                        etat: 'non confirmé',
                        createdAt: {
                            lt: oneWeekAgo,
                        },
                    },
                });
                // Traiter chaque commande
                for (const order of pendingOrders) {
                    const result = yield UserController.sousCancell(order.id);
                    if (!result.success) {
                        console.error(`Erreur lors du traitement de la commande ${order.id}: ${result.error}`);
                    }
                }
            }
            catch (error) {
                console.error('Erreur lors du traitement des commandes non validées:', error);
            }
        });
    }
    static cancelOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = parseInt(req.params.orderId, 10);
            const order = yield prisma_1.default.commande.findUnique({
                where: {
                    id: orderId,
                },
                include: {
                    articles: {
                        select: {
                            idArticle: true,
                            quantite: true, // Quantité commandée pour chaque article
                        },
                    },
                },
            });
            if ((order === null || order === void 0 ? void 0 : order.etat) == "validée") {
                return res.status(404).json({ message: 'Commande deja validee par le deur appelez le pour que il le remmette a non confirmee ' });
            }
            try {
                const result = yield UserController.sousCancell(orderId);
                if (!result.success) {
                    return res.status(500).json({ message: 'Erreur lors de l\'annulation de la commande', error: result.error });
                }
                res.json({ message: 'Commande annulée avec succès' });
            }
            catch (error) {
                res.status(500).json({ message: 'Erreur lors de l\'annulation de la commande', error });
            }
        });
    }
    static deleteExpiredStories() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            yield prisma_1.default.post.deleteMany({
                where: {
                    expireAt: {
                        lte: now,
                    },
                },
            });
        });
    }
    static addCreditsToUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            // Ajouter des crédits aux utilisateurs 'tailleur'
            const tailleurUsers = yield prisma_1.default.user.findMany({
                where: { type: 'tailleur' },
            });
            yield Promise.all(tailleurUsers.map((user) => __awaiter(this, void 0, void 0, function* () {
                yield prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { credit: user.credit + 1 },
                });
            })));
            // Ajouter des crédits aux utilisateurs 'vendeur'
            const vendeurUsers = yield prisma_1.default.user.findMany({
                where: { type: 'vendeur' },
            });
            yield Promise.all(vendeurUsers.map((user) => __awaiter(this, void 0, void 0, function* () {
                yield prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { credit: user.credit + 1 },
                });
            })));
        });
    }
}
exports.default = UserController;
