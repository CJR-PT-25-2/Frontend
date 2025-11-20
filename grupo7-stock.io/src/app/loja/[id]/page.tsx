"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/components/navbar";

interface Loja {
  id: number;
  nome: string;
  descricao: string;
  perfil_url: string | null;
  banner_url: string | null;
  produtos: any[];
  avaliacoes: { nota: number; comentario: string; usuario?: { name?: string } }[];
  donoId: number;
}

export default function LojaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [loja, setLoja] = useState<Loja | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3001/loja/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Loja carregada:", data);
        setLoja(data);
      })
      .catch((err) => console.error("Erro carregando loja:", err));
  }, [id]);

  if (!loja) return <p className="text-white text-center mt-10">Carregando...</p>;

  const isOwner = user && Number(user.id) === loja.donoId;

  // média das avaliações
  const media =
    loja.avaliacoes.length > 0
      ? (
          loja.avaliacoes.reduce((acc, a) => acc + a.nota, 0) /
          loja.avaliacoes.length
        ).toFixed(2)
      : "0";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-black text-white pb-20">
        {/* BANNER */}
        <div className="w-full h-60 relative">
          <img
            src={
              loja.banner_url
                ? `http://localhost:3001${loja.banner_url}`
                : "/placeholder-banner.jpg"
            }
            className="w-full h-full object-cover opacity-80"
            alt="Banner da loja"
          />

          {/* FOTO DE PERFIL */}
          <img
            src={
              loja.perfil_url
                ? `http://localhost:3001${loja.perfil_url}`
                : "/placeholder.png"
            }
            alt="Foto da loja"
            className="w-32 h-32 rounded-full border-4 border-white absolute -bottom-16 left-6 object-cover"
          />
        </div>

        <div className="mt-20 px-6">
          {/* NOME DA LOJA */}
          <h1 className="text-4xl font-bold">{loja.nome}</h1>
          <p className="text-gray-300 text-xl -mt-1">{loja.descricao}</p>

          {/* BOTÕES DO DONO */}
          {isOwner && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => router.push(`/loja/${loja.id}/editar`)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                ✏️ Editar Loja
              </button>

              <button
                onClick={() => router.push(`/loja/${loja.id}/adicionar_produto`)}
                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
              >
                ➕ Adicionar Produto
              </button>
            </div>
          )}

          {/* AVALIAÇÕES */}
          <div className="mt-12">
            <h2 className="text-3xl font-semibold text-center">
              Reviews e Comentários
            </h2>

            <p className="text-5xl font-bold text-center mt-2">{media}</p>

            {/* estrelas */}
            <div className="flex justify-center mt-1 mb-4 text-yellow-400 text-3xl">
              {"★".repeat(Math.round(Number(media)))}
              {"☆".repeat(5 - Math.round(Number(media)))}
            </div>

            {/* lista de avaliações */}
            <div className="space-y-4 mt-6">
              {loja.avaliacoes.map((a, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-4 rounded-xl shadow-md"
                >
                  <p className="text-yellow-400 text-xl">
                    {"★".repeat(a.nota)}{" "}
                  </p>
                  <p className="text-gray-200 mt-1">{a.comentario}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    — {a.usuario?.name ?? "Usuário"}
                  </p>
                </div>
              ))}

              {loja.avaliacoes.length === 0 && (
                <p className="text-center text-gray-400">
                  Essa loja ainda não possui avaliações.
                </p>
              )}
            </div>
          </div>

          {/* PRODUTOS */}
          <div className="mt-16">
            <h2 className="text-3xl font-semibold mb-6">Produtos</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {loja.produtos.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 cursor-pointer transition"
                >
                  <img
                    src={`http://localhost:3001${p.imagem_url}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  <p className="mt-3 font-semibold">{p.nome}</p>
                  <p className="text-green-400 font-bold">R$ {p.preco}</p>
                </div>
              ))}

              {loja.produtos.length === 0 && (
                <p className="text-gray-400">
                  Nenhum produto foi adicionado ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
