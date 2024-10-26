// import { Request, Response } from "express";
// import prisma from "../prisma";
// import nodemailer from "nodemailer";
//
// import UserController from "./UserController";
// import Post from "../models/Post";
// import {Article} from "@prisma/client";
// import PostModel from "../models/Post";
// import user from "../models/User";
//
// export default class PostController {
//   static async createPost(req: Request, res: Response): Promise<void> {
//     const { contenu, urls, type } = req.body;
//     const contenuMedia=urls.contenuMedia
//     console.log(urls,"depuis controller")
//     try {
//       const userId = req.user?.id ? parseInt(req.user.id, 10) : null;
//
//       if (!userId) {
//         res.status(401).send("Unauthorized");
//         return;
//       }
//       const user = await prisma.user.findUnique({ where: { id: userId } });
//
//       if (!user) {
//         res.status(404).send("User not found");
//         return;
//       }
//
//       const postData: any = {
//         contenu,
//         createdAt: new Date(),
//         user: { connect: { id: userId } },
//       };
//
//       if (contenuMedia && Array.isArray(contenuMedia)) {
//         postData.contenuMedia = {
//           create: contenuMedia.map((url: string) => ({ url })),
//         };
//       }
//
//       if (type === "story") {
//         const expireAt = new Date();
//         expireAt.setHours(expireAt.getHours() + 24);
//         postData.expireAt = expireAt;
//       }
//
//       const post = await prisma.post.create({
//         data: postData,
//         include: {
//           user: { select: {id: true, nom: true, prenom: true, image: true } },
//           viewers: { select: { userId: true } },
//           contenuMedia: { select: { url: true } },
//         },
//       });
//
//       await prisma.user.update({
//         where: { id: userId },
//         data: { credit: { decrement: 1 } },
//       });
//
//       res.status(201).json(post);
//     } catch (err: any) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
//   }
//
//   static async deleteStoryExpire(): Promise<void> {
//     try {
//       const now = new Date();
//       const result = await prisma.post.deleteMany({
//         where: {
//           expireAt: {
//             lte: now,
//           },
//         },
//       });
//       console.log(`Expired stories deleted: ${result.count}`);
//     } catch (err) {
//       console.error("Error deleting expired stories:", err);
//     }
//   }
//   static async modifyPost(req: Request, res: Response): Promise<Response> {
//     try {
//       const { postId } = req.params;
//       const { contenu, contenuMedia } = req.body;
//
//       const post = await prisma.post.findUnique({
//         where: { id: Number(postId) },
//         include: { contenuMedia: true }, // Inclure les médias associés
//       });
//
//       if (!post && post!.idUser == +req.user?.id!) {
//         return res.status(404).json({ message: "Post non trouvé" });
//       }
//
//       const updatedPostData: any = {
//         contenu: contenu || post!.contenu,
//       };
//
//       if (contenuMedia && contenuMedia.length > 0) {
//         updatedPostData.contenuMedia = {
//           deleteMany: {},
//           create: contenuMedia.map((url: string) => ({ url })),
//         };
//       }
//
//       const updatedPost = await prisma.post.update({
//         where: { id: Number(postId) },
//         data: updatedPostData,
//       });
//       console.log("ici");
//
//       return res
//         .status(200)
//         .json({ message: "Post mis à jour avec succès", post: updatedPost });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({ message: "Erreur lors de la mise à jour du post", error });
//     }
//   }
//   static async deletePost(req: Request, res: Response): Promise<Response> {
//     const { id } = req.params;
//     const userId = req.user?.id; // Assure-toi que req.userId est défini par un middleware d'authentification
//
//     // Vérifier si l'ID est un nombre valide
//     const postId = Number(id);
//     if (isNaN(postId)) {
//       return res.status(400).json({ message: "ID is not valid" });
//     }
//
//     try {
//       // Trouver le post
//       const post = await prisma.post.findUnique({
//         where: { id: postId },
//         select: { idUser: true }, // Sélectionne uniquement le userId pour vérifier la propriété
//       });
//
//       if (!post) {
//         return res.status(404).json({ message: "Post not found" });
//       }
//
//       if (post.idUser !== +userId!) {
//         return res
//           .status(403)
//           .json({ message: "You are not authorized to delete this post" });
//       }
//       console.log(postId);
//
//       await prisma.post.delete({
//         where: { id: postId },
//       });
//
//       return res.json({ message: "Post deleted successfully" });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Server Error" });
//     }
//   }
//   static async handleLikeDislike(req: Request, res: Response) {
//     const { type, idpost } = req.params;
//     const userId = +req.user?.id!; // Assuming req.id is added by verifyToken middleware
//
//     if (!["like", "dislike", "neutre"].includes(type)) {
//       return res.status(400).send("Invalid type");
//     }
//
//     try {
//       const post = await prisma.post.findUnique({
//         where: { id: parseInt(idpost) },
//         include: {
//           likeDislike: true,
//         },
//       });
//
//       if (!post) {
//         return res.status(404).send("Post not found");
//       }
//
//       const existingEntry = post.likeDislike.find(
//         (entry) => entry.userId === userId
//       );
//
//       if (existingEntry) {
//         if (type === "neutre") {
//           // Remove the entry from likeDislike if "neutre"
//           await prisma.likeDislike.delete({
//             where: { id: existingEntry.id },
//           });
//         } else {
//           // Update the type if it's not "neutre"
//           await prisma.likeDislike.update({
//             where: { id: existingEntry.id },
//             data: { type },
//           });
//         }
//       } else if (type !== "neutre") {
//         // Add a new entry if it doesn't exist and the type is not "neutre"
//         await prisma.likeDislike.create({
//           data: {
//             type,
//             userId,
//             postId: post.id,
//           },
//         });
//       }
//       const connectedUser= await prisma.user.findUnique({
//         where:{id:userId}
//
//       })
//       let message = `${connectedUser!.image} ${connectedUser!.prenom}  ${connectedUser!.nom} a liker votre post `;
//       UserController.addNotification(Number(userId), message,connectedUser!.id,"post",+idpost);
//       // Re-fetch the updated post to send back
//       const updatedPost = await prisma.post.findUnique({
//         where: { id: parseInt(idpost) },
//         include: {
//           likeDislike: true,
//         },
//       });
//
//       res.json(updatedPost);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server Error");
//     }
//   }
//
//   static async articleByUser(req: Request, res: Response) {
//     let userId = +req.params.userId;
//     if (!userId) {
//       userId = +req.user?.id!;
//     }
//
//     const { offset, limit } = UserController.getPaginationParams(req);
//
//     try {
//       const articles = await prisma.article.findMany({
//         where: { idVendeur: userId },
//         skip: offset,
//         take: limit,
//       });
//
//       const totalArticles = await prisma.article.count({ where: { idVendeur: userId } });
//
//       const hasMore = offset + articles.length < totalArticles;
//
//       return res.json({
//         articles,
//         pagination: {
//           hasMore,
//           total: totalArticles,
//           limit,
//           offset
//         }
//       });
//     } catch (error) {
//       return res.status(500).json({ error: 'An error occurred while fetching articles.' });
//     }
//   }
//
//   static async getPostStoryById(req: Request, res: Response) {
//     const id = req.params.id ? Number(req.params.id) : Number(req.user?.id);
//     const { offset, limit } = UserController.getPaginationParams(req);
//
//     try {
//       const posts = await PostController.getPostOrStoryByUser(id, "post", offset, limit);
//       const totalPosts = await PostController.getPostOrStoryByUser(id, "post");
//
//       const stories = await PostController.getPostOrStoryByUser(id, "story", offset, limit);
//       const totalStories = await PostController.getPostOrStoryByUser(id, "story");
//
//       const hasMorePosts = offset + posts.length < totalPosts.length;
//       const hasMoreStories = offset + stories.length < totalStories.length;
//       const enhancedPosts = await PostController.poste(posts, id);
//       const data = {
//         posts: {
//           data: posts,
//           pagination: {
//             hasMore: hasMorePosts,
//             total: totalPosts,
//             limit,
//             offset
//           }
//         },
//         stories: {
//           data: stories,
//           pagination: {
//             hasMore: hasMoreStories,
//             total: totalStories,
//             limit,
//             offset
//           }
//         }
//       };
//
//       return res.json({posts:enhancedPosts,stories});
//     } catch (error) {
//       return res.status(500).json({ error: 'An error occurred while fetching posts and stories.' });
//     }
//   }
//
//   static async fileActu(req: Request, res: Response) {
//     const userId = req.user?.id ? +req.user.id : undefined;
//
//     try {
//       const [posts, stories, articles] = await Promise.all([
//         PostController.getStoriOrPost("post"),
//         PostController.getStoriOrPost("story"),
//         PostController.getArticlesWithCounts(),
//       ]);
//
//       const sortedArticles = articles.sort((a, b) => b.orderCount - a.orderCount);
//
//       if (!userId) {
//         return res.json({ posts, stories, articles: sortedArticles });
//       }
//
//       const sortedPosts = PostController.sortByViewStatus(posts, userId);
//       const sortedStories = PostController.sortByViewStatus(stories, userId);
//
//       res.json({ posts: sortedPosts, stories: sortedStories, articles: sortedArticles });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Server Error" });
//     }
//   }
//
//   static async getStoriOrPost(type: "story" | "post", offset: number = 0, limit: any = undefined) {
//     return prisma.post.findMany({
//       where: {
//         expireAt: type === "story" ? { not: null } : null,
//       },
//       orderBy: { [type === "story" ? "expireAt" : "createdAt"]: "desc" },
//       skip: offset,
//       take: limit,
//       include: {
//         user: { select: {id:true, nom: true, prenom: true, image: true } },
//         viewers: { select: { userId: true } },
//         contenuMedia: { select: { url: true } },
//       },
//     });
//   }
//   static async getPostById(req:Request,res:Response) {
//     const userId = req.user?.id ? +req.user.id : undefined;
//     const postId=+req.params.id;
//     let post = await prisma.post.findMany({
//       where: {
//         id:  postId
//       },
//       include: {
//         user: { select: {id:true, nom: true, prenom: true, image: true } },
//         viewers: { select: { userId: true } },
//         contenuMedia: { select: { url: true } },
//       },
//     });
//     if (!post) {
//       return res.status(401).json("post non trouver")
//     }
//     if(userId){
//       post = await PostController.poste(post, +userId);
//       return res.status(201).json(post)
//     }
//     return res.status(201).json(post)
//   }
//
//   private static async getArticlesWithCounts(offset: number = 0, limit: number = 10) {
//     const articles = await prisma.article.findMany({
//       skip: offset,
//       take: limit,
//       include: {
//         vendeur: { select: { id:true,nom: true, prenom: true, telephone: true, image: true } },
//         commandes: true,
//       },
//     });
//
//     return articles.map(article => ({
//       ...article,
//       orderCount: article.commandes.length,
//     }));
//   }
//   public static async getPostsAndStories(req: Request, res: Response) {
//     const userId = req.user?.id ? +req.user.id : undefined;
//     const page = parseInt(req.query.page as string, 10) || 1;
//     const limit = parseInt(req.query.limit as string, 10) || 10;
//     const offset = (page - 1) * limit;
//
//     try {
//       const [posts, stories] = await Promise.all([
//         PostController.getStoriOrPost("post", offset, limit),
//         PostController.getStoriOrPost("story"),
//       ]);
//
//       if (userId) {
//         const enhancedPosts = await PostController.poste(posts, userId);
//         const sortedPosts = PostController.sortByViewStatus(enhancedPosts, userId);
//         const sortedStories = PostController.sortByViewStatus(stories, userId);
//         return res.json({ posts: sortedPosts, stories: sortedStories });
//       }
//       res.json({ posts, stories });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Server Error" });
//     }
//   }
//
//   static async getArticles(req: Request, res: Response) {
//     const page = parseInt(req.query.page as string, 10) || 1;
//     const limit = parseInt(req.query.limit as string, 10) || 10;
//     const offset = (page - 1) * limit;
//
//     try {
//       const articles = await PostController.getArticlesWithCounts(offset, limit);
//       const sortedArticles = articles.sort((a, b) => b.orderCount - a.orderCount);
//
//       res.json({ articles: sortedArticles });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Server Error" });
//     }
//   }
//
//
//   private static sortByViewStatus(items: any[], userId: number) {
//     return items.sort((a, b) => {
//       const aSeen = a.viewers.some((viewer: { userId: number }) => viewer.userId === userId);
//       const bSeen = b.viewers.some((viewer: { userId: number }) => viewer.userId === userId);
//       return aSeen === bSeen ? 0 : aSeen ? 1 : -1;
//     });
//   }
//
//   static async getPostOrStoryByUser(userId: number, type: string, offset?: number, limit?: number) {
//     let whereCondition: any = {
//       idUser: userId,
//     };
//
//     if (type === "story") {
//       whereCondition.expireAt = {
//         not: null,
//       };
//     } else {
//       whereCondition.expireAt = null;
//     }
//
//     return await prisma.post.findMany({
//       where: whereCondition,
//       orderBy: {
//         expireAt: type === "story" ? "desc" : undefined,
//         createdAt: type === "post" ? "desc" : undefined,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             nom: true,
//             prenom: true,
//             image: true,
//           },
//         },
//         viewers: {
//           select: {
//             userId: true,
//           },
//
//         },
//         contenuMedia:{
//           select:{
//             url:true
//           }
//         }
//       },
//       skip: offset ?? 0,   // Utilise offset si défini, sinon 0 par défaut
//       take: limit ?? undefined, // Utilise limit si défini, sinon pas de limite
//     });
//   }
//
//   static async sharePost(req: Request, res: Response) {
//     const { postId, userIds }: { postId: number; userIds: number[] } = req.body;
//     const connectedUserId=req.user!.id
//     if (!postId || !userIds.every((id) => id)) {
//       return res.status(400).json({ error: "Invalid postId or userIds" });
//     }
//
// const connectedUser= await prisma.user.findUnique({
//   where:{id:+connectedUserId}
//
// })
//     console.log(connectedUser)
//     try {
//       const post = await prisma.post.findUnique({ where: { id: postId } });
//       if (!post) {
//         return res.status(404).json({ error: "Post not found" });
//       }
// //utiliser where in
//       for (const userId of userIds) {
//         await prisma.user.update({
//           where: { id: userId },
//           data: {
//             sharedPosts: {
//               connect: { id: postId },
//             },
//           },
//         });
//
//         let message = `${connectedUser!.image} ${connectedUser!.prenom} ${connectedUser!.prenom} ${connectedUser!.nom} vous a partager un post `;
//         UserController.addNotification(Number(userId), message,connectedUser!.id,"post",postId);
//       }
//
//       res.status(200).json({ message: "Post shared successfully" });
//     } catch (error) {
//       res.status(500).json({ error: error });
//     }
//   }
//
//   static async shareByEmail(req: Request, res: Response) {
//     try {
//       const { postId, email }: { postId: string; email: string } = req.body;
//       const post = await prisma.post.findUnique({ where: { id: +postId } });
//
//       if (!post) {
//         return res.status(404).json({ message: "Post non trouvé" });
//       }
//       let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER!,
//           pass: process.env.EMAIL_PASS!,
//         },
//       });
//
//       let mailOptions = {
//         from: process.env.EMAIL_USER!,
//         to: email,
//         subject: `Découvrez ce post !`,
//         text: `Je trouve ce post intéressant, jetez un œil : ${post.contenu}\nLien: ${process.env.BASE_URL}/posts/${postId}`,
//       };
//
//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           return res.status(500).json({ error: error.message });
//         }
//         res.status(200).json({ message: "E-mail envoyé avec succès" });
//       });
//     } catch (error) {
//       res.status(500).json({ error: error });
//     }
//   }
//   static async shareOnFacebook(req: Request, res: Response) {
//     try {
//       const { postId }: { postId: string } = req.body;
//       const post = await prisma.post.findUnique({ where: { id: +postId } });
//
//       if (!post) {
//         return res.status(404).json({ message: "Post non trouvé" });
//       }
//
//       const postUrl = `${process.env.BASE_URL}/posts/${postId}`;
//       const facebookShareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
//         postUrl
//       )}`;
//
//       res.json({ link: facebookShareLink });
//     } catch (error) {
//       res.status(500).json({ error: error });
//     }
//   }
//   static async poste(posts: any[], userId: number) {
//     // Récupérer les posts que l'utilisateur a liké ou disliké
//     const postReactions = await prisma.likeDislike.findMany({
//       where: {
//         userId: userId,
//         postId: { in: posts.map(post => post.id) }, // Vérifier pour tous les posts affichés
//       },
//       select: {
//         postId: true,
//         type: true, // Assuming 'type' contains 'like', 'dislike', or 'neutral'
//       },
//     });
//
//     // Récupérer les posts que l'utilisateur a mis en favoris
//     const favoritePosts = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         favoris: {
//           where: {
//             id: { in: posts.map(post => post.id) } // Vérifier pour tous les posts affichés
//           },
//           select: {
//             id: true,
//           },
//         },
//       },
//     });
//
//     // Récupérer les utilisateurs que l'utilisateur connecté suit
//     const followedUsers = await prisma.follower.findMany({
//       where: {
//         followerId: userId, // L'utilisateur connecté est le suiveur
//         userId: { in: posts.map(post => post.idUser) }, // Les utilisateurs ayant posté
//       },
//       select: {
//         userId: true,
//       },
//     });
//
//     // Mapper les posts pour ajouter les informations (like/dislike/neutral, favorite, following)
//     return posts.map(post => {
//       // Trouver la réaction de l'utilisateur pour ce post
//       const reaction = postReactions.find(reaction => reaction.postId === post.id);
//       let reactionType = 'neutre'; // Par défaut, c'est neutre
//
//       if (reaction) {
//         reactionType = reaction.type; // Peut être 'like' ou 'dislike'
//       }
//
//       return {
//         ...post,
//         likeStatus: reactionType, // Peut être 'like', 'dislike', ou 'neutral'
//         favorite: favoritePosts?.favoris.some(fav => fav.id === post.id), // Si le post est mis en favoris par cet utilisateur
//         following: followedUsers.some(follow => follow.userId === post.idUser), // Si l'utilisateur connecté suit l'auteur du post
//       };
//     });
//   }
//
//   static async shareOnWhatsApp(req: Request, res: Response) {
//     try {
//       const { postId }: { postId: string } = req.body;
//       const post = await prisma.post.findUnique({ where: { id: +postId } });
//
//       if (!post) {
//         return res.status(404).json({ message: "Post non trouvé" });
//       }
//
//       const message = `Découvrez ce post intéressant : ${post.contenu}\nLien: ${process.env.BASE_URL}/post/${postId}`;
//       const whatsappShareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
//         message
//       )}`;
//
//       res.json({ link: whatsappShareLink });
//     } catch (error) {
//       res.status(500).json({ error: error });
//     }
//   }
//   static async addComment(req: Request, res: Response) {
//     const { postId } = req.params;
//     const { text } = req.body;
//     const userIdString = req.user?.id;
//     const post = await prisma.post.findUnique({
//       where: { id: parseInt(postId, 10) },
//       include: { viewers: true },
//     });
//
//     if (!post) {
//       res.status(404).send("Post not found");
//       return;
//     }
//     if (!userIdString) {
//       return res.status(400).send("User ID is missing");
//     }
//
//     const userId = parseInt(userIdString, 10);
//
//     if (isNaN(userId)) {
//       return res.status(400).send("Invalid User ID");
//     }
//
//     try {
//
//       // Création du nouveau commentaire
//       const newComment = await prisma.comment.create({
//         data: {
//           content: text.trim(),
//           userId, // userId is a number
//           postId: parseInt(postId, 10),
//         },
//         include: {
//           user: {
//             select: {
//               id: true,
//               nom: true,
//               prenom: true,
//               image: true,
//             },
//           },
//         },
//       });
//       const connectedUser= await prisma.user.findUnique({
//         where:{id:userId}
//
//       })
//       let message = `${connectedUser!.image} ${connectedUser!.prenom} ${connectedUser!.prenom} ${connectedUser!.nom} vous a partager un post `;
//       UserController.addNotification(Number(userId), message);
//       res.json(newComment);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server Error");
//     }
//   }
//
//   static async getComments(req: Request, res: Response) {
//     const { postId } = req.params;
//     const post = await prisma.post.findUnique({
//       where: { id: parseInt(postId, 10) },
//       include: { viewers: true },
//     });
//
//     if (!post) {
//       res.status(404).send("Post not found");
//       return;
//     }
//     try {
//       const comments = await prisma.comment.findMany({
//         where: { postId: parseInt(postId, 10) },
//         include: {
//           user: {
//             select: {
//               id: true,
//               nom: true,
//               prenom: true,
//               image: true,
//             },
//           },
//         },
//       });
//
//       if (!comments.length) {
//         return res.status(404).send("No comments found for this post");
//       }
//
//       res.json(comments);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server Error");
//     }
//   }
//
//   static async updateComment(req: Request, res: Response) {
//     const { postId, commentId } = req.params;
//     const { content } = req.body;
//
//     if (!commentId) {
//       return res.status(400).send("Comment ID is missing");
//     }
//     const post = await prisma.post.findUnique({
//       where: { id: parseInt(postId, 10) },
//       include: { viewers: true },
//     });
//
//     if (!post) {
//       res.status(404).send("Post not found");
//       return;
//     }
//     //verifier si le comm a ete fait par celui qui est connecter
//     try {
//       const updatedComment = await prisma.comment.update({
//         where: {
//           id: parseInt(commentId, 10), // Convertir commentId en nombre
//           postId: parseInt(postId, 10), // Convertir postId en nombre
//         },
//         data: {
//           content,
//           updatedAt: new Date(),
//         },
//       });
//
//       if (!updatedComment) {
//         return res.status(404).send("Comment not found");
//       }
//
//       res.json(updatedComment);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server Error");
//     }
//   }
//
//   static async deleteComment(req: Request, res: Response): Promise<void> {
//     const { postId, commentId } = req.params;
//
//     try {
//       // Trouver le post avec les commentaires associés
//       const post = await prisma.post.findUnique({
//         where: { id: parseInt(postId, 10) },
//         include: { comment: true }, // Changé de 'comments' à 'comment'
//       });
//
//       if (!post) {
//         res.status(404).json({ message: "Post not found" });
//         return;
//       }
//
//       // Vérifier si le commentaire existe
//       const comment = await prisma.comment.findUnique({
//         where: {
//           id: parseInt(commentId, 10),
//           postId: parseInt(postId, 10),
//         },
//       });
//
//       if (!comment) {
//         res.status(404).json({ message: "Comment not found" });
//         return;
//       }
//
//       // Supprimer le commentaire
//       await prisma.comment.delete({
//         where: { id: comment.id },
//       });
//
//       res.json({ message: "Comment deleted" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server Error" });
//     }
//   }
//
//   static async incrementViews(req: Request, res: Response): Promise<void> {
//     const postId = req.params.postId;
//     const userId = req.user?.id;
//
//     if (!userId) {
//       res.status(400).send("User ID is missing");
//       return;
//     }
//
//     try {
//       // Vérifiez que l'utilisateur existe
//       const user = await prisma.user.findUnique({
//         where: { id: parseInt(userId, 10) },
//       });
//
//       if (!user) {
//         res.status(404).send("User not found");
//         return;
//       }
//
//       // Vérifiez que le post existe
//       const post = await prisma.post.findUnique({
//         where: { id: parseInt(postId, 10) },
//         include: { viewers: true },
//       });
//
//       if (!post) {
//         res.status(404).send("Post not found");
//         return;
//       }
//
//       // Vérifiez si l'utilisateur a déjà vu le post
//       const viewerExists = post.viewers.some(
//         (viewer) => viewer.userId === parseInt(userId)
//       );
//
//       if (viewerExists) {
//         // Si l'utilisateur a déjà vu le post, renvoyez le nombre de vues
//         res.json({ views: post.viewers.length });
//         return;
//       }
//
//       // Ajoutez l'utilisateur comme vue du post
//       const updatedPost = await prisma.post.update({
//         where: { id: parseInt(postId, 10) },
//         data: {
//           viewers: {
//             create: { userId: parseInt(userId, 10) },
//           },
//         },
//         include: { viewers: true },
//       });
//       // Répondez avec le nombre de vues mises à jour
//       res.json({ views: updatedPost.viewers.length });
//     } catch (err) {
//       console.error("Server Error:", err);
//       res.status(500).send("Server Error");
//     }
//   }
//   static async getViews(req: Request, res: Response) {
//     const { postId } = req.params;
//
//     try {
//       const post = await prisma.post.findUnique({
//         where: { id: parseInt(postId, 10) },
//         include: { viewers: true },
//       });
//
//       if (!post) {
//         return res.status(404).send("Post not found");
//       }
//
//       res.json({
//         views: post.viewers.length,
//         viewerIds: post.viewers.map((viewer: { id: number }) => viewer.id),
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Server Error");
//     }
//   }
//
//   // ... Adaptez les autres méthode
//
//   //---------------------------SIGNALE_POST----------------------------------
//   static async signalPost(req: Request, res: Response): Promise<Response> {
//     const { motif, postId } = req.body;
//
//     try {
//       if (!motif || !postId) {
//         return res.status(400).send("Veuillez remplir tous les champs");
//       }
//
//       // Vérifier si l'utilisateur est connecté (supposons que req.user est défini)
//       const userId = req.user?.id;
//
//       if (!userId) {
//         return res.status(404).send("Vous n'êtes pas connecté");
//       }
//
//       const user = await prisma.user.findUnique({
//         where: { id: Number(userId) },
//       });
//
//       if (!user) {
//         return res.status(404).send("Utilisateur non trouvé");
//       }
//
//       // Vérifier si le post existe
//       const post = await prisma.post.findUnique({
//         where: { id: Number(postId) },
//       });
//
//       if (!post) {
//         return res.status(404).send("Post non trouvé");
//       }
//
//       // Vérifier si l'utilisateur a déjà signalé le post
//       const signalExists = await prisma.signale.findFirst({
//         where: { userId: Number(userId), postId: Number(postId) },
//       });
//
//       if (signalExists) {
//         return res.status(400).send("Vous avez déjà signalé ce post");
//       }
//
//       if (post.expireAt === null) {
//         await prisma.signale.create({
//           data: { motif, userId: Number(userId), postId: Number(postId) },
//         });
//
//         const signalCount = await prisma.signale.count({
//           where: { postId: Number(postId) },
//         });
//
//         if (signalCount >= 2) {
//           await prisma.post.delete({ where: { id: Number(postId) } });
//           // Ajouter une notification ici si nécessaire
//
//           await UserController.addNotification(
//             Number(userId),
//             "Ce post est supprimé en raison de trop de signalement"
//           );
//           return res.json({
//             message: "Post supprimé en raison de trop de signalements",
//           });
//         }
//
//         return res.json({ message: "Post signalé avec succès", data: post });
//       } else {
//         return res
//           .status(400)
//           .send("Ce post est expiré et ne peut pas être signalé");
//       }
//     } catch (err: unknown) {
//       if (typeof err === "object" && err !== null && "message" in err) {
//         const errorMessage = (err as { message: string }).message;
//         console.error(errorMessage);
//       } else {
//         console.error("Erreur inconnue");
//       }
//       return res.status(500).send("Erreur serveur");
//     }
//   }
//
//   //--------------------------Search_User_Posts------------------------
//   static async findUserOrPost(req: Request, res: Response): Promise<Response> {
//     const { value } = req.body;
//
//     try {
//       if (!value) {
//         return res
//           .status(400)
//           .json({ message: "Veuillez entrer une valeur de recherche" });
//       }
//
//       // Search for users
//       const users = await prisma.user.findMany({
//         where: {
//           OR: [{ nom: { contains: value } }, { prenom: { contains: value } }],
//         },
//         select: {
//           id: true,
//           nom: true,
//           prenom: true,
//           image: true,
//           telephone: true,
//         },
//       });
//
//       // Search for posts
//       let posts = await prisma.post.findMany({
//         skip: 0,
//         take: 30,
//         where: {
//           AND: [{ contenu: { contains: value } }, { expireAt: null }],
//         },
//         include: {
//           user: {
//             select: {
//               id: true,
//               nom: true,
//               prenom: true,
//               image: true,
//               telephone: true,
//             },
//           },
//             viewers: { select: { userId: true } },
//             contenuMedia: { select: { url: true } },
//
//
//         },
//       });
//
//       // Search for articles
//       const articles = await prisma.article.findMany({
//         where: {
//           libelle: { contains: value },
//         },
//         select: {
//           id: true,
//           libelle: true,
//           prixUnitaire: true,
//           quantiteStock: true,
//           description: true,
//           categorie: true,
//           vendeur: {
//             select: {
//               id: true,
//               nom: true,
//               prenom: true,
//               image: true,
//               telephone: true,
//             },
//           },
//         },
//       });
//
//       if (users.length === 0 && posts.length === 0 && articles.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "Aucun résultat trouvé", Data: null });
//       }
//       if(req.user!.id){
//
//        posts = await PostController.poste(posts, +req.user!.id);
//       }
//       return res.json({
//         message: "Résultats trouvés",
//         users: users,
//         posts: posts,
//         articles: articles,
//       });
//     } catch (err: unknown) {
//       if (typeof err === "object" && err !== null && "message" in err) {
//         const errorMessage = (err as { message: string }).message;
//         console.error(errorMessage);
//       } else {
//         console.error("Erreur inconnue");
//       }
//       return res.status(500).send("Erreur serveur");
//     }
//   }
//
//
// }
