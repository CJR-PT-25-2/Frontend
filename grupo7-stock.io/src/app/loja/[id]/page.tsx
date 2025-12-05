"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/components/navbar";
import api from "@/lib/api";


import EditStoreModal from "@/app/components/EditStoreModal"; 
import EditProductModal from "@/app/components/EditProductModal"; 
import AddProductModal from "@/app/components/AddProductModal";

interface Loja {
  id: number;
  nome: string;
  descricao: string;
  perfil_url: string | null;
  banner_url: string | null;
  categoria: { nome: string };
  produtos: any[];
  avaliacoes: {
    id?: number | string;
    nota: number;
    comentario: string;
    usuario?: { name?: string };
  }[];
  donoId: number;
}

const renderStars = (rating: number, size: string = "text-3xl") => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <span className={`flex justify-center ${size} text-yellow-400`}>
      {"★".repeat(fullStars)}
      {"☆".repeat(emptyStars)}
    </span>
  );
};

export default function LojaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loja, setLoja] = useState<Loja | null>(null);

  
  const [modalLojaAberto, setModalLojaAberto] = useState(false);
  const [produtoIdAEditar, setProdutoIdAEditar] = useState<number | null>(null); 
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);

  
  const fetchLoja = useCallback(() => {
    if (!id) return;
    fetch(`http://localhost:3001/loja/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLoja(data as Loja);
      })
      .catch((err) => console.error("Erro carregando loja:", err));
  }, [id]);

  useEffect(() => {
    fetchLoja();
  }, [fetchLoja]);

  
  const handleStoreUpdate = (lojaAtualizada: Loja) => {
      setLoja(prev => (prev ? { ...prev, ...lojaAtualizada } : null));
      setModalLojaAberto(false);
  };
  
  
  const handleProductUpdate = (produtoAtualizado: any) => {
      setLoja(prevLoja => {
          if (!prevLoja) return null;

          
          const produtosAtualizados = prevLoja.produtos.map((p: any) => 
              p.id === produtoAtualizado.id ? produtoAtualizado : p
          );

          return { ...prevLoja, produtos: produtosAtualizados };
      });
      setProdutoIdAEditar(null); 
  };

  const handleProductAddSuccess = (newProduto: any) => {
      setLoja(prevLoja => {
          if (!prevLoja) return null;
          return {
              ...prevLoja,
              produtos: [...prevLoja.produtos, newProduto], 
          };
      });
      setModalProdutoAberto(false); 
  };
  
  const excluirProduto = useCallback(async (produtoId: number, produtoNome: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!loja) return;

    const confirmado = window.confirm(
      `Tem certeza que deseja excluir o produto "${produtoNome}"?`
    );
    if (!confirmado) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/produto/${produtoId}`, { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`Produto "${produtoNome}" excluído!`);

      
      setLoja((prevLoja) => {
        if (!prevLoja) return null;
        return {
          ...prevLoja,
          produtos: prevLoja.produtos.filter((p) => p.id !== produtoId),
        };
      });

    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o produto.");
    }
  }, [loja]);


  if (!loja)
    return <p className="text-white text-center mt-10">Carregando...</p>;

  const isOwner = user && Number(user.id) === loja.donoId;

  const media =
    loja.avaliacoes.length > 0
      ? (
          loja.avaliacoes.reduce((acc, a) => acc + a.nota, 0) /
          loja.avaliacoes.length
        ).toFixed(2)
      : "0.00";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-neutral-900 text-white pb-20">
        {/* BANNER */}
        <div className="w-full h-[400px] relative overflow-hidden flex items-center justify-center">
          <img
            src={
              loja.banner_url
                ? `http://localhost:3001${loja.banner_url}`
                : "/images/placeholder_banner.png"
            }
            className="w-full h-full object-cover absolute inset-0"
            alt="Banner da loja"
          />

          <div className="absolute inset-0 bg-black opacity-40"></div>

          <div className="relative z-10 text-center -mt-8">
            <h1 className="text-6xl font-extrabold tracking-tight shadow-text-md">
              {loja.nome}
            </h1>
            <p className="text-xl font-medium text-gray-300 mt-2 lowercase first-letter:uppercase">
              {loja.categoria?.nome || "Sem Categoria"}
            </p>
          </div>

          {isOwner && (
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              <button
                onClick={() => setModalLojaAberto(true)} 
                className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition"
                title="Editar Loja"
              >
                🖉
              </button>

                <button
                  onClick={() => setModalProdutoAberto(true)} 
                  className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition"
                  title="Adicionar Produto"
                >
                  ➕
                </button>
            </div>
          )}

          <img
            src={
              loja.perfil_url
                ? `http://localhost:3001${loja.perfil_url}`
                : "/images/placeholder_loja.png"
            }
            alt="Foto da loja"
            className="w-20 h-20 rounded-full border-4 border-white absolute bottom-4 left-4 z-20 object-cover shadow-lg"
          />
        </div>

        {/* CONTEÚDO */}
        <div className="px-6 md:px-20 lg:px-40 mt-10">
          <div className="flex flex-col md:flex-row gap-10">
            {/* DESCRIÇÃO */}
          <div className="w-full md:w-1/3 p-4 bg-neutral-800 rounded-xl shadow-inner shadow-neutral-700">
            <h2 className="text-xl font-semibold mb-2">Sobre {loja.nome}</h2>
            <p className="text-gray-400 text-sm break-words"> 
              {loja.descricao ||
                "Esta loja não possui uma descrição detalhada."}
            </p>
          </div>

            {/* AVALIAÇÕES */}
            <div className="w-full md:w-2/3 bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700">
              <h2 className="text-3xl font-semibold text-center mb-4">
                Reviews e Comentários
              </h2>

              {user && !isOwner && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() =>
                      router.push(`/loja/${loja.id}/adicionar_comentario`)
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-md transition"
                  >
                    + Adicionar comentário
                  </button>
                </div>
              )}

              <div className="flex justify-center items-baseline gap-4 mb-4">
                <p className="text-6xl font-extrabold text-yellow-400">
                  {media}
                </p>
                {renderStars(Number(media), "text-4xl")}
              </div>

              <p className="text-sm text-gray-500 text-center">
                Baseado em {loja.avaliacoes.length} avaliações
              </p>

              {/* AVALIAÇÕES CLICÁVEIS */}
              <div className="mt-8 flex overflow-x-auto space-x-4 pb-4">
                {loja.avaliacoes.length > 0 ? (
                  loja.avaliacoes.map((a, index) => (
                    <div
                      key={a.id || index}
                      onClick={() =>
                        router.push(
                          `/loja/${loja.id}/avaliacoes/${a.id ?? index}`
                        )
                      }
                      className="bg-neutral-900 flex-shrink-0 w-64 p-4 rounded-xl shadow-md border border-neutral-700 cursor-pointer hover:border-yellow-500 hover:bg-neutral-800 transition-all duration-200"
                    >
                      <p className="text-yellow-400 text-lg">
                        {renderStars(a.nota, "text-2xl")}
                      </p>
                      <p className="text-gray-200 mt-1 line-clamp-3 text-sm">
                        {a.comentario}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        — {a.usuario?.name ?? "Usuário Anônimo"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 w-full">
                    Essa loja ainda não possui avaliações.
                  </p>
                )}
              </div>

              {loja.avaliacoes.length > 3 && (
                <button
                  onClick={() => router.push(`/loja/${loja.id}/avaliacoes`)}
                  className="text-sm text-green-400 hover:text-green-300 transition block ml-auto mt-4"
                >
                  ver mais
                </button>
              )}
            </div>
          </div>

          {/* PRODUTOS */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6 border-b pb-2 border-neutral-700">
              Produtos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {loja.produtos.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-neutral-800 rounded-xl hover:bg-neutral-700 cursor-pointer transition shadow-xl overflow-hidden relative group" 
                >
                  <div onClick={() => router.push(`/produto/${p.id}`)}>
                    <img
                      src={
                        p.Imagems_produto_URL
                          ? `http://localhost:3001${p.Imagems_produto_URL}`
                          : "/images/placeholder_produto.png"
                      }
                      className="w-full h-32 object-cover rounded-t-xl"
                      alt={p.nome}
                    />
                    <div className="p-3">
                      <p className="mt-1 text-base font-semibold truncate">
                        {p.nome}
                      </p>
                      <p className="text-lg text-green-400 font-bold">
                        R$ {Number(p.preco).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* BOTÕES DE EDIÇÃO/EXCLUSÃO (Apenas para o dono) */}
                  {isOwner && (
                    <div className="absolute top-2 right-2 flex gap-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                      {/* LÁPIS (EDITAR) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setProdutoIdAEditar(p.id); 
                        }}
                        className="w-7 h-7 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition"
                        title="Editar Produto"
                      >
                        🖉
                      </button>

                      {/* LIXEIRA (DELETAR) */}
                      <button
                        onClick={(e) => excluirProduto(p.id, p.nome, e)}
                        className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition"
                        title="Excluir Produto"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {loja.produtos.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-10">
                  Nenhum produto foi adicionado ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* MODAL 1: EDIÇÃO DE LOJA (CONTROLADO) */}
      {modalLojaAberto && (
        <EditStoreModal
          id={String(loja.id)}
          onClose={() => setModalLojaAberto(false)}
          onSaveSuccess={handleStoreUpdate}
        />
      )}
      
      {/* MODAL 2: EDIÇÃO DE PRODUTO (CONTROLADO) */}
      {produtoIdAEditar !== null && (
        <EditProductModal
          id={String(produtoIdAEditar)}
          onClose={() => setProdutoIdAEditar(null)}
          onSaveSuccess={handleProductUpdate}
        />
      )}

      {/* MODAL 3: ADICIONAR PRODUTO */}
      {modalProdutoAberto && loja && (
        <AddProductModal
          lojaId={String(loja.id)}
          onClose={() => setModalProdutoAberto(false)}
          onSuccess={handleProductAddSuccess}
        />
      )}

    </>
  );
}