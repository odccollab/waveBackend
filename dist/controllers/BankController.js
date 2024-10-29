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
const prisma_1 = __importDefault(require("../prisma")); // Assurez-vous d'importer votre client Prisma
const CloudUploadService_1 = __importDefault(require("../services/CloudUploadService"));
class BankController {
    // Créer une nouvelle banque
    createBank(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nom_bank } = req.body;
                const file = req.file; // Récupérer le fichier uploadé
                if (!nom_bank) {
                    return res.status(400).json({
                        error: 'Le nom de la banque est requis',
                    });
                }
                // Vérifiez si un fichier a été fourni pour l'upload
                let imageUrl;
                if (file) {
                    imageUrl = yield CloudUploadService_1.default.uploadFile(file);
                }
                // Créer la banque dans la base de données
                const newBank = yield prisma_1.default.bank.create({
                    data: {
                        nom_bank,
                        photo: imageUrl, // Stockez l'URL de l'image dans le modèle de banque
                    },
                });
                return res.status(201).json({
                    message: 'Banque créée avec succès',
                    bank: newBank,
                });
            }
            catch (error) {
                console.error('Erreur lors de la création de la banque:', error);
                return res.status(500).json({
                    error: 'Erreur lors de la création de la banque',
                });
            }
        });
    }
    // Récupérer toutes les banques
    getAllBanks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const banks = yield prisma_1.default.bank.findMany();
                return res.status(200).json({
                    success: true,
                    data: banks,
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des banques:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des banques.',
                });
            }
        });
    }
    // Récupérer une banque par son ID
    getBankById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const bank = yield prisma_1.default.bank.findUnique({
                    where: { id: parseInt(id) },
                });
                if (!bank) {
                    return res.status(404).json({ error: 'Banque non trouvée.' });
                }
                return res.status(200).json({
                    success: true,
                    data: bank,
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération de la banque:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération de la banque.',
                });
            }
        });
    }
    // Mettre à jour une banque
    updateBank(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { nom_bank, photo } = req.body;
                const bank = yield prisma_1.default.bank.findUnique({
                    where: { id: parseInt(id) },
                });
                if (!bank) {
                    return res.status(404).json({ error: 'Banque non trouvée.' });
                }
                const updatedBank = yield prisma_1.default.bank.update({
                    where: { id: parseInt(id) },
                    data: {
                        nom_bank,
                        photo,
                    },
                });
                return res.status(200).json({
                    message: 'Banque mise à jour avec succès.',
                    bank: updatedBank,
                });
            }
            catch (error) {
                console.error('Erreur lors de la mise à jour de la banque:', error);
                return res.status(500).json({
                    error: 'Erreur lors de la mise à jour de la banque.',
                });
            }
        });
    }
    // Supprimer une banque
    deleteBank(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const bank = yield prisma_1.default.bank.findUnique({
                    where: { id: parseInt(id) },
                });
                if (!bank) {
                    return res.status(404).json({ error: 'Banque non trouvée.' });
                }
                yield prisma_1.default.bank.delete({
                    where: { id: parseInt(id) },
                });
                return res.status(200).json({
                    message: 'Banque supprimée avec succès.',
                });
            }
            catch (error) {
                console.error('Erreur lors de la suppression de la banque:', error);
                return res.status(500).json({
                    error: 'Erreur lors de la suppression de la banque.',
                });
            }
        });
    }
}
exports.default = new BankController();
