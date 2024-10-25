import multer from 'multer';
import path from 'path';

// Configuration de Multer pour stocker les fichiers dans un dossier temporaire avant l'upload à Cloudinary
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Assurez-vous que ce chemin existe sur le serveur
    },
    filename: (req, file, cb) => {
        cb(null,` ${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

export default upload;