/**
 * @file uploadArtistImage.js
 * @description
 * Middleware que trata do upload da imagem de perfil do artista.
 * Usa multer para guardar em /public/uploads/artists com filtro e limites.
 */

const multer = require("multer");
const path = require("path");

// Define onde guardar os ficheiros
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../public/uploads/covers/artists"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e5
        )}${ext}`;
        cb(null, uniqueName);
    },
});

// Apenas imagens
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato inválido. Apenas JPEG, PNG ou WEBP."));
    }
};

// Limite de tamanho: 400x400 não é verificado aqui (é no frontend), mas limitamos a 2MB
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload.single("image"); // campo 'image' no formulário
