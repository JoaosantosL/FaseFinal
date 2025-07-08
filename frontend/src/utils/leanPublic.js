/**
 * @file leanPublic.js
 * @description
 * Helper que remove campos indesejados de documentos retornados por `.lean()`.
 *
 * O método `.lean()` converte os documentos Mongoose em objetos simples (POJOs),
 * e este helper permite limpar esses objetos de campos como `__v`, `passwordHash`, `deletedAt`, etc.
 *
 * Pode ser usado diretamente com `.then()` após uma query `.lean()`.
 *
 * Exemplo:
 *   const musicas = await Music.find().lean().then(leanPublic(['__v', 'reactions']))
 */

/**
 * Gera uma função que remove as chaves especificadas do resultado `.lean()`.
 * Pode ser aplicada a um único documento ou a um array de documentos.
 *
 * @param {string[]} [hidden=['__v']] - Lista de campos a ocultar nos objetos resultantes
 * @returns {(doc: any) => any} - Função que limpa os campos indesejados
 */
function leanPublic(hidden = ["__v"]) {
    /**
     * Função auxiliar que remove as chaves especificadas de um objeto.
     *
     * @param {Object} obj - Documento `.lean()` a limpar
     * @returns {Object} - Objeto sem os campos indesejados
     */
    const omit = (obj) =>
        Object.fromEntries(
            Object.entries(obj).filter(([key]) => !hidden.includes(key))
        );

    /**
     * Função final que trata documentos únicos ou arrays.
     * - Se for `null`, devolve `null`.
     * - Se for `Array`, aplica `omit()` a cada item.
     * - Caso contrário, aplica `omit()` ao objeto único.
     */
    return (doc) => {
        if (!doc) return doc; // Ex: null ou undefined
        if (Array.isArray(doc)) return doc.map(omit);
        return omit(doc);
    };
}

module.exports = leanPublic;
