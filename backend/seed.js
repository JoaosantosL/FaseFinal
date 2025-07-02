/**
 * @file seed.js
 * @description
 * Seed progressivo: insere artistas → álbuns → músicas.
 * Usa IDs gerados automaticamente pelo MongoDB e associações por nome/título.
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Artist = require("./src/models/Artist");
const Album = require("./src/models/Album");
const Music = require("./src/models/Music");

const artistsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/artists.json"))
);
const albumsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/albums.json"))
);
const musicsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "/src/data/musics.json"))
);

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("Ligado à base de dados MongoDB");

        await Promise.all([
            Artist.deleteMany(),
            Album.deleteMany(),
            Music.deleteMany(),
        ]);
        console.log("Coleções limpas");

        // 1️⃣ Inserir artistas
        const insertedArtists = await Artist.insertMany(artistsData);
        const artistMap = {};
        insertedArtists.forEach((artist) => {
            artistMap[artist.name] = artist._id;
        });
        console.log(`${insertedArtists.length} artistas inseridos`);

        // 2️⃣ Inserir álbuns
        const enrichedAlbums = albumsData.map((album) => {
            const artistId =
                artistMap[album.artistName] || artistMap[album.artist];
            if (!artistId)
                throw new Error(
                    "Artista não encontrado para o álbum: " + album.title
                );
            return {
                ...album,
                artist: artistId,
                musics: [],
            };
        });

        const insertedAlbums = await Album.insertMany(enrichedAlbums);
        const albumMap = {};
        insertedAlbums.forEach((album) => {
            albumMap[album.title] = album._id;
        });
        console.log(`${insertedAlbums.length} álbuns inseridos`);

        // 3️⃣ Inserir músicas
        const enrichedMusics = musicsData.map((music) => {
            const artistId =
                artistMap[music.artistName] || artistMap[music.artist];
            const albumId = albumMap[music.albumTitle] || albumMap[music.album];
            if (!artistId || !albumId) {
                throw new Error(
                    "Artista ou álbum não encontrado para a música: " +
                        music.title
                );
            }
            return {
                ...music,
                artist: artistId,
                album: albumId,
            };
        });

        const insertedMusics = await Music.insertMany(enrichedMusics);
        console.log(`${insertedMusics.length} músicas inseridas`);

        // 4️⃣ Atualizar álbuns com IDs das músicas
        for (const music of insertedMusics) {
            await Album.findByIdAndUpdate(music.album, {
                $push: { musics: music._id },
            });
        }

        // 5️⃣ Atualizar artistas com IDs dos álbuns
        for (const album of insertedAlbums) {
            await Artist.findByIdAndUpdate(album.artist, {
                $push: { albums: album._id },
            });
        }

        console.log("Seed concluído com sucesso!");
        process.exit(0);
    } catch (err) {
        console.error("Erro ao fazer seed:", err);
        process.exit(1);
    }
}

seedDatabase();
