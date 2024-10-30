import { Response,Request } from "express";
import { PrismaClient } from "@prisma/client";

class CompteController{


    async deplafon(req:Request,res:Response): Promise<void>{
        const compteId= 1;
        const prisma = new PrismaClient();

        const new_plafon_sold=1000000;
        const compte = await prisma.user.findUnique({ where: { id: compteId } });

        if(!compte){
            console.error("Compte introuvable");
            return;
        }
        const solde_initial=compte.solde;
        const new_solde=solde_initial+new_plafon_sold;
         const updatedCompte = await prisma.user.update({
            where: { id: compteId },
            data: { plafond: new_solde },
        });
        res.status(201).json({
            message: 'Déplafonnement effectué avec succès',
            updatedCompte,
        });
    }
}

export default new CompteController();