# MODELOS DE DADOS

Documentação dos principais modelos Mongoose utilizados no backend do projeto SoundDream (FaseFinal).

---

## User

```js
{
  username:     String,
  email:        { type: String, unique: true },
  passwordHash: String,
  role:         { type: String, enum: ['user','artist','admin'], default:'user' },
  library:      [{ type: mongoose.Schema.Types.ObjectId, ref:'Music' }],
  // playlists: relação 1‑N via modelo Playlist
  createdAt:    Date,
  updatedAt:    Date
}
```

- O campo `role` distingue entre utilizadores normais, artistas e administradores.
- O campo `library` armazena referências às músicas guardadas pelo utilizador.
- Timestamps automáticos (`createdAt`, `updatedAt`).

---

## Music

```js
{
  title:    String,
  artist:   { type: mongoose.Schema.Types.ObjectId, ref:'Artist', required:true },
  album:    { type: mongoose.Schema.Types.ObjectId, ref:'Album' },
  duration: Number,
  coverUrl: String,
  audioUrl: String,

  plays: { type:Number, default:0 },

  reactions:[{
    user: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    type: { type:String, enum:['fire','love'], required:true },
    createdAt:{ type:Date, default:Date.now }
  }],

  isDeleted:{ type:Boolean, default:false, select:false },
  deletedAt:{ type:Date,     select:false },
  createdAt: Date,
  updatedAt: Date
}
```

- O campo `reactions` armazena as reações dos utilizadores à música.
- O campo `plays` conta o número de reproduções.
- Soft-delete implementado com `isDeleted` e `deletedAt`.

---

## Album

```js
{
  title:      String,
  artist:     { type:mongoose.Schema.Types.ObjectId, ref:'Artist', required:true },
  coverUrl:   String,
  releaseDate:Date,
  musics:     [{ type:mongoose.Schema.Types.ObjectId, ref:'Music' }],
  isDeleted: { type: Boolean, default: false, select: false },
  deletedAt: { type: Date, select: false },
  createdAt: Date,
  updatedAt: Date
}
```

- Cada álbum pertence a um artista e pode ter várias músicas.
- Soft-delete implementado.

---

## Artist

```js
{
  name: String,
  bio: String,
  imageUrl: String,
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  createdAt: Date,
  updatedAt: Date
}
```

- O campo `albums` armazena referências aos álbuns do artista.

---

## Playlist

```js
{
  name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  musics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Music' }],
  isDeleted: { type: Boolean, default: false, select: false },
  deletedAt: { type: Date, select: false },
  createdAt: Date,
  updatedAt: Date
}
```

- Cada playlist pertence a um utilizador e contém referências a músicas.
- Soft-delete implementado.

---

## Indexação aplicada

| Modelo     | Índice                                                          |
| ---------- | --------------------------------------------------------------- |
| **User**   | `email` (unique)                                                |
| **Music**  | `title` / `artist` / `album` + composto `{ artist:1, title:1 }` |
| **Artist** | `name`                                                          |
| **Album**  | `{ title:1, artist:1 }`                                         |

> Índices apenas nos campos usados em filtros/pesquisa.  
> Usar `mongoose.syncIndexes()` para manter sincronizado.

---

## Boas práticas gerais

- Criar índices apenas nos campos usados em filtros e populates.
- Usar `.lean()` nas queries de leitura para melhor desempenho.
- Soft‑delete: queries fazem `{ isDeleted:false }` por padrão.
- Populates apenas quando necessário.
- Validar `ObjectId` nos parâmetros com Joi.
- Sanitizar campos de texto (ex: `bio`, `name`) para evitar XSS.

---

## Observações

- Todos os modelos usam `{ timestamps: true }` para `createdAt` e `updatedAt`.
- As relações entre documentos usam `ObjectId` e `ref`.
- As playlists armazenam apenas referências (não duplicam músicas).
- As músicas armazenam reações por utilizador e contador de `plays`.
- O campo `bio` de artista e o `name` da playlist são sanitizados.
- As entidades principais (Music, Artist, Album) estão normalizadas.
- Sincronização de índices é feita no `connectDB` com `Model.syncIndexes()` e controlada via `.env` (`SYNC_INDEXES=true`).

---