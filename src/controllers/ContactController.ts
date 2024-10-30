import { Request, Response } from 'express';
import prisma from "../prisma";
import { Prisma } from '@prisma/client';

// Types pour les requêtes
interface CreateContactDto {
    nom: string;
    prenom?: string;
    telephone: string;
    email?: string;
    userId: number;
}

interface UpdateContactDto {
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
}

class ContactController {
    // Créer un nouveau contact
    public createContact = async (req: Request, res: Response) => {
        try {
            console.log('Début createContact - Body reçu:', req.body);
            
            const { nom, prenom, telephone, email, userId } = req.body as CreateContactDto;
            
            console.log('Données extraites:', { nom, prenom, telephone, email, userId });
    
            if (!userId || !nom || !telephone) {
                console.log('Validation échouée:', { userId, nom, telephone });
                return res.status(400).json({
                    success: false,
                    message: 'Les champs userId, nom et telephone sont obligatoires'
                });
            }
    
            const user = await prisma.user.findUnique({
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
    
            const existingContact = await prisma.contact.findFirst({
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
    
            const contact = await prisma.contact.create({
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
        } catch (error) {
            console.error('Erreur détaillée création contact:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la création du contact'
            });
        }
    }

    // Récupérer tous les contacts d'un utilisateur
    public getContacts = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.userId);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const skip = (page - 1) * limit;

            const whereClause: Prisma.ContactWhereInput = {
                userId: userId,
                ...(search && {
                    OR: [
                        { nom: { contains: search, mode: 'insensitive' } },
                        { prenom: { contains: search, mode: 'insensitive' } },
                        { telephone: { contains: search } },
                        // { email: { contains: search, mode: 'insensitive' } }
                    ]
                })
            };

            const [contacts, total] = await Promise.all([
                prisma.contact.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: {
                        nom: 'asc'
                    }
                }),
                prisma.contact.count({
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
        } catch (error) {
            console.error('Erreur récupération contacts:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des contacts'
            });
        }
    }

    // Récupérer un contact spécifique
    public getContact = async (req: Request, res: Response) => {
        try {
            const contactId = parseInt(req.params.id);

            const contact = await prisma.contact.findUnique({
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
        } catch (error) {
            console.error('Erreur récupération contact:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération du contact'
            });
        }
    }

    // Mettre à jour un contact
    public updateContact = async (req: Request, res: Response) => {
        try {
            const contactId = parseInt(req.params.id);
            const updateData = req.body as UpdateContactDto;

            const existingContact = await prisma.contact.findUnique({
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
                const duplicatePhone = await prisma.contact.findFirst({
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

            const updatedContact = await prisma.contact.update({
                where: {
                    id: contactId
                },
                data: {
                    nom: updateData.nom ?? existingContact.nom,
                    prenom: updateData.prenom ?? existingContact.prenom,
                    telephone: updateData.telephone ?? existingContact.telephone,
                    // email: updateData.email ?? existingContact.email 
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Contact mis à jour avec succès',
                data: updatedContact
            });
        } catch (error) {
            console.error('Erreur mise à jour contact:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la mise à jour du contact'
            });
        }
    }

    // Supprimer un contact
    public deleteContact = async (req: Request, res: Response) => {
        try {
            const contactId = parseInt(req.params.id);

            const existingContact = await prisma.contact.findUnique({
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

            await prisma.contact.delete({
                where: {
                    id: contactId
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Contact supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur suppression contact:', error);
            return res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la suppression du contact'
            });
        }
    }
}

export const contactController = new ContactController();