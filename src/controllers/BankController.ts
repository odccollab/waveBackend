import { Response, Request } from "express";
import prisma from '../prisma'; // Assurez-vous d'importer votre client Prisma
import CloudUploadService from '../services/CloudUploadService'; 
class BankController {
  // Créer une nouvelle banque
  async createBank(req: Request, res: Response): Promise<Response> {
    try {
        const { nom_bank } = req.body;
        const file = req.file; // Récupérer le fichier uploadé

        if (!nom_bank) {
            return res.status(400).json({
                error: 'Le nom de la banque est requis',
            });
        }

        // Vérifiez si un fichier a été fourni pour l'upload
        let imageUrl!: string;
        if (file) {
            imageUrl = await CloudUploadService.uploadFile(file);
        }

        // Créer la banque dans la base de données
        const newBank = await prisma.bank.create({
            data: {
                nom_bank,
                photo: imageUrl, // Stockez l'URL de l'image dans le modèle de banque
            },
        });

        return res.status(201).json({
            message: 'Banque créée avec succès',
            bank: newBank,
        });
    } catch (error) {
        console.error('Erreur lors de la création de la banque:', error);
        return res.status(500).json({
            error: 'Erreur lors de la création de la banque',
        });
    }
}

  // Récupérer toutes les banques
  async getAllBanks(req: Request, res: Response): Promise<Response> {
    try {
      const banks = await prisma.bank.findMany();
      return res.status(200).json({
        success: true,
        data: banks,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des banques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des banques.',
      });
    }
  }

  // Récupérer une banque par son ID
  async getBankById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const bank = await prisma.bank.findUnique({
        where: { id: parseInt(id) },
      });

      if (!bank) {
        return res.status(404).json({ error: 'Banque non trouvée.' });
      }

      return res.status(200).json({
        success: true,
        data: bank,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la banque:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la banque.',
      });
    }
  }

  // Mettre à jour une banque
  async updateBank(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { nom_bank, photo } = req.body;

      const bank = await prisma.bank.findUnique({
        where: { id: parseInt(id) },
      });

      if (!bank) {
        return res.status(404).json({ error: 'Banque non trouvée.' });
      }

      const updatedBank = await prisma.bank.update({
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
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la banque:', error);
      return res.status(500).json({
        error: 'Erreur lors de la mise à jour de la banque.',
      });
    }
  }

  // Supprimer une banque
  async deleteBank(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const bank = await prisma.bank.findUnique({
        where: { id: parseInt(id) },
      });

      if (!bank) {
        return res.status(404).json({ error: 'Banque non trouvée.' });
      }

      await prisma.bank.delete({
        where: { id: parseInt(id) },
      });

      return res.status(200).json({
        message: 'Banque supprimée avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la banque:', error);
      return res.status(500).json({
        error: 'Erreur lors de la suppression de la banque.',
      });
    }
  }
}

export default new BankController();
