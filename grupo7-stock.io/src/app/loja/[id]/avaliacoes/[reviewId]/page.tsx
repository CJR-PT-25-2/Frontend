"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, Star, Send, Edit2, X, Check, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/components/navbar";

interface Usuario {
  id: number;
  name: string | null;
  foto_perfil_URL: string | null;
}

interface Comentario {
  id: number;
  conteudo: string;
  usuario_id: number;
  Usuario: Usuario;
}

interface Loja {
  id: number;
  donoId: number;
}

interface AvaliacaoLoja {
  id: number;
  nota: number;
  comentario: string;
  usuario_id: number;
  Usuario: Usuario;
  loja: Loja;
  Comentarios: Comentario[];
}

export default function ReviewDetailPage() {
  const { reviewId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<AvaliacaoLoja | null>(null);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Estados de Edição da Review Principal
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editReviewText, setEditReviewText] = useState("");
  const [editRating, setEditRating] = useState(0);

  // Estados de Edição de Comentários
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const API_URL = "http://localhost:3001";
  const getToken = () => localStorage.getItem("token");

  const fetchReview = async () => {
    if (!reviewId) return;
    try {
      const res = await fetch(`${API_URL}/avaliacao-loja/${reviewId}`);
      if (!res.ok) throw new Error("Erro ao buscar");
      const data = await res.json();
      setReview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const getAvatarUrl = (usuario: Usuario | undefined | null) => {
    if (usuario?.foto_perfil_URL) return usuario.foto_perfil_URL;
    const name = usuario?.name || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=333&color=fff&size=150&font-size=0.5`;
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !user || !review) return;
    const token = getToken();
    if (!token) return alert("Login necessário");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conteudo: newComment,
          avaliacao_loja_id: Number(review.id),
          avaliacao_produto_id: null,
          usuario_id: Number(user.id),
        }),
      });

      if (res.ok) {
        setNewComment("");
        fetchReview();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erro API:", errorData);
        alert(`Erro: ${errorData.message || "Falha ao enviar."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditingReview = () => {
    if (review) {
      setEditReviewText(review.comentario);
      setEditRating(review.nota);
      setIsEditingReview(true);
    }
  };

  const saveReviewEdit = async () => {
    if (!review || !user) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/avaliacao-loja/${review.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comentario: editReviewText,
          nota: editRating,
        }),
      });
      if (res.ok) {
        setIsEditingReview(false);
        fetchReview();
      } else {
        alert("Erro ao editar avaliação.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;
    if (!window.confirm("Excluir sua avaliação permanentemente?")) return;

    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/avaliacao-loja/${review.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.back();
      } else {
        alert("Erro ao excluir avaliação.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveCommentEdit = async (commentId: number) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/comentarios/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conteudo: editCommentText }),
      });
      if (res.ok) {
        setEditingCommentId(null);
        fetchReview();
      } else {
        alert("Erro ao editar comentário.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Excluir este comentário?")) return;

    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/comentarios/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchReview();
      } else {
        alert("Erro ao excluir comentário.");
      }
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </div>
    );
  if (!review)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Avaliação não encontrada.
      </div>
    );

  const isReviewOwner = user && Number(user.id) === Number(review.usuario_id);
  const hasComments = review.Comentarios && review.Comentarios.length > 0;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F3F0E9]">
      <Navbar />

      {/* --- SEÇÃO PRETA (AVALIAÇÃO) --- */}
      <section className="bg-black text-white px-6 md:px-20 py-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-6">
            {/* Header: Avatar + Nome + Estrelas */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => router.back()}
                  className="hover:opacity-70 transition text-white"
                >
                  <ChevronLeft size={28} strokeWidth={2} />
                </button>

                <div className="flex items-center gap-4">
                  <img
                    src={getAvatarUrl(review.Usuario)}
                    alt={review.Usuario?.name || "Usuário"}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-gray-800 object-cover bg-[#333]"
                  />
                  <h1 className="text-xl md:text-2xl font-normal text-white tracking-wide capitalize">
                    {review.Usuario?.name || "Usuário"}
                  </h1>
                </div>
              </div>

              {/* Estrelas Interativas e Botões da Review */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-1 text-[#FCD34D]">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const currentRating = isEditingReview
                      ? editRating
                      : review.nota;
                    return (
                      <Star
                        key={s}
                        size={20}
                        fill={s <= currentRating ? "currentColor" : "none"}
                        strokeWidth={0}
                        className={
                          isEditingReview
                            ? "cursor-pointer hover:scale-110 transition-transform"
                            : ""
                        }
                        onClick={() => {
                          if (isEditingReview) setEditRating(s);
                        }}
                      />
                    );
                  })}
                </div>

                {/* Botões de Ação da Review (Editar e Excluir) */}
                {isReviewOwner && !isEditingReview && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={startEditingReview}
                      className="text-gray-500 hover:text-white transition"
                      title="Editar avaliação"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="text-gray-500 hover:text-red-500 transition"
                      title="Excluir avaliação"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Texto da Review */}
            <div className="pl-12 md:pl-[84px] max-w-3xl">
              {isEditingReview ? (
                <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                  <textarea
                    value={editReviewText}
                    onChange={(e) => setEditReviewText(e.target.value)}
                    className="w-full bg-[#111] text-gray-200 p-4 rounded text-lg border border-gray-800 focus:border-gray-500 outline-none resize-none h-32 leading-relaxed"
                  />
                  <div className="flex gap-3 justify-end items-center">
                    <span className="text-xs text-gray-500 mr-auto hidden md:block">
                      *Clique nas estrelas acima para alterar a nota
                    </span>
                    <button
                      onClick={() => setIsEditingReview(false)}
                      className="flex items-center gap-2 px-4 py-1.5 bg-transparent border border-gray-700 rounded-full text-sm text-gray-400 hover:text-white transition"
                    >
                      <X size={14} /> Cancelar
                    </button>
                    <button
                      onClick={saveReviewEdit}
                      className="flex items-center gap-2 px-6 py-1.5 bg-white text-black rounded-full text-sm hover:bg-gray-200 transition font-medium"
                    >
                      <Check size={14} /> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xl md:text-[22px] font-light leading-[1.6] text-gray-200 antialiased">
                  {review.comentario}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO BEGE (COMENTÁRIOS) --- */}
      <section className="flex-1 px-6 md:px-20 -mt-2">
        <div className="max-w-4xl mx-auto pt-12 pb-24">
          <div className="pl-12 md:pl-[84px]">
            {hasComments ? (
              <div className="border-l border-gray-400/40 pl-8 space-y-9">
                {review.Comentarios?.map((resp) => {
                  const isRespOwner =
                    user && Number(user.id) === Number(resp.usuario_id);
                  const isStoreOwner =
                    Number(resp.usuario_id) === Number(review.loja.donoId);
                  const isEditingThis = editingCommentId === resp.id;

                  return (
                    <div key={resp.id} className="flex gap-4 items-start group">
                      <img
                        src={getAvatarUrl(resp.Usuario)}
                        className="w-12 h-12 rounded-full object-cover shadow-sm bg-gray-200"
                        alt={resp.Usuario?.name || "Usuário"}
                      />

                      <div className="flex-1 pt-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-semibold text-base text-gray-900 capitalize flex items-center gap-2">
                              {resp.Usuario?.name}
                              {isStoreOwner && (
                                <span className="text-[10px] text-purple-600 border border-purple-200 bg-purple-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                  Dona
                                </span>
                              )}
                            </h3>
                          </div>

                          {/* Botões de Ação do Comentário */}
                          {isRespOwner && !isEditingThis && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  setEditingCommentId(resp.id);
                                  setEditCommentText(resp.conteudo);
                                }}
                                className="text-gray-400 hover:text-gray-800"
                                title="Editar comentário"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(resp.id)}
                                className="text-gray-400 hover:text-red-500"
                                title="Excluir comentário"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditingThis ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className="w-full bg-white border border-gray-300 rounded p-2 text-gray-800 focus:outline-none focus:border-black text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveCommentEdit(resp.id)}
                                className="text-xs bg-black text-white px-3 py-1 rounded"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="text-xs text-gray-500 px-2 py-1"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[#333] font-light text-[15px] leading-relaxed">
                            {resp.conteudo}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-l-2 border-gray-300 pl-6 py-2">
                <p className="text-gray-400 italic text-sm">
                  Nenhum comentário ainda.
                </p>
              </div>
            )}

            {user && (
              <div className="mt-12 relative max-w-2xl">
                <div className="bg-white rounded-full shadow-sm flex items-center p-1.5 border border-transparent focus-within:border-gray-300 transition-colors">
                  <div className="w-4"></div>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-2 h-10 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  />
                  <button
                    disabled={!newComment.trim() || submitting}
                    onClick={handleSendComment}
                    className="p-2.5 text-gray-300 hover:text-[#4B5563] transition disabled:opacity-30"
                  >
                    <Send size={18} className="transform rotate-45 mr-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
