"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/components/navbar";

export default function AdicionarComentarioPage() {
  const { id } = useParams(); // ID da loja
  const router = useRouter();
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL = "http://localhost:3001";

  // Função para pegar o token do localStorage
  const getToken = () => localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Por favor, selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    if (!comment.trim()) {
      alert("Por favor, escreva um comentário.");
      return;
    }

    const token = getToken();
    if (!token || !user) {
      alert("Você precisa estar logado para avaliar.");
      router.push("/login");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        produto_id: Number(id),
        nota: rating,
        comentario: comment,
      };

      const res = await fetch(`${API_URL}/avaliacao-produto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/produto/${id}`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Erro ao enviar avaliação.");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Fundo Bege
    <div className="min-h-screen flex flex-col font-sans bg-[#F6F3E4] text-black">
      <Navbar />

      <div className="flex-1 flex flex-col items-center px-6 py-10 md:py-20 font-League Spartan">
        <div className="w-full max-w-2xl">
          {/* Header com Botão Voltar (Agora Preto) */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-black hover:opacity-70 transition mb-6 group font-semibold"
          >
            <ChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para a página do Produto
          </button>

          {/* Card Branco Arredondado */}
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <h1 className="text-3xl font-bold mb-2 text-center text-black">
              Avaliar Produto
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Conte para nós o que achou da sua experiência.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Seleção de Estrelas */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                  Sua Nota
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={45}
                        // Lógica de Preenchimento: Amarelo se ativo
                        fill={
                          star <= (hoverRating || rating)
                            ? "#FACC15"
                            : "transparent"
                        }
                        // Cor da Borda: Amarelo se ativo, PRETO se inativo
                        color={
                          star <= (hoverRating || rating)
                            ? "#FACC15"
                            : "#000000"
                        }
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                {/* Feedback da nota em Preto */}
                <span className="h-6 text-lg text-black font-bold">
                  {hoverRating > 0
                    ? ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"][
                        hoverRating - 1
                      ]
                    : rating > 0
                    ? ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"][
                        rating - 1
                      ]
                    : ""}
                </span>
              </div>

              {/* Campo de Comentário */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide block ml-1">
                  Seu Comentário
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escreva aqui os detalhes da sua avaliação..."
                  className="w-full h-40 bg-[#F6F3E4] text-black border border-gray-200 rounded-2xl p-4 text-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none placeholder-gray-500"
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-400 mr-1">
                  {comment.length}/500 caracteres
                </div>
              </div>

              {/* Botão de Enviar (Agora Preto) */}
              <button
                type="submit"
                disabled={submitting || rating === 0 || !comment.trim()}
                className="w-full bg-black hover:opacity-80 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Enviando...
                  </>
                ) : (
                  "Publicar Avaliação"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
