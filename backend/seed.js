/**
 * @file seed.js
 * @description
 * Seed completo: limpa tudo (artistas, álbuns, músicas, utilizadores, playlists)
 * e insere dados musicais + utilizadores definidos em ficheiro JSON externo.
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const bcrypt = require("bcrypt");

const Artist = require("./src/models/Artist");
const Album = require("./src/models/Album");
const Music = require("./src/models/Music");
const User = require("./src/models/User");
const Playlist = require("./src/models/Playlist");

// ─────────────────────────────────────────────
// Lê dados dos ficheiros JSON
// ─────────────────────────────────────────────

const artistsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/artists.json"))
);
const albumsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/albums.json"))
);
const musicsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/musics.json"))
);
const usersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/users.json"))
);

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("Ligado à base de dados MongoDB");

        // ─────────────── Limpeza ───────────────
        await Promise.all([
            Artist.deleteMany(),
            Album.deleteMany(),
            Music.deleteMany(),
            User.deleteMany(),
            Playlist.deleteMany(),
        ]);
        console.log(
            "Coleções limpas: artistas, álbuns, músicas, utilizadores, playlists"
        );

        // ───────────── Inserir Artistas ─────────────
        const insertedArtists = await Artist.insertMany(artistsData);
        const artistMap = {};
        insertedArtists.forEach((artist) => {
            artistMap[artist.name] = artist._id;
        });
        console.log(`${insertedArtists.length} artistas inseridos`);

        // ───────────── Inserir Álbuns ─────────────
        const enrichedAlbums = albumsData.map((album) => {
            const artistId =
                artistMap[album.artistName] || artistMap[album.artist];
            if (!artistId)
                throw new Error(
                    "Artista não encontrado para álbum: " + album.title
                );
            return { ...album, artist: artistId, musics: [] };
        });

        const insertedAlbums = await Album.insertMany(enrichedAlbums);
        const albumMap = {};
        insertedAlbums.forEach((album) => {
            albumMap[album.title] = album._id;
        });
        console.log(`${insertedAlbums.length} álbuns inseridos`);

        // ───────────── Inserir Músicas ─────────────
        const enrichedMusics = musicsData.map((music) => {
            const artistId =
                artistMap[music.artistName] || artistMap[music.artist];
            const albumId = albumMap[music.albumTitle] || albumMap[music.album];
            if (!artistId || !albumId)
                throw new Error(
                    "Artista ou álbum não encontrado para música: " +
                        music.title
                );
            return {
                ...music,
                artist: artistId,
                album: albumId,
            };
        });

        const insertedMusics = await Music.insertMany(enrichedMusics);
        console.log(`${insertedMusics.length} músicas inseridas`);

        // ───────────── Atualizar Álbuns ─────────────
        for (const music of insertedMusics) {
            await Album.findByIdAndUpdate(music.album, {
                $push: { musics: music._id },
            });
        }

        // ───────────── Atualizar Artistas ─────────────
        for (const album of insertedAlbums) {
            await Artist.findByIdAndUpdate(album.artist, {
                $push: { albums: album._id },
            });
        }

        // ───────────── Inserir Utilizadores ─────────────
        const usersRaw = JSON.parse(
            fs.readFileSync(path.join(__dirname, "/src/data/users.json"))
        );

        const salt = await bcrypt.genSalt(10);
        const usersHashed = await Promise.all(
            usersRaw.map(async (u) => ({
                username: u.username,
                email: u.email,
                passwordHash: await bcrypt.hash(u.password, salt),
                role: "base",
                library: [],
                personalPlays: [],
            }))
        );

        await User.insertMany(usersHashed);
        console.log(
            `${usersHashed.length} utilizadores inseridos (senha: 123456)`
        );

        console.log("Seed concluído com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("Erro ao fazer seed:", err);
        process.exit(1);
    }
}

seedDatabase();
