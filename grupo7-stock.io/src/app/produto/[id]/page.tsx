"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import Navbar from "@/app/components/navbar";
import AvaliacoesModal from "@/app/components/AvaliacoesModal";


interface ProdutoCarrossel {
  id: number;
  nome: string;
  preco: number;
  urlImagemPrincipal: string; 
}


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
  const [showAvaliacoes, setShowAvaliacoes] = useState(false);

  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outrosProdutosDaLoja, setOutrosProdutosDaLoja] = useState<ProdutoCarrossel[]>([]);
  
  const [imagemPrincipal, setImagemPrincipal] = useState<string | null>(null);

  const isOwner = Number(user?.id) === Number(produto?.Loja.donoId);

  
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    const fetchProduto = fetch(`${API_BASE_URL}/produto/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produto não encontrado.");
        return res.json();
      })
      .then((data: Produto) => {
        setProduto(data);
        
        setImagemPrincipal(data.imagem1_url || data.Imagems_produto_URL);
        return data;
      });

    
   fetchProduto
        .then((produtoData) => {
          if (produtoData) {
            const lojaId = produtoData.Loja.id;

            return fetch(`${API_BASE_URL}/loja/${lojaId}`)
              .then(res => res.json())
              .then((responseData) => {
               
                const produtos = responseData.produtos || responseData.data || [];

                if (Array.isArray(produtos)) {
                  
                  const filtradosNormalizados: ProdutoCarrossel[] = produtos
                    .filter((p: Produto) => p.id !== produtoData.id) 
                    .map((p: Produto) => ({
                        id: p.id,
                        nome: p.nome,
                        preco: p.preco,
                    
                        urlImagemPrincipal: p.imagem1_url || p.Imagems_produto_URL || '', 
                    }));

                  setOutrosProdutosDaLoja(filtradosNormalizados);
                } else {
                  console.error("A resposta da API da loja não é um array.");
                  setOutrosProdutosDaLoja([]);
                }
              });
          }
        })

        .catch((err) => {
            console.error("Erro carregando dados:", err);
            setError("Não foi possível carregar os detalhes do produto ou produtos relacionados.");
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
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        
        {/* Botão de Voltar */}
        <div className="p-4 md:p-8">
         <button 
                onClick={() => router.back()} 
                className="text-gray-600 hover:text-black transition flex items-center gap-2"
              >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Voltar
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 pb-12">
          
          <div className="flex gap-4">
            
            {/* Miniaturas */}
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

            {/* Imagem Principal */}
            <div className="flex-1 max-w-[500px] h-full relative">
              <img
                src={`${API_BASE_URL}${imagemPrincipal}`}
                alt={produto.nome}
                className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>

          
          <div className="space-y-4">
            
            
            <h1 className="text-4xl font-extrabold text-gray-800">{produto.nome}</h1>
            
            
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center space-x-1 text-lg font-bold text-amber-500">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span>{mediaAvaliacoes}</span>
              </div>
               <button
                onClick={() => setShowAvaliacoes(true)}
                className="text-[#325862] underline hover:text-[#325862] font-semibold cursor-pointer"
              >
                Ver avaliações
              </button>
              <span className="text-sm">|</span>
              <span className="text-sm">
                Vendido por:    
                <a 
                  href={`/loja/${produto.Loja.id}`} 
                  className="text-[#325862] hover:underline font-medium"
                >
                  {produto.Loja.nome}
                </a>
              </span>
              {/* <span className="text-sm">
                  ({produto.Categoria.nome})
              </span> */}
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

            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Descrição</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {produto.descrição}
              </p>
            </div>

            
            <button
              className="w-full md:w-3/4 py-4 bg-[#325862] text-white text-xl font-semibold rounded-xl shadow-lg hover:bg-[#2b4c53] transition disabled:bg-gray-400"
              disabled={produto.estoque <= 0}
            >
              Adicionar ao Carrinho
            </button>
              {user?.id && !isOwner && (
                <button
                  onClick={() => router.push(`/produto/${produto.id}/adicionar_comentario`)}
                  className="w-full md:w-3/4 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-500 transition"
                >
                  + Adicionar comentário
                </button>
              )}
          </div>
        </div>

        {/* --- CARROSSEL DE PRODUTOS --- */}
    {outrosProdutosDaLoja.length > 0 && (
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Mais da Loja {produto.Loja.nome}</h2>

    {/* Contêiner do Carrossel */}
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      {outrosProdutosDaLoja.map((outroProduto) => (
        <a
          key={outroProduto.id}
          href={`/produto/${outroProduto.id}`}
          className="flex-shrink-0 w-60 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300 bg-white"
        >
          <img
            src={
              
              outroProduto.urlImagemPrincipal
                ? `http://localhost:3001${outroProduto.urlImagemPrincipal}`
                : "/images/placeholder_produto.png"
            }
            className="w-full h-32 object-cover rounded-t-xl"
            alt={outroProduto.nome}
            onError={(e) => { e.currentTarget.src = "/images/placeholder_produto.png"; }}
          />

          <div className="p-3">
            <p className="text-sm font-semibold text-gray-800 truncate">{outroProduto.nome}</p>
            <p className="text-lg font-bold text-[#325862] mt-1">
              R$ {new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(outroProduto.preco)}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
)}

    {showAvaliacoes && (
  <AvaliacoesModal 
    
    avaliacoes={(produto.avaliacoes ?? []).map((a: any, idx: number) => ({
      id: a.id ?? idx,
      nota: a.nota,
      comentario: a.comentario,
    }))}
    produtoId={String(produto.id)}
    onClose={() => setShowAvaliacoes(false)}
  />
)}

      </div>
    </>
  );
}