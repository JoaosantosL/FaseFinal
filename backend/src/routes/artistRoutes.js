/**
 * @file artistRoutes.js
 * @description
 * Define as rotas públicas e privadas relacionadas com Artistas e Álbuns na aplicação SoundDream.
 *
 * Inclui:
 * - Leitura pública de artistas e álbuns
 * - Edição de perfil artístico (privado)
 * - Acesso ao próprio perfil artístico (`/artists/me`)
 */

const express = require("express");
const router = express.Router();

// ─────────────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────────────

const validate = require("../middleware/validate");
const { idSchema } = require("../validators/id");
const verifyToken = require("../middleware/verifyToken");
const authorizeRole = require("../middleware/authorizeRole");
const checkArtistOwnership = require("../middleware/checkArtistOwnership");
const uploadArtistImage = require("../middleware/uploadArtistImage");
const uploadAlbumCover = require("../middleware/uploadAlbumCover");
const uploadMusicFiles = require("../middleware/uploadMusicFiles");

const { updateArtistSchema } = require("../validators/artist");
const { createAlbumSchema } = require("../validators/album");

const { createMusicSchema } = require("../validators/music");
const { createMusic } = require("../controllers/musicController");

// ─────────────────────────────────────────────────────
// Controladores
// ─────────────────────────────────────────────────────

const {
    getAllArtists,
    getArtistById,
    getAlbumById,
    updateArtist,
    getOwnArtistProfile,
    updateArtistImage,
} = require("../controllers/artistController");

const { createAlbum } = require("../controllers/albumController");

// ─────────────────────────────────────────────────────
// Rota: GET /api/artists
// Descrição: Lista todos os artistas públicos
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/artists
 * @desc Devolve lista de todos os artistas públicos
 * @access Público
 */
router.get("/artists", getAllArtists);

// ─────────────────────────────────────────────────────
// Rota: GET /api/artists/me
// Descrição: Devolve o perfil artístico do artista autenticado
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/artists/me
 * @desc Devolve o perfil artístico associado ao utilizador autenticado
 * @access Privado (role "artist")
 */
router.get(
    "/artists/me",
    verifyToken,
    authorizeRole("premium"),
    getOwnArtistProfile
);

// ─────────────────────────────────────────────────────
// Rota: GET /api/artists/:id
// Descrição: Detalhes de um artista (se for público ou dono)
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/artists/:id
 * @desc Devolve detalhes de um artista específico (e seus álbuns)
 * @access Público (restrito se o artista for privado)
 */
router.get("/artists/:id", validate(idSchema, "params"), getArtistById);

// ─────────────────────────────────────────────────────
// Rota: GET /api/albums/:id
// Descrição: Detalhes de um álbum (e músicas associadas)
// ─────────────────────────────────────────────────────

/**
 * @route GET /api/albums/:id
 * @desc Devolve um álbum e a lista de músicas que o compõem
 * @access Público
 */
router.get("/albums/:id", validate(idSchema, "params"), getAlbumById);

// ─────────────────────────────────────────────────────
// Rota: PATCH /api/artists/:id
// Descrição: Atualiza campos do perfil artístico
// ─────────────────────────────────────────────────────

/**
 * @route PATCH /api/artists/:id
 * @desc Atualiza o perfil artístico (bio, percurso, influências, factos)
 * @access Privado (apenas artistas com ownership)
 */
router.patch(
    "/artists/:id",
    verifyToken,
    authorizeRole("premium"),
    validate(idSchema, "params"),
    validate(updateArtistSchema, "body"),
    checkArtistOwnership,
    updateArtist
);

/**
 * @route PATCH /api/artists/:id/image
 * @desc Atualiza a imagem de perfil do artista
 * @access Privado (apenas artistas com ownership)
 */
router.patch(
    "/artists/:id/image",
    verifyToken,
    authorizeRole("premium"),
    validate(idSchema, "params"),
    checkArtistOwnership,
    uploadArtistImage,
    updateArtistImage
);

// ─────────────────────────────────────────────────────
// Rota: POST /api/artists/:id/albums
// Descrição: Cria um novo álbum associado ao artista autenticado
// ─────────────────────────────────────────────────────

router.post(
    "/artists/:id/albums",
    verifyToken,
    authorizeRole("premium"),
    validate(idSchema, "params"),
    validate(createAlbumSchema, "body"),
    checkArtistOwnership,
    uploadAlbumCover,
    createAlbum
);

/**
 * @route POST /api/artists/:id/musics
 * @desc Cria uma nova música (áudio, cover, título, duração, álbum opcional)
 * @access Privado (apenas artistas com ownership)
 */
router.post(
    "/artists/:id/musics",
    verifyToken,
    authorizeRole("premium"),
    validate(createMusicSchema, "body"),
    checkArtistOwnership,
    uploadMusicFiles,
    createMusic
);

module.exports = router;
