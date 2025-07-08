/**
 * @file uploadMusicFiles.js
 * @description
 * Middleware que trata do upload dos ficheiros de música:
 * - Ficheiro de áudio (campo "audio")
 * - Capa da música (campo "cover")
 * Guarda os ficheiros em /public/uploads/audio e /public/uploads/covers/musics
 * Valida os tipos e limita os tamanhos.
 */

const multer = require("multer");
const path = require("path");

// ─────────────────────────────────────────────
// Armazenamento dinâmico (baseado no campo)
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = "";

        if (file.fieldname === "audio") {
            folder = "audio";
        } else if (file.fieldname === "cover") {
            folder = "covers/musics";
        } else {
            return cb(new Error("Campo de ficheiro inválido"));
        }

        cb(null, path.join(__dirname, "../../public/uploads/", folder));
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
        const timestamp = Date.now();
        cb(null, `${base}_${timestamp}${ext}`);
    },
});

// ─────────────────────────────────────────────
// Filtro de tipos de ficheiros
// ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "audio") {
        const allowed = ["audio/mpeg", "audio/mp3", "audio/wav"];
        return allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(new Error("Ficheiro de áudio inválido (apenas mp3 ou wav)"));
    }

    if (file.fieldname === "cover") {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        return allowed.includes(file.mimetype)
            ? cb(null, true)
            : cb(
                  new Error(
                      "Imagem de capa inválida (apenas JPEG, PNG ou WEBP)"
                  )
              );
    }

    cb(new Error("Campo de ficheiro inválido"));
};

// ─────────────────────────────────────────────
// Instância do Multer com configurações
// ─────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // Limite de 25MB por ficheiro
    },
});

// ─────────────────────────────────────────────
// Exporta o middleware para aceitar áudio e capa
// ─────────────────────────────────────────────
module.exports = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
]);
