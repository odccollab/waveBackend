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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class CompteController {
    deplafon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const compteId = 1;
            const prisma = new client_1.PrismaClient();
            const new_plafon_sold = 1000000;
            const compte = yield prisma.user.findUnique({ where: { id: compteId } });
            if (!compte) {
                console.error("Compte introuvable");
                return;
            }
            const solde_initial = compte.solde;
            const new_solde = solde_initial + new_plafon_sold;
            const updatedCompte = yield prisma.user.update({
                where: { id: compteId },
                data: { plafond: new_solde },
            });
            res.status(201).json({
                message: 'Déplafonnement effectué avec succès',
                updatedCompte,
            });
        });
    }
}
exports.default = new CompteController();
