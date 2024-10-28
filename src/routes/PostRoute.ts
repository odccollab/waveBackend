// import express, { Router,NextFunction } from 'express';
// import Middleware from '../middlewares/Middleware';
// import  PostController  from '../controllers/PostController';
// import upload from "../middlewares/multerConfig";
// import multer from "multer";

// const router:Router =  express.Router();

// // creer un post les variable requis { contenu, contenuMedia }

// // @ts-ignore
// // @ts-ignore
// // @ts-ignore
// // @ts-ignore
//     router.post(
//         '/create',
//         Middleware.verifyToken,
//         upload.fields([{ name: 'contenuMedia', maxCount: 10 }]),
//         (req, res, next) => {
//             console.log(req.files); // Vérifie que le champ `contenuMedia` contient des fichiers
//             next();
//         },
//         Middleware.dynamicUploadMiddleware,
//         Middleware.validateData("post"),
//         Middleware.canPost,
//         PostController.createPost
//     );

// router.get('/postall',Middleware.verifyToken, PostController.getPostsAndStories);
// router.get('/article',Middleware.verifyToken, PostController.getArticles);
// router.get('/postall-user',Middleware.verifyToken, PostController.getPostStoryById);
// router.get('/article-user',Middleware.verifyToken, PostController.articleByUser);
// router.get('/postall-d', PostController.getPostsAndStories);
// router.get('/article-d', PostController.getArticles);

// // //modifier un post les variable requis { contenu, contenuMedia }

// router.get('/:id',Middleware.verifyToken, PostController.getPostById);
// router.get('/:id', PostController.getPostById);
// router.put('/:postId',Middleware.verifyToken,Middleware.validateData("post"), PostController.modifyPost);
// // //recuperer tous les status
// //  router.get('/status', PostController.getAllStatus);
// // //delete a post
// router.delete('/:id',Middleware.verifyToken, PostController.deletePost);
// // //commentaire
// // //ajouter un commentaire les variable requis 
// // // const { postId, commentId } = req.params;
// // //     const { text } = req.body;
// router.post('/:postId/comment', Middleware.verifyToken, Middleware.validateData('comment'), PostController.addComment);
// // //recuperer tous les commentaires d'un post 
// router.get('/:postId/comment', PostController.getComments);
// // //modifier un commentaire  
// // // const { postId, commentId } = req.params;
// // //     const { text } = req.body;
// router.put('/:postId/comment/:commentId',Middleware.validateData('comment'), PostController.updateComment);
// // //supprimer un commentaire 
// router.delete('/:postId/comment/:commentId', PostController.deleteComment);
// // //story 
// // router.post('/createStory',Middleware.verifyToken,Middleware.validateData("post"),Middleware.canPost, PostController.createStory);


// // // Nouvelles routes pour les vues 
// router.get('/:postId/view',Middleware.verifyToken, PostController.incrementViews);
// // //voilr les vue d'un post 
// router.get('/:postId/views',Middleware.verifyToken, PostController.getViews);
// // //file actu 
// router.get('/accueil',Middleware.verifyToken,PostController.fileActu)
// router.get('/accueil2',PostController.fileActu)


// // //liker dislike
// router.post('/:type/:idpost',Middleware.verifyToken, PostController.handleLikeDislike);

// // //partage post a un user de l'appli
// router.post('/share',Middleware.verifyToken, PostController.sharePost);
// // //partage post a un user via email, facebook, whatsapp
// router.post('/share/email', PostController.shareByEmail);
// router.post('/share/facebook', PostController.shareOnFacebook);
// router.post('/share/whatsapp', PostController.shareOnWhatsApp);
// // //signale un use
//   router.post('/signale',Middleware.verifyToken, PostController.signalPost);
// //  //recherche utilisateur ou post ça prend  {value}
//  router.post('/find',Middleware.verifyToken, PostController.findUserOrPost);
//  export default router