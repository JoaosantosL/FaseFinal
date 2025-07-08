/**
 * @file uploadAlbumCover.js
 * @description
 * Middleware que trata do upload da imagem de capa de um álbum.
 * Usa multer para guardar em /public/uploads/covers/albums com filtro e limites.
 */

const multer = require("multer");
const path = require("path");

// ─────────────────────────────────────────────────────
// Configuração do armazenamento
// ─────────────────────────────────────────────────────

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../public/uploads/covers/albums"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e5
        )}${ext}`;
        cb(null, uniqueName);
    },
});

// ─────────────────────────────────────────────────────
// Filtro para aceitar apenas imagens válidas
// ─────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato inválido. Apenas JPEG, PNG ou WEBP."));
    }
};

// ─────────────────────────────────────────────────────
// Configuração do multer com limites
// ─────────────────────────────────────────────────────

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // Máx. 2MB
});

module.exports = upload.single("cover"); // campo 'cover' no formulário
