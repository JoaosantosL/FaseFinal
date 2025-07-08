/**
 * @file dialogueSteps.js
 * @description
 * Conjunto de perguntas dinâmicas usadas no Chatbot de criação de playlists.
 * Cada campo tem múltiplas variações para parecer uma conversa real e natural.
 */

const dialogueSteps = {
    genre: [
        "Vamos ao básico: que género musical te apetece ouvir?",
        "Tens algum estilo musical em mente? Pop, rock, jazz, eletrónica…",
        "Qual é o teu género preferido?",
        "Queres algo específico ou posso sugerir livremente?",
        "Estás com vontade de ouvir algum estilo em particular?",
    ],
    mood: [
        "E o teu estado de espírito? Algo animado ou mais calmo?",
        "Queres uma vibe energética ou algo mais tranquilo?",
        "Música para dançar, relaxar, treinar ou refletir?",
        "Como está o teu mood musical neste momento?",
        "Queres ouvir algo que te faça sonhar ou que te dê energia?",
    ],
    portuguese: [
        "Incluímos artistas portugueses nesta playlist?",
        "Preferes sons nacionais, internacionais ou um misto?",
        "Música feita em Portugal: sim ou não?",
        "Apoiamos os nossos talentos locais ou explorar o mundo?",
        "Queres incluir música portuguesa nesta playlist?",
    ],
    tempo: [
        "Ritmo rápido ou algo mais lento e suave?",
        "Preferes batidas aceleradas ou mais pausadas?",
        "Queres algo para pôr o corpo a mexer ou apenas balançar a cabeça?",
        "É dia de correr ou de ficar no sofá?",
        "Vamos com energia ou algo mais relaxado?",
    ],
    decade: [
        "Há alguma época musical que te inspire? Anos 80, 90, 2000s?",
        "Preferes nostalgia ou algo mais recente?",
        "Queres reviver clássicos ou descobrir sons novos?",
        "Playlist com toque vintage ou moderna e atual?",
        "Vamos ao baú ou ficamos nos lançamentos recentes?",
    ],
    context: [
        "Esta playlist vai servir para quê? Estudo, treino, viagem, descanso…?",
        "Conta-me onde vais ouvir esta música: no carro, a caminhar, a trabalhar, numa passadeira?",
        "Precisas de foco, movimento ou simplesmente companhia sonora?",
        "Qual é o cenário? Festa, sofá, paisagem pela janela, estudar…?",
        "Estás num momento de concentração, diversão ou introspeção?",
    ],
    known: [
        "Preferes ouvir músicas que já conheces ou descobrir novas surpresas?",
        "Clássicos conhecidos ou explorar novidades?",
        "Incluímos músicas familiares ou arriscamos com sons diferentes?",
        "Estás com vontade de ouvir hits que já adoras ou explorar novos talentos?",
        "Queres uma playlist de conforto ou de descoberta?",
    ],
};

export default dialogueSteps;
