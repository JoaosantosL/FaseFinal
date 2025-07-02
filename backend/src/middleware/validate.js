/**
 * @file validate.js
 * @description
 * Middleware genérico de validação de dados usando a biblioteca Joi.
 *
 * Este middleware é reutilizável e permite validar:
 * - O corpo da requisição (`req.body`)
 * - Os parâmetros da rota (`req.params`)
 * - Os parâmetros da query string (`req.query`)
 * - Ou todos os três em simultâneo (por omissão)
 *
 * A validação com Joi garante que os dados recebidos pelo servidor
 * estão no formato esperado antes de serem utilizados.
 *
 * Exemplo de uso em rotas:
 *   router.post("/", validate(schema), controller);
 *   router.get("/:id", validate(idSchema, "params"), controller);
 */

const validate = (schema, location) => (req, res, next) => {
    /**
     * 1. Seleciona os dados a validar conforme o local especificado:
     *    - Se for "body", valida apenas `req.body`
     *    - Se for "params", valida `req.params`
     *    - Se for "query", valida `req.query`
     *    - Se não for especificado, valida os três ao mesmo tempo
     */
    const data = location
        ? req[location]
        : {
              body: req.body,
              params: req.params,
              query: req.query,
          };

    /**
     * 2. Opções para a validação:
     *    - `abortEarly: false` → mostra todos os erros (em vez de só o primeiro)
     *    - `allowUnknown: true` → permite que existam campos não definidos no schema (útil em queries)
     */
    const joiOptions = {
        abortEarly: false,
        allowUnknown: true,
    };

    /**
     * 3. Executa a validação com o schema fornecido
     */
    const { error } = schema.validate(data, joiOptions);

    /**
     * 4. Se houver erros de validação, devolve resposta 400 com lista de mensagens
     */
    if (error) {
        const mensagens = error.details.map((e) => e.message).join("; ");
        return res.status(400).json({
            success: false,
            error: mensagens,
            code: 400,
        });
    }

    /**
     * 5. Caso não haja erros, avança para o próximo middleware ou controlador
     */
    next();
};

module.exports = validate;
