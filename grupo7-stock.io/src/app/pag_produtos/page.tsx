"use client";

import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import { GiFruitBowl } from "react-icons/gi";
import { GiMedicinePills } from "react-icons/gi";
import { GiLipstick } from "react-icons/gi";
import { GiLargeDress } from "react-icons/gi";
import { FaLaptop } from "react-icons/fa";
import { IoGameControllerSharp } from "react-icons/io5";
import { TbHorseToy } from "react-icons/tb";
import { FaHouseChimneyWindow } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Caixa_prod from "../components/caixinha_produto";
import api from "@/lib/api";
import BarraPesquisa from "../components/barra_pesquisa";

type ProdutoParacard = {
  id: number;
  nome: string;
  preco: number;
  Imagems_produto_URL: string;
  estoque: number;
  Loja?: {
    sticker_url: string;
  };
  categoria_id?: number;
};

const Categoria_id_Casa = 1;
const Categoria_id_Jogos = 45;
const Itens_por_pagina = 18;

export default function Pag_produtos() {
  const router = useRouter();

  const [produtosCasa, setProdutosCasa] = useState<ProdutoParacard[]>([]);
  const [produtosJogos, setProdutosJogos] = useState<ProdutoParacard[]>([]);
  const [produtosGerais, setProdutosGerais] = useState<ProdutoParacard[]>([]);
  const [produtosGeraisOriginais, setProdutosGeraisOriginais] = useState<
    ProdutoParacard[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex justify-center space-x-2 my-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`p-2 ${
            currentPage === 1
              ? "text-gray-400"
              : "text-black hover:bg-[#982829] hover:scale-105 cursor-pointer"
          }`}
        >
          &lt;
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`p-2 transition-all cursor-pointer ${
              page === currentPage
                ? "bg-[#982829] text-white font-bold"
                : "text-gray-700 hover:bg-[#982829] hover:text-white hover:scale-105"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 ${
            currentPage === totalPages
              ? "text-gray-400"
              : "text-black hover:bg-[#982829] hover:scale-105 cursor-pointer"
          }`}
        >
          &gt;
        </button>
      </div>
    );
  };

  const fetchProdutosPorCategoriaPai = async (
    id: number,
    setFunction: React.Dispatch<React.SetStateAction<ProdutoParacard[]>>,
    categoriaNome: string
  ) => {
    try {
      const response = await api.get(`/produto/categoria_pai/${id}`);
      setFunction(response.data);
    } catch (err) {
      console.error(`Erro ao buscar produtos de ${categoriaNome}:`, err);
    }
  };

  const fetchProdutosgeral = async (page: number) => {
    try {
      const response = await api.get(`/produto`, {
        params: { page, limit: Itens_por_pagina },
      });

      setProdutosGerais(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (err) {
      console.error("Erro ao buscar produtos gerais", err);
      setError("Erro ao buscar produtos");
    }
  };

  const fetchTodosProdutos = async () => {
    try {
      const response = await api.get(`/produto`, {
        params: { page: 1, limit: 999999 },
      });

      setProdutosGeraisOriginais(response.data.data);
    } catch (err) {
      console.error("Erro ao buscar produtos completos", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProdutosgeral(currentPage).finally(() => setLoading(false));
  }, [currentPage]);

  useEffect(() => {
    fetchTodosProdutos();
    fetchProdutosPorCategoriaPai(Categoria_id_Casa, setProdutosCasa, "Casa");
    fetchProdutosPorCategoriaPai(Categoria_id_Jogos, setProdutosJogos, "Jogos");
  }, []);

  const renderProdutos = (titulo: string, produtos: ProdutoParacard[]) => (
    <div className="pt-5">
      <h1 className="text-xl font-semibold mb-4">{titulo}</h1>

      {loading ? (
        <p>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p>Nenhum produto de {titulo} encontrado.</p>
      ) : (
        <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4">
          {produtos.map((produto) => (
            <Caixa_prod
              key={produto.id}
              id={produto.id}
              nome={produto.nome}
              preco={produto.preco}
              imagemUrl={produto.Imagems_produto_URL}
              quantidade={produto.estoque}
              lojaURL={produto.Loja?.sticker_url}
              disponivel={produto.estoque > 0}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderProdutosGerais = (produtos: ProdutoParacard[]) => (
    <div className="pt-5">
      {loading ? (
        <p>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="cursor-pointer"
              onClick={() => router.push(`/produto/${produto.id}`)}
            >
              <Caixa_prod
                id={produto.id}
                nome={produto.nome}
                preco={produto.preco}
                imagemUrl={produto.Imagems_produto_URL}
                quantidade={produto.estoque}
                lojaURL={produto.Loja?.sticker_url}
                disponivel={produto.estoque > 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />

      <div className="justify-center items-center h-60 bg-[#000000] text-white">
        <div className="text-2xl font-semibold text-white pl-10 pt-10">
          <h1>Categorias</h1>
        </div>

        <div className="justify-center flex overflow-x-auto whitespace-nowrap p-4 space-x-10 flex-shrink-0">

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/mercado")}
          >
            <GiFruitBowl size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Mercado</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/remedio")}
          >
            <GiMedicinePills size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Remédios</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/cosmeticos")}
          >
            <GiLipstick size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Cosméticos</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/moda")}
          >
            <GiLargeDress size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Moda</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/eletronicos")}
          >
            <FaLaptop size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Eletrônicos</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/jogos")}
          >
            <IoGameControllerSharp
              size={40}
              className="mx-auto mt-2 text-[#982829]"
            />
            <p className="text-sm text-center text-[black] mt-1">Jogos</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/brinquedos")}
          >
            <TbHorseToy size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Brinquedos</p>
          </button>

          <button
            className="h-25 w-25 bg-white rounded-2xl cursor-pointer hover:scale-105"
            onClick={() => router.push("../categoria_especifica/casa")}
          >
            <FaHouseChimneyWindow size={40} className="mx-auto mt-2 text-[#982829]" />
            <p className="text-sm text-center text-[black] mt-1">Casa</p>
          </button>
        </div>
      </div>

      <div className="relative z-10 bg-[#F6F3E4] h-full pl-10 pt-10">
        <div className="flex items-center justify-end pr-5 pb-5">
          <div className="flex text-[#982829] rounded-2xl w-130 h-12 p-2">
            <BarraPesquisa
              dadosOriginais={produtosGeraisOriginais}
              setDadosFiltrados={setProdutosGerais}
              chave="nome"
              placeholder="Buscar produtos..."
            />
          </div>
        </div>

        {currentPage === 1 && (
          <>
            {renderProdutos("Produtos de Jogos", produtosJogos)}
            {renderProdutos("Produtos de Mercado", produtosCasa)}
          </>
        )}

        <h1 className="text-xl font-semibold mb-4">Todos os Produtos</h1>
        {renderProdutosGerais(produtosGerais)}

        {renderPaginationButtons()}
      </div>
    </>
  );
}
