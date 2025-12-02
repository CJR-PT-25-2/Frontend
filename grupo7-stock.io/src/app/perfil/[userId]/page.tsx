"use client";
import Image from "next/image"; 
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation"; 
import api from "@/lib/api"; 

import { User } from "@/types/index"; 
import Navbar from "@/app/components/navbar";
import EditProfileModal from "@/app/components/EditProfileModal";
import EditStoreModal from "@/app/components/EditStoreModal"; 
import EditProductModal from "@/app/components/EditProductModal";
import CreateStoreModal from "@/app/components/CreateStoreModal"; 
import AddProductModal from "@/app/components/AddProductModal"; 


interface Loja {
  id: number;
  nome: string;
  descricao: string;
  perfil_url: string | null;
  banner_url: string | null;
  categoria: { nome: string } | null;
  produtos: any[];
  avaliacoes: any[];
  donoId: number;
}

export default function PerfilPage() {
  const router = useRouter();
  const params = useParams(); 
  const userId = params.userId as string; 

  const [perfil, setPerfil] = useState<User | null>(null); 
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null); 
  const [carregando, setCarregando] = useState(true);

  
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [lojaIdAEditar, setLojaIdAEditar] = useState<number | null>(null);
  const [produtoIdAEditar, setProdutoIdAEditar] = useState<number | null>(null);
  const [modalCriarLojaAberto, setModalCriarLojaAberto] = useState(false); 
  const [modalAdicionarProdutoAberto, setModalAdicionarProdutoAberto] = useState<number | null>(null); 
  
  const [lojas, setLojas] = useState<Loja[] | null>(null);


  const isMeuPerfil = usuarioLogado && perfil && usuarioLogado.id.toString() === userId;


  const buscarUsuarioLogado = useCallback(async (token: string) => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarioLogado(res.data);
      return res.data as User;
    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      setUsuarioLogado(null);
      return null;
    }
  }, []);


  const buscarPerfil = useCallback(async () => {
    try {
      const res = await api.get(`/user/${userId}`);
      setPerfil(res.data);
    } catch (error) {
      console.error(`Erro ao buscar perfil ${userId}:`, error);
      setPerfil(null);
    }
  }, [userId]);


  
  const buscarLojas = useCallback(async () => {
    try {
      const res = await api.get(`/loja/usuario/${userId}`); 
      setLojas(res.data ?? []);
    } catch (err) {
      console.error("Erro ao buscar lojas:", err);
      setLojas([]);
    }
  }, [userId]);


  
  const handleStoreUpdate = (lojaAtualizada: Loja) => {
    setLojas(prev => 
      prev 
        ? prev.map(l => (l.id === lojaAtualizada.id ? lojaAtualizada : l))
        : []
    );
    setLojaIdAEditar(null); 
  };
  
  const handleStoreCreate = (newLojaId: number) => {
    setModalCriarLojaAberto(false);
    buscarLojas(); 
  };

  
  const handleProductAddSuccess = (newProduto: any) => {
      setLojas(prev => {
          if (!prev) return prev;
          
          
          const lojaIdDoProduto = newProduto.loja_id || (newProduto.Loja ? newProduto.Loja.id : null);
          if (!lojaIdDoProduto) return prev;
          
          
          const lojaIndex = prev.findIndex(l => l.id === lojaIdDoProduto);
          if (lojaIndex === -1) return prev; 

          const lojaAntiga = prev[lojaIndex];
          
          
          const produtosAtualizados = [...lojaAntiga.produtos, newProduto];

          const novaLoja = { ...lojaAntiga, produtos: produtosAtualizados };
          
          
          return prev.map((l, index) => index === lojaIndex ? novaLoja : l);
      });
      setModalAdicionarProdutoAberto(null); 
  };
  
  const handleProductUpdate = (produtoAtualizado: any) => {
    setLojas(prev => {
        if (!prev) return prev;
        
        
        const lojaIdDoProduto = produtoAtualizado.loja_id || (produtoAtualizado.Loja ? produtoAtualizado.Loja.id : null); 

        if (!lojaIdDoProduto) {
            console.error("Erro: ID da loja não encontrado em produtoAtualizado.");
            return prev;
        }

        const lojaIndex = prev.findIndex(l => l.id === lojaIdDoProduto);
        if (lojaIndex === -1) return prev; 

        const lojaAntiga = prev[lojaIndex];
        
        const produtosAtualizados = lojaAntiga.produtos.map((p: any) => 
            p.id === produtoAtualizado.id ? produtoAtualizado : p
        );

        const novaLoja = { ...lojaAntiga, produtos: produtosAtualizados };
        
        return prev.map((l, index) => index === lojaIndex ? novaLoja : l);
    });
    setProdutoIdAEditar(null); 
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) buscarUsuarioLogado(token);

    buscarPerfil();
    buscarLojas();
  }, [buscarPerfil, buscarUsuarioLogado, buscarLojas]);


  useEffect(() => {
    if (perfil !== null && lojas !== null) {
      setCarregando(false);
    }
  }, [perfil, lojas]);



  const excluirProduto = async (lojaId: number, produtoId: number) => {
    const confirmado = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmado) return;

    try {
      await api.delete(`/produto/${produtoId}`);
      alert("Produto excluído!");
      setLojas((prev) =>
        prev
          ? prev.map((l) =>
              l.id === lojaId ? { ...l, produtos: l.produtos.filter((p) => p.id !== produtoId) } : l
            )
          : prev
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o produto.");
    }
  };

  
  const excluirLoja = async (
    lojaId: number,
    lojaNome: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (!usuarioLogado) return;

    const confirmacao = window.confirm(
      `ATENÇÃO: Você tem certeza que deseja excluir a loja "${lojaNome}"? Esta ação é irreversível.`
    );
    if (!confirmacao) return;

    const nomeConfirmado = window.prompt(
      `Para confirmar a exclusão, digite o nome completo da loja: "${lojaNome}"`
    );
    if (nomeConfirmado !== lojaNome) {
      alert("Nome não corresponde. Exclusão abortada.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/loja/${lojaId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Loja "${lojaNome}" excluída com sucesso.`);
      setLojas((prev) => (prev ? prev.filter((l) => l.id !== lojaId) : []));
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      alert("Erro ao excluir a loja.");
    }
  };

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center">Carregando perfil...</div>;
  }

  if (!perfil) {
    return <div className="min-h-screen text-center pt-20">Perfil não encontrado.</div>;
  }
  
  const temLojas = !!(lojas && lojas.length > 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5f4eb]">

        {/* Faixa preta */}
        <div className="relative bg-black h-60">

          <button
            onClick={() => router.push('/')}
            className="absolute left-4 sm:left-12 top-4 sm:top-[57%] p-2 rounded-full hover:bg-white/10 transition"
          >
            <img src="/images/return.png" width={40} height={40} />
          </button>

          <div className="absolute left-[20%] bottom-0 transform -translate-x-1/2 translate-y-1/4">
            <img
              src={
                perfil?.foto_perfil_URL
                  ? `http://localhost:3001${perfil.foto_perfil_URL}`
                  : "/images/iconepessoa.png"
              }
              className="w-[200px] h-[200px] rounded-full border-4 border-[#f5f4eb] object-cover"
            />
          </div>
        </div>

        {/* Área branca */}
        <div className="pt-28 text-center relative px-4"> 

          {isMeuPerfil && (
            <button
              onClick={() => setModalEdicaoAberto(true)} 
              className="absolute right-4 sm:right-10 top-0 sm:top-6 bg-[#d6993c] text-black py-2 px-14 rounded-full font-semibold hover:bg-yellow-600 transition"
            >
              Editar Perfil
            </button>
          )}

          <div className="text-left pl-4 sm:pl-40">
            <h1 className="text-5xl text-black font-bold mb-1">{perfil.name}</h1>
            <p className="text-2xl text-black mb-1">@{perfil.username}</p>
            {isMeuPerfil && <p className="text-2xl">{perfil.email}</p>}
          </div>

          <hr className="my-8 max-w-4xl mx-auto border-gray-500" />

                {/*SEÇÃO DE LOJAS COM CARROSSEL HORIZONTAL*/}
        <div className="max-w-6xl mx-auto mt-12 px-4 sm:px-0">

          {/* BOTÃO CRIAR NOVA LOJA */}
          {isMeuPerfil && (
              <div className="flex justify-end mb-8 max-w-4xl mx-auto">
                <button
                  onClick={() => setModalCriarLojaAberto(true)} // 🚀 ABRE MODAL DE CRIAÇÃO
                  className="bg-[#d6993c] text-black py-2 px-8 rounded-full font-semibold hover:bg-yellow-600 transition shadow-lg"
                >
                  Criar Nova Loja
                </button>
              </div>
            )}
            
          <div className="max-w-4xl mx-auto">

            {/* TÍTULO SÓ SE O USUÁRIO REALMENTE TIVER LOJAS */}
            {temLojas && (
              <h2 className="text-4xl text-black font-extrabold mb-8 text-left">
                {isMeuPerfil ? "Minhas Lojas" : `Lojas de ${perfil.name}`}
              </h2>
            )}

            {/* MENSAGENS DE LOJA VAZIA */}
            {!temLojas && isMeuPerfil && (
              <div className="flex flex-col items-start">
                <p className="text-gray-600 italic mb-4 text-left">Você ainda não tem lojas.</p>
              </div>
            )}

            {!temLojas && !isMeuPerfil && (
              <div className="flex justify-center items-center w-full mt-16">
                <p className="text-gray-700 text-xl font-semibold text-center">
                  Esse usuário não possui lojas.
                </p>
              </div>
            )}

            {/* LISTA DE LOJAS */}
            {temLojas && (
              <div className="space-y-12">
                {lojas!.map((l) => (
                  <div key={l.id} className="text-black bg-white p-6 rounded-xl shadow-lg border border-gray-200">

                    {/* HEADER DO CARD DA LOJA (compacto e alinhado à esquerda) */}
                    <div
                      onClick={() => router.push(`/loja/${l.id}`)}
                      className="flex items-center justify-between cursor-pointer group mb-5 border-b pb-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* IMAGEM DA LOJA: AGORA É UM CÍRCULO */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                            <img
                              src={
                                l.perfil_url 
                                  ? `http://localhost:3001${l.perfil_url}` 
                                  : "/images/iconepessoa.png"
                              }
                              alt={l.nome}
                              className="w-full h-full object-cover rounded-full border-2 border-[#d6993c] shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                        </div>

                        {/* DETALHES */}
                        <div className="text-left">
                          <h3 className="text-2xl font-extrabold text-gray-600 mb-0 leading-snug group-hover:text-[#d6993c] transition">
                              {l.nome}
                          </h3>

                          {/* CATEGORIA */}
                          <p className="text-sm font-medium text-gray-500 italic">
                            {l.categoria?.nome ? `Categoria: ${l.categoria.nome}` : "Sem Categoria"}
                          </p>
                          <span className="text-sm text-[#325862] hover:underline">Ver Loja</span>
                        </div>
                      </div>

                      {/* BOTÕES DE AÇÃO (SÓ PARA O MEU PERFIL) */}
                      {isMeuPerfil && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLojaIdAEditar(l.id); 
                            }}
                            className="w-8 h-8 bg-[#325862] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#2b4c53] transition"
                            title="Editar Loja"
                          >
                            🖉
                          </button>
                          <button
                            onClick={(e) => excluirLoja(l.id, l.nome, e)}
                            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-red-600 transition"
                            title="Excluir Loja"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ÁREA DE PRODUTOS (CARROSSEL HORIZONTAL) */}
                    <div className="flex justify-between items-center mb-4 pb-2">
                        <h4 className="text-xl font-bold text-gray-700 text-left">
                          Produtos de {l.nome}
                        </h4>
                        {/* BOTÃO DE ADICIONAR PRODUTO (+) */}
                        {isMeuPerfil && (
                            <button
                                onClick={() => setModalAdicionarProdutoAberto(l.id)}
                                className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition"
                                title="Adicionar Novo Produto"
                            >
                                ➕
                            </button>
                        )}
                    </div>
                    
                    {l.produtos?.length > 0 ? (
                      // CARROSSEL: overflow-x-auto para scroll horizontal
                      <div className="flex overflow-x-auto space-x-6 pb-4 -mx-6 px-6">
                        {l.produtos.map((produto: any) => (
                          <div
                            key={produto.id}
                            // Largura fixa para itens do carrossel
                            className="flex-shrink-0 w-64 border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white relative group overflow-hidden"
                          >
                            <div
                              onClick={() => router.push(`/produto/${produto.id}`)}
                              className="cursor-pointer"
                            >
                              <div className="relative w-full h-36 overflow-hidden">
                                {produto.Imagems_produto_URL && (
                                  <img
                                    src={`http://localhost:3001${produto.Imagems_produto_URL}`}
                                    alt={produto.nome}
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                )}
                              </div>

                              <div className="p-3">
                                <p className="text-xs font-semibold text-[#d6993c] uppercase mb-1 truncate">{produto.Categoria?.nome || "Geral"}</p>
                                <p className="text-base font-bold text-gray-800 truncate mb-1">{produto.nome}</p>
                                <p className="text-xl text-green-600 font-extrabold">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                              </div>
                            </div>

                            {/* BOTÕES DE AÇÃO DO PRODUTO (NO HOVER) */}
                            {isMeuPerfil && (
                              <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProdutoIdAEditar(produto.id); 
                                  }}
                                  className="w-7 h-7 bg-white/90 text-[#325862] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-white transition"
                                  title={`Editar ${produto.nome}`}
                                >
                                  🖉
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    excluirProduto(l.id, produto.id);
                                  }}
                                  className="w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-600 transition"
                                  title={`Excluir ${produto.nome}`}
                                >
                                  🗑
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-gray-500 italic">
                          Nenhum produto listado nesta loja.
                          {isMeuPerfil && (
                            <button
                              onClick={() => setModalAdicionarProdutoAberto(l.id)} // ⬅️ ABRE MODAL DE ADICIONAR PRODUTO (Substituindo a rota)
                              className="text-[#325862] ml-2 hover:underline font-medium"
                            >
                              Adicionar produto.
                            </button>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      
      {/* MODAL 1: Edição de Perfil (Controlado por modalEdicaoAberto) */}
      {modalEdicaoAberto && (
        <EditProfileModal
          onClose={() => setModalEdicaoAberto(false)}
          onSaveSuccess={() => {
            setModalEdicaoAberto(false);
            buscarPerfil();
            buscarUsuarioLogado(localStorage.getItem("token") || "");
          }}
        />
      )}

      {/* MODAL 2: Criação de Loja */}
      {modalCriarLojaAberto && (
          <CreateStoreModal
              onClose={() => setModalCriarLojaAberto(false)}
              onSuccess={handleStoreCreate} // Adiciona a nova loja na lista e fecha
          />
      )}

      {/* MODAL 3: Edição de Loja (Controlado por lojaIdAEditar) */}
      {lojaIdAEditar !== null && (
        <EditStoreModal
          id={String(lojaIdAEditar)} 
          onClose={() => setLojaIdAEditar(null)}
          onSaveSuccess={handleStoreUpdate}
        />
      )}

      {/* MODAL 4: Edição de Produto */}
      {produtoIdAEditar !== null && (
        <EditProductModal
          id={String(produtoIdAEditar)} 
          onClose={() => setProdutoIdAEditar(null)}
          onSaveSuccess={handleProductUpdate} 
        />
      )}
      
      {/* MODAL 5: Adicionar Produto */}
      {modalAdicionarProdutoAberto !== null && (
        <AddProductModal
          lojaId={String(modalAdicionarProdutoAberto)}
          onClose={() => setModalAdicionarProdutoAberto(null)}
          onSuccess={handleProductAddSuccess} 
        />
      )}
    </>
  );
}