/**
 * @file AuthContext.js
 * @description
 * Contexto global de autenticação da aplicação SoundDream.
 * Permite guardar o utilizador autenticado e partilhar esta informação
 * entre todos os componentes. Também verifica se há sessão ativa ao carregar.
 *
 * @module AuthContext
 */

import { createContext, useState, useEffect } from "react";
import api from "../services/axios";

// Cria o contexto que irá conter os dados de autenticação
export const AuthContext = createContext();

/**
 * @component AuthProvider
 * @description
 * Envolve a aplicação inteira e fornece:
 * - Dados do utilizador autenticado (user)
 * - Função para atualizar esse utilizador (setUser)
 * - Informação se a verificação de sessão ainda está a decorrer (isLoading)
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Os componentes filhos da aplicação
 * @returns {JSX.Element} Contexto de autenticação com o estado atual do utilizador
 */
export function AuthProvider({ children }) {
    // Estado local com o utilizador autenticado (ou null)
    const [user, setUser] = useState(null);

    // Estado que indica se estamos a verificar a sessão
    const [isLoading, setIsLoading] = useState(true);

    // Quando o componente monta, tenta verificar se já existe uma sessão ativa
    useEffect(() => {
        api.get("/auth/me")
            .then((res) => {
                // Se a sessão estiver válida, guarda o utilizador
                setUser(res.data.data);
            })
            .catch(() => {
                // Se não estiver autenticado, define como null
                setUser(null);
            })
            .finally(() => {
                // Em qualquer dos casos, marca que o carregamento terminou
                setIsLoading(false);
            });
    }, []);

    // Fornece o contexto com os dados e função de atualização
    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
