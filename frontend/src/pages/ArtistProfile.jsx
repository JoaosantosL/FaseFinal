import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ArtistProfileForm from "../components/ArtistProfileForm";
import ArtistAlbumManager from "../components/ArtistAlbumManager";

/**
 * Componente principal da página de artista.
 * Mostra o formulário e a zona de gestão de álbuns/músicas.
 */
export default function ArtistProfile() {
    const { user } = useContext(AuthContext);

    // Redireciona se o utilizador não for artista
    if (!user || user.role !== "artist") {
        return <Navigate to="/" />;
    }

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-center text-md-start">Perfil Artístico</h2>

            <div className="row g-5">
                {/* Coluna esquerda: Formulário de edição */}
                <div className="col-md-6">
                    <h4 className="mb-3">Editar informações públicas</h4>
                    {user.linkedArtist && <ArtistProfileForm />}
                </div>

                {/* Coluna direita: Gestão de álbuns e músicas */}
                <div className="col-md-6">
                    <h4 className="mb-3">Os teus álbuns e músicas</h4>

                    <ArtistAlbumManager />

                </div>
            </div>
        </div>
    );
}