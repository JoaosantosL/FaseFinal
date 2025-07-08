/**
 * @file ArtistProfileForm.jsx
 * @description
 * Formulário de edição do perfil artístico do artista autenticado.
 * Permite editar: bio, percurso, influências, factos, visibilidade (isPublic) e imagem de perfil.
 * Usa PATCH /api/artists/:id e PATCH /api/artists/:id/image
 */

import React, { useEffect, useState } from "react";
import api from "../services/axios";
import getCsrfToken from "../utils/getCsrfToken";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

/**
 * Componente que permite ao artista editar o seu perfil artístico completo.
 */
export default function ArtistProfileForm() {
    const [formData, setFormData] = useState({
        bio: "",
        percurso: "",
        influences: [""],
        facts: [""],
        isPublic: false,
        extraInfo: "",
    });

    const [artistId, setArtistId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        async function fetchArtist() {
            try {
                const res = await api.get("/artists/me");
                const { _id, bio, percurso, influences, facts, isPublic, imageUrl, extraInfo } = res.data.data;
                setArtistId(_id);
                setFormData({
                    bio: bio || "",
                    percurso: percurso || "",
                    influences: Array.isArray(influences) && influences.length ? influences : [""],
                    facts: facts?.length ? facts : [""],
                    isPublic: isPublic || false,
                    extraInfo: extraInfo || "",
                });
                if (imageUrl) {
                    const base = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
                    setPreviewUrl(
                        imageUrl.startsWith("/public")
                            ? `${base}${imageUrl}`
                            : `${base}/public/uploads/covers/artists/${imageUrl}`
                    );
                }
            } catch (err) {
                toast.error("Erro ao carregar dados do artista");
            } finally {
                setLoading(false);
            }
        }
        fetchArtist();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === "checkbox" ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleFactChange = (index, value) => {
        const newFacts = [...formData.facts];
        newFacts[index] = value;
        setFormData((prev) => ({ ...prev, facts: newFacts }));
    };

    const addFact = () => {
        setFormData((prev) => ({ ...prev, facts: [...prev.facts, ""] }));
    };

    const removeFact = (index) => {
        const newFacts = [...formData.facts];
        newFacts.splice(index, 1);
        setFormData((prev) => ({ ...prev, facts: newFacts }));
    };

    const handleInfluenceChange = (index, value) => {
        const newInfluences = [...formData.influences];
        newInfluences[index] = value;
        setFormData((prev) => ({ ...prev, influences: newInfluences }));
    };

    const addInfluence = () => {
        setFormData((prev) => ({ ...prev, influences: [...prev.influences, ""] }));
    };

    const removeInfluence = (index) => {
        const newInfluences = [...formData.influences];
        newInfluences.splice(index, 1);
        setFormData((prev) => ({ ...prev, influences: newInfluences }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.bio.trim()) {
            toast.error("Por favor preenche a biografia.");
            return;
        }

        if (!formData.percurso.trim()) {
            toast.error("Por favor preenche o percurso artístico.");
            return;
        }

        if (formData.influences.every((i) => !i.trim())) {
            toast.error("Adiciona pelo menos uma influência musical.");
            return;
        }
        try {
            const token = await getCsrfToken();
            await api.patch(`/artists/${artistId}`, formData, {
                headers: { "X-CSRF-Token": token },
            });
            toast.success("Perfil artístico atualizado com sucesso");
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Erro ao guardar alterações";
            toast.error(msg);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append("image", selectedFile);
        try {
            const token = await getCsrfToken();
            await api.patch(`/artists/${artistId}/image`, formData, {
                headers: {
                    "X-CSRF-Token": token,
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Imagem de perfil atualizada com sucesso");
        } catch (err) {
            toast.error("Erro ao atualizar imagem de perfil");
        }
    };

    if (loading) return <p>A carregar...</p>;

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="d-flex align-items-center justify-content-end gap-2 mb-3">
                <span className="fw-bold">Privado</span>
                <div className="form-check form-switch m-0">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="isPublic"
                        name="isPublic"
                        checked={formData.isPublic}
                        onChange={handleChange}
                    />
                </div>
                <span className="fw-bold">Público</span>
            </div>

            <div className="mb-3">
                <label className="form-label">Biografia</label>
                <textarea
                    className="form-control"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Percurso Artístico</label>
                <textarea
                    className="form-control"
                    name="percurso"
                    rows="3"
                    value={formData.percurso}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Influências Musicais</label>
                {formData.influences.map((influence, i) => (
                    <div key={i} className="d-flex align-items-center mb-2 gap-2">
                        <input
                            type="text"
                            className="form-control"
                            value={influence}
                            onChange={(e) => handleInfluenceChange(i, e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn-circle"
                            onClick={() => removeInfluence(i)}
                            disabled={formData.influences.length === 1}
                        >
                            <FaTrash />
                        </button>
                        <button
                            type="button"
                            className="btn-circle"
                            onClick={addInfluence}
                        >
                            <FaPlus />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mb-3">
                <label className="form-label">Factos / Curiosidades</label>
                {formData.facts.map((fact, i) => (
                    <div key={i} className="d-flex align-items-center mb-2 gap-2">
                        <input
                            type="text"
                            className="form-control"
                            value={fact}
                            onChange={(e) => handleFactChange(i, e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn-circle"
                            onClick={() => removeFact(i)}
                            disabled={formData.facts.length === 1}
                        >
                            <FaTrash />
                        </button>
                        <button
                            type="button"
                            className="btn-circle"
                            onClick={addFact}
                        >
                            <FaPlus />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mb-3">
                <label className="form-label">Imagem de Perfil (400x400)</label>
                <div className="d-flex align-items-center gap-3">
                    <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
                    <button
                        type="button"
                        className="btn btn-circle"
                        onClick={handleImageUpload}
                        disabled={!selectedFile}
                        title="Guardar imagem"
                    >
                        <FaSave />
                    </button>
                </div>
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Pré-visualização"
                        className="mt-3"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    />
                )}
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Informação adicional para o Chatbot (não visível publicamente)
                </label>
                <textarea
                    className="form-control"
                    name="extraInfo"
                    rows="4"
                    value={formData.extraInfo}
                    onChange={handleChange}
                />
                <small className="form-text muted">
                    Este campo é opcional. Serve para adicionar informações que o perfil público não inclui,
                    mas que podem ser úteis para o chatbot responder a perguntas.
                </small>
            </div>

            <button type="submit" className="btn btn-primary">
                Guardar Alterações
            </button>
        </form>
    );
}