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
exports.contactController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ContactController {
    constructor() {
        // Créer un nouveau contact
        this.createContact = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Début createContact - Body reçu:', req.body);
                const { nom, prenom, telephone, email, userId } = req.body;
                console.log('Données extraites:', { nom, prenom, telephone, email, userId });
                if (!userId || !nom || !telephone) {
                    console.log('Validation échouée:', { userId, nom, telephone });
                    return res.status(400).json({
                        success: false,
                        message: 'Les champs userId, nom et telephone sont obligatoires'
                    });
                }
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId }
                });
                console.log('Utilisateur trouvé:', user);
                if (!user) {
                    console.log('Utilisateur non trouvé pour userId:', userId);
                    return res.status(404).json({
                        success: false,
                        message: 'Utilisateur non trouvé'
                    });
                }
                const existingContact = yield prisma_1.default.contact.findFirst({
                    where: {
                        userId: userId,
                        telephone: telephone
                    }
                });
                console.log('Contact existant:', existingContact);
                if (existingContact) {
                    console.log('Contact en double détecté');
                    return res.status(400).json({
                        success: false,
                        message: 'Un contact avec ce numéro de téléphone existe déjà pour cet utilisateur'
                    });
                }
                const contact = yield prisma_1.default.contact.create({
                    data: {
                        nom,
                        prenom: prenom || '',
                        telephone,
                        userId
                    }
                });
                console.log('Contact créé avec succès:', contact);
                return res.status(201).json({
                    success: true,
                    message: 'Contact créé avec succès',
                    data: contact
                });
            }
            catch (error) {
                console.error('Erreur détaillée création contact:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de la création du contact'
                });
            }
        });
        // Récupérer tous les contacts d'un utilisateur
        this.getContacts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const search = req.query.search;
                const skip = (page - 1) * limit;
                const whereClause = Object.assign({ userId: userId }, (search && {
                    OR: [
                        { nom: { contains: search, mode: 'insensitive' } },
                        { prenom: { contains: search, mode: 'insensitive' } },
                        { telephone: { contains: search } },
                        // { email: { contains: search, mode: 'insensitive' } }
                    ]
                }));
                const [contacts, total] = yield Promise.all([
                    prisma_1.default.contact.findMany({
                        where: whereClause,
                        skip,
                        take: limit,
                        orderBy: {
                            nom: 'asc'
                        }
                    }),
                    prisma_1.default.contact.count({
                        where: whereClause
                    })
                ]);
                return res.status(200).json({
                    success: true,
                    data: {
                        contacts,
                        pagination: {
                            total,
                            pages: Math.ceil(total / limit),
                            currentPage: page,
                            limit
                        }
                    }
                });
            }
            catch (error) {
                console.error('Erreur récupération contacts:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de la récupération des contacts'
                });
            }
        });
        // Récupérer un contact spécifique
        this.getContact = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const contactId = parseInt(req.params.id);
                const contact = yield prisma_1.default.contact.findUnique({
                    where: {
                        id: contactId
                    }
                });
                if (!contact) {
                    return res.status(404).json({
                        success: false,
                        message: 'Contact non trouvé'
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: contact
                });
            }
            catch (error) {
                console.error('Erreur récupération contact:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de la récupération du contact'
                });
            }
        });
        // Mettre à jour un contact
        this.updateContact = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const contactId = parseInt(req.params.id);
                const updateData = req.body;
                const existingContact = yield prisma_1.default.contact.findUnique({
                    where: {
                        id: contactId
                    }
                });
                if (!existingContact) {
                    return res.status(404).json({
                        success: false,
                        message: 'Contact non trouvé'
                    });
                }
                if (updateData.telephone && updateData.telephone !== existingContact.telephone) {
                    const duplicatePhone = yield prisma_1.default.contact.findFirst({
                        where: {
                            userId: existingContact.userId,
                            telephone: updateData.telephone,
                            NOT: {
                                id: contactId
                            }
                        }
                    });
                    if (duplicatePhone) {
                        return res.status(400).json({
                            success: false,
                            message: 'Un autre contact avec ce numéro de téléphone existe déjà'
                        });
                    }
                }
                const updatedContact = yield prisma_1.default.contact.update({
                    where: {
                        id: contactId
                    },
                    data: {
                        nom: (_a = updateData.nom) !== null && _a !== void 0 ? _a : existingContact.nom,
                        prenom: (_b = updateData.prenom) !== null && _b !== void 0 ? _b : existingContact.prenom,
                        telephone: (_c = updateData.telephone) !== null && _c !== void 0 ? _c : existingContact.telephone,
                        // email: updateData.email ?? existingContact.email 
                    }
                });
                return res.status(200).json({
                    success: true,
                    message: 'Contact mis à jour avec succès',
                    data: updatedContact
                });
            }
            catch (error) {
                console.error('Erreur mise à jour contact:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de la mise à jour du contact'
                });
            }
        });
        // Supprimer un contact
        this.deleteContact = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const contactId = parseInt(req.params.id);
                const existingContact = yield prisma_1.default.contact.findUnique({
                    where: {
                        id: contactId
                    }
                });
                if (!existingContact) {
                    return res.status(404).json({
                        success: false,
                        message: 'Contact non trouvé'
                    });
                }
                yield prisma_1.default.contact.delete({
                    where: {
                        id: contactId
                    }
                });
                return res.status(200).json({
                    success: true,
                    message: 'Contact supprimé avec succès'
                });
            }
            catch (error) {
                console.error('Erreur suppression contact:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Une erreur est survenue lors de la suppression du contact'
                });
            }
        });
    }
}
exports.contactController = new ContactController();
