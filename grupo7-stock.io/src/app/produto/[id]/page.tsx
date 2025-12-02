"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 

interface Produto {
  id: number;
  nome: string;
  descrição: string;
  preco: number;
  estoque: number;
  Imagems_produto_URL: string | null;
  imagem1_url: string | null;
  imagem2_url: string | null;
  imagem3_url: string | null;
  imagem4_url: string | null;
  Loja: {
    id: number;
    nome: string;
    donoId: number;
  };
  Categoria: {
    nome: string;
  };
  
  avaliacoes?: { nota: number; comentario: string }[];
}

const API_BASE_URL = "http://localhost:3001";

export default function ProdutoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const [imagemPrincipal, setImagemPrincipal] = useState<string | null>(null);

 const isOwner = Number(user?.id) === Number(produto?.Loja.donoId);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_BASE_URL}/produto/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produto não encontrado.");
        return res.json();
      })
      .then((data: Produto) => {
        setProduto(data);
        setImagemPrincipal(data.imagem1_url || data.Imagems_produto_URL);
      })
      .catch((err) => {
        console.error("Erro carregando produto:", err);
        setError("Não foi possível carregar os detalhes do produto.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="text-center p-10 text-gray-700">Carregando detalhes do produto...</p>;

  if (error || !produto)
    return <p className="text-center p-10 text-red-600">{error || "Produto não encontrado."}</p>;



  const urlsDisponiveis = [
    produto.imagem1_url,
    produto.imagem2_url,
    produto.imagem3_url,
    produto.imagem4_url,
  ].filter(url => url !== null) as string[];

  
  const mediaAvaliacoes = produto.avaliacoes?.length 
    ? (produto.avaliacoes.reduce((acc, a) => acc + a.nota, 0) / produto.avaliacoes.length).toFixed(1)
    : '0.0';

  const precoFormatado = parseFloat(produto.preco as any).toFixed(2).replace('.', ',');


  return (
    <div className="min-h-screen bg-white">
      
      {/* Botão de Voltar */}
      <div className="p-4 md:p-8">
       <button 
              onClick={(router.back)} 
               
              className="text-gray-600 hover:text-black transition flex items-center gap-2"
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Voltar
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
        
        <div className="flex gap-4">
          
          
          <div className="flex flex-col gap-3">
            {urlsDisponiveis.map((url, index) => (
              <img
                key={index}
                src={`${API_BASE_URL}${url}`}
                alt={`Miniatura ${index + 1}`}
                onClick={() => setImagemPrincipal(url)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                  imagemPrincipal === url ? 'border-purple-600 shadow-md' : 'border-gray-200'
                }`}
              />
            ))}
          </div>

          
          <div className="flex-1 max-w-[500px] h-full relative">
            <img
              src={`${API_BASE_URL}${imagemPrincipal}`}
              alt={produto.nome}
              className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>

        
        <div className="space-y-6">
          
          
          <h1 className="text-4xl font-extrabold text-gray-800">{produto.nome}</h1>
          
          
          <div className="flex items-center gap-4 text-gray-600">
            <span className="text-lg font-bold text-yellow-500">
              {mediaAvaliacoes}
            </span>
            <span className="text-sm">|</span>
            <span className="text-sm">
              <a 
                href={`/loja/${produto.Loja.id}`} 
                className="text-purple-600 hover:underline font-medium"
              >
                {produto.Loja.nome}
              </a>
            </span>
            <span className="text-sm">
                ({produto.Categoria.nome})
            </span>
          </div>

          
          <p className="text-5xl font-extrabold text-gray-900">
            R$ {precoFormatado}
          </p>
          
          
          <p className="text-sm font-semibold">
            {produto.estoque > 0 
                ? <span className="text-green-600">
                    {produto.estoque} unidades disponíveis em Estoque
                </span>
                : <span className="text-red-600">Esgotado</span>}
          </p>

          
          <button
            className="w-full md:w-3/4 py-4 bg-purple-600 text-white text-xl font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition disabled:bg-gray-400"
            disabled={produto.estoque <= 0}
          >
            Adicionar ao Carrinho
          </button>
            {user?.id && !isOwner && (
              <button
                onClick={() => router.push(`/produto/${produto.id}/adicionar_comentario`)}
                className="w-full md:w-3/4 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-500 transition mb-6"
              >
                + Adicionar comentário
              </button>
            )}

          
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Descrição</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {produto.descrição}
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
}