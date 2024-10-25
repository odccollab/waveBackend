"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Middleware_1 = __importDefault(require("../middlewares/Middleware"));
const PostController_1 = __importDefault(require("../controllers/PostController"));
const multerConfig_1 = __importDefault(require("../middlewares/multerConfig"));
const router = express_1.default.Router();
// creer un post les variable requis { contenu, contenuMedia }
// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
router.post('/create', Middleware_1.default.verifyToken, multerConfig_1.default.fields([{ name: 'contenuMedia', maxCount: 10 }]), (req, res, next) => {
    console.log(req.files); // Vérifie que le champ `contenuMedia` contient des fichiers
    next();
}, Middleware_1.default.dynamicUploadMiddleware, Middleware_1.default.validateData("post"), Middleware_1.default.canPost, PostController_1.default.createPost);
router.get('/postall', Middleware_1.default.verifyToken, PostController_1.default.getPostsAndStories);
router.get('/article', Middleware_1.default.verifyToken, PostController_1.default.getArticles);
router.get('/postall-user', Middleware_1.default.verifyToken, PostController_1.default.getPostStoryById);
router.get('/article-user', Middleware_1.default.verifyToken, PostController_1.default.articleByUser);
router.get('/postall-d', PostController_1.default.getPostsAndStories);
router.get('/article-d', PostController_1.default.getArticles);
// //modifier un post les variable requis { contenu, contenuMedia }
router.get('/:id', Middleware_1.default.verifyToken, PostController_1.default.getPostById);
router.get('/:id', PostController_1.default.getPostById);
router.put('/:postId', Middleware_1.default.verifyToken, Middleware_1.default.validateData("post"), PostController_1.default.modifyPost);
// //recuperer tous les status
//  router.get('/status', PostController.getAllStatus);
// //delete a post
router.delete('/:id', Middleware_1.default.verifyToken, PostController_1.default.deletePost);
// //commentaire
// //ajouter un commentaire les variable requis 
// // const { postId, commentId } = req.params;
// //     const { text } = req.body;
router.post('/:postId/comment', Middleware_1.default.verifyToken, Middleware_1.default.validateData('comment'), PostController_1.default.addComment);
// //recuperer tous les commentaires d'un post 
router.get('/:postId/comment', PostController_1.default.getComments);
// //modifier un commentaire  
// // const { postId, commentId } = req.params;
// //     const { text } = req.body;
router.put('/:postId/comment/:commentId', Middleware_1.default.validateData('comment'), PostController_1.default.updateComment);
// //supprimer un commentaire 
router.delete('/:postId/comment/:commentId', PostController_1.default.deleteComment);
// //story 
// router.post('/createStory',Middleware.verifyToken,Middleware.validateData("post"),Middleware.canPost, PostController.createStory);
// // Nouvelles routes pour les vues 
router.get('/:postId/view', Middleware_1.default.verifyToken, PostController_1.default.incrementViews);
// //voilr les vue d'un post 
router.get('/:postId/views', Middleware_1.default.verifyToken, PostController_1.default.getViews);
// //file actu 
router.get('/accueil', Middleware_1.default.verifyToken, PostController_1.default.fileActu);
router.get('/accueil2', PostController_1.default.fileActu);
// //liker dislike
router.post('/:type/:idpost', Middleware_1.default.verifyToken, PostController_1.default.handleLikeDislike);
// //partage post a un user de l'appli
router.post('/share', Middleware_1.default.verifyToken, PostController_1.default.sharePost);
// //partage post a un user via email, facebook, whatsapp
router.post('/share/email', PostController_1.default.shareByEmail);
router.post('/share/facebook', PostController_1.default.shareOnFacebook);
router.post('/share/whatsapp', PostController_1.default.shareOnWhatsApp);
// //signale un use
router.post('/signale', Middleware_1.default.verifyToken, PostController_1.default.signalPost);
//  //recherche utilisateur ou post ça prend  {value}
router.post('/find', Middleware_1.default.verifyToken, PostController_1.default.findUserOrPost);
exports.default = router;
