/**
 * @file catchAsync.js
 * @description
 * Este utilitário é um wrapper (função que envolve outra) usado para tratar
 * erros em funções assíncronas de controladores Express.
 *
 * Em vez de escrever try/catch dentro de cada controlador, este wrapper
 * captura automaticamente os erros e envia-os para o middleware `errorHandler`.
 *
 * Vantagens:
 * - Código mais limpo
 * - Menos repetição
 * - Tratamento de erros sempre garantido
 *
 * Exemplo de uso:
 * router.get("/dados", catchAsync(async (req, res, next) => {
 *     const dados = await algoQuePodeFalhar();
 *     res.json(dados);
 * }));
 */

/**
 * Envolve uma função assíncrona (tipicamente um controlador Express)
 * e captura qualquer erro que ocorra durante a execução.
 *
 * Se houver erro (ex: base de dados indisponível), ele é passado para o next()
 * e tratado pelo middleware `errorHandler.js`.
 *
 * @param {Function} fn - Uma função assíncrona com (req, res, next)
 * @returns {Function} - Função Express com gestão automática de erros
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
        // .catch(next) equivale a: se der erro, passa-o para o middleware de erro
    };
};

module.exports = catchAsync;
