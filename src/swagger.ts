import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API Title',
            version: '1.0.0',
            description: 'API Documentation',
        },
        servers: [
            {
                url: 'https://apitailleur-nz0e.onrender.com', // Change this to your server URL
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        nom: { type: 'string', example: 'Doe' },
                        prenom: { type: 'string', example: 'John' },
                        mail: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                        telephone: { type: 'string', example: '+123456789' },
                        type: { type: 'string', example: 'client' },
                        credit: { type: 'integer', example: 3 },
                        password: { type: 'string', example: 'hashed_password_here' },
                        image: { type: 'string', example: 'profile.jpg' },
                    },
                    required: ['nom', 'prenom', 'mail', 'telephone', 'type', 'password'],
                },
                Vote: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        idVoteur: { type: 'integer', example: 2 },
                        userId: { type: 'integer', example: 3 },
                    },
                    required: ['idVoteur', 'userId'],
                },
                Follower: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 2 },
                        followerId: { type: 'integer', example: 3 },
                    },
                    required: ['userId', 'followerId'],
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 2 },
                        content: { type: 'string', example: 'New message received' },
                        read: { type: 'boolean', example: false },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-08-22T14:00:00Z' },
                    },
                    required: ['userId', 'content'],
                },
                Message: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        senderId: { type: 'integer', example: 2 },
                        receiverId: { type: 'integer', example: 3 },
                        content: { type: 'string', example: 'Hello, how are you?' },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-08-22T14:00:00Z' },
                    },
                    required: ['senderId', 'receiverId', 'content'],
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        contenu: { type: 'string', example: 'This is a post content.' },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-08-22T14:00:00Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2024-08-22T14:00:00Z' },
                        expireAt: { type: 'string', format: 'date-time', example: '2024-09-22T14:00:00Z' },
                        idUser: { type: 'integer', example: 2 },
                    },
                    required: ['contenu', 'idUser'],
                },
                Media: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        url: { type: 'string', example: 'https://example.com/media.jpg' },
                        postId: { type: 'integer', example: 2 },
                    },
                    required: ['url', 'postId'],
                },
                Comment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        content: { type: 'string', example: 'This is a comment.' },
                        createdAt: { type: 'string', format: 'date-time', example: '2024-08-22T14:00:00Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2024-08-22T14:00:00Z' },
                        userId: { type: 'integer', example: 2 },
                        postId: { type: 'integer', example: 3 },
                    },
                    required: ['content', 'userId', 'postId'],
                },
                LikeDislike: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        type: { type: 'string', example: 'like' },
                        userId: { type: 'integer', example: 2 },
                        postId: { type: 'integer', example: 3 },
                    },
                    required: ['type', 'userId', 'postId'],
                },
                Signale: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        motif: { type: 'string', example: 'Inappropriate content' },
                        userId: { type: 'integer', example: 2 },
                        postId: { type: 'integer', example: 3 },
                    },
                    required: ['motif', 'userId', 'postId'],
                },
                Viewers: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        userId: { type: 'integer', example: 2 },
                        postId: { type: 'integer', example: 3 },
                    },
                    required: ['userId', 'postId'],
                },
                Article: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        idVendeur: { type: 'integer', example: 2 },
                        libelle: { type: 'string', example: 'Article Name' },
                        prixUnitaire: { type: 'number', example: 100.50 },
                        quantiteStock: { type: 'integer', example: 20 },
                    },
                    required: ['idVendeur', 'libelle', 'prixUnitaire', 'quantiteStock'],
                },
                Commande: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        articles: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    idArticle: { type: 'integer', example: 2 },
                                    quantite: { type: 'integer', example: 3 },
                                },
                            },
                        },
                    },
                    required: ['articles'],
                },
                // Add other schemas as necessary...
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Adjust the path according to your project structure
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
