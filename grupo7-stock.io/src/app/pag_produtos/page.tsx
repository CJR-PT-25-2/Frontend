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
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Caixa_prod from "../components/caixinha_produto";
import api from "@/lib/api";

type ProdutoParacard = {
  id: number;
  nome: string;
  preco: number;
  Imagems_produto_URL?: string;
  estoque: number;
  Loja?: {
    sticker_url?: string;
    nome?: string;
  };
  avaliacoes?: any[];
};

const Categoria_id_Casa = 1;
const Categoria_id_Jogos = 38;
const Itens_por_pagina = 20;

export default function Pag_produtos() {
  const router = useRouter();

  const [produtosGerais, setProdutosGerais] = useState<ProdutoParacard[]>([]);
  const [produtosCasa, setProdutosCasa] = useState<ProdutoParacard[]>([]);
  const [produtosJogos, setProdutosJogos] = useState<ProdutoParacard[]>([]);

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");

  // AQUI OH FILTROS 
  const [precoMaximo, setPrecoMaximo] = useState(1000);
  const [ratingSort, setRatingSort] = useState<"Nenhum" | "Melhor" | "Pior">("Nenhum");
  const [sortType, setSortType] = useState<"Nenhum" | "Mais Recente" | "Mais Antiga">("Nenhum");
  const [pendentePreco, setPendentePreco] = useState(1000);
  const [pendenteRating, setPendenteRating] = useState<"Nenhum" | "Melhor" | "Pior">("Nenhum");
  const [pendenteSort, setPendenteSort] = useState<"Nenhum" | "Mais Recente" | "Mais Antiga">("Nenhum");
  const [precoMaximoReal, setPrecoMaximoReal] = useState(1000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // AQUI OH APLICA FILTROS
  const aplicarFiltros = () => {
    setPrecoMaximo(pendentePreco);
    setRatingSort(pendenteRating);
    setSortType(pendenteSort);
    setCurrentPage(1);
  };

  const fetchProdutosPorCategoriaPai = async (id: number, setter: any) => {
    try {
      const res = await api.get(`/produto/categoria_pai/${id}`);
      setter(res.data);
    } catch { }
  };

  //AQUI OH BUSCA TODOS OS PRODUTOS
  const fetchTodosProdutos = async () => {
    try {
      const res = await api.get(`/produto`, {
        params: { page: 1, limit: 10000 },
      });

      const data = res.data?.data || res.data || [];
      setProdutosGerais(data);

      const max = Math.max(...data.map((p: any) => p.preco || 0), 1000);

      setPrecoMaximoReal(max);
      setPrecoMaximo(max);
      setPendentePreco(max);
    } catch { }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchTodosProdutos(),
        fetchProdutosPorCategoriaPai(Categoria_id_Casa, setProdutosCasa),
        fetchProdutosPorCategoriaPai(Categoria_id_Jogos, setProdutosJogos),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  // AQUI OH AVALIAÇÃO
  const calcularNota = (p: ProdutoParacard) => {
    if (!Array.isArray(p.avaliacoes) || p.avaliacoes.length === 0)
      return p.estoque;

    const notas = p.avaliacoes
      .map(
        (a: any) =>
          a?.nota ??
          a?.rating ??
          a?.avaliacao ??
          null
      )
      .filter((v: any) => typeof v === "number");

    if (notas.length === 0) return p.estoque;
    return notas.reduce((s: number, n: number) => s + n, 0) / notas.length;
  };

  // AQUI OH FILTRAGEM
  const produtosFiltrados = () => {
    let lista = [...produtosGerais];


    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      lista = lista.filter((p) => p.nome.toLowerCase().includes(t));
    }
    lista = lista.filter((p) => p.preco <= precoMaximo);

    if (ratingSort === "Melhor")
      lista.sort((a, b) => calcularNota(b) - calcularNota(a));
    if (ratingSort === "Pior")
      lista.sort((a, b) => calcularNota(a) - calcularNota(b));

    if (sortType === "Mais Recente") lista.sort((a, b) => b.id - a.id);
    if (sortType === "Mais Antiga") lista.sort((a, b) => a.id - b.id);

    return lista;
  };

  const filtrados = produtosFiltrados();
  const pages = Math.ceil(filtrados.length / Itens_por_pagina);

  useEffect(() => setTotalPages(pages || 1), [filtrados.length]);

  const pagina = filtrados.slice(
    (currentPage - 1) * Itens_por_pagina,
    currentPage * Itens_por_pagina
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

      <div className="bg-[#F6F3E4] h-full pl-10 pt-10 pr-5">

        <div className="flex flex-col items-end pb-5 space-y-3 w-full pr-5">

          <div className="flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2">
            <input
              type="text"
              placeholder="Procurar por..."
              className="bg-transparent outline-none w-full h-full text-black px-2 placeholder:text-[#982829]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setCurrentPage(1)}
              className="rounded-2xl px-4 py-2"
            >
              <FaMagnifyingGlass
                size={20}
                className="text-[#982829]"
              />
            </button>
          </div>

          {/* AQUI OH FILTRO*/}
          <div className="relative w-130">

            <button
              className="flex justify-between items-center w-full bg-white p-4 rounded-xl shadow-md border border-gray-200 text-base font-semibold text-[#982829]"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filtros
              <FaAngleDown
                className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-xl p-4 mt-2 z-50 space-y-3">

                <div>
                  <label className="block text-sm font-semibold text-[#982829] mb-1">
                    Preço Máximo:{" "}
                    <span className="text-black">R$ {pendentePreco}</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={precoMaximoReal}
                    step={1}
                    value={pendentePreco}
                    onChange={(e) =>
                      setPendentePreco(Number(e.target.value))
                    }
                    className="w-full accent-[#982829]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#982829] mb-1">
                    Avaliação
                  </label>
                  <select
                    value={pendenteRating}
                    onChange={(e) =>
                      setPendenteRating(e.target.value as any)
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  >
                    <option value="Nenhum">Padrão</option>
                    <option value="Melhor">Melhor Avaliados</option>
                    <option value="Pior">Pior Avaliados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#982829] mb-1">
                    Ordenar por Adição
                  </label>
                  <select
                    value={pendenteSort}
                    onChange={(e) =>
                      setPendenteSort(e.target.value as any)
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  >
                    <option value="Nenhum">Padrão</option>
                    <option value="Mais Recente">Mais Recente</option>
                    <option value="Mais Antiga">Mais Antiga</option>
                  </select>
                </div>

                <button
                  className="w-full bg-[#982829] text-white font-semibold py-1.5 px-3 rounded-lg hover:scale-105 transition text-sm"
                  onClick={() => {
                    aplicarFiltros();
                    setIsFilterOpen(false);
                  }}
                >
                  Aplicar Filtros
                </button>

                <button
                  className="w-full bg-gray-300 text-black font-semibold py-1.5 px-3 rounded-lg hover:scale-105 transition text-sm"
                  onClick={() => {
                    setPendentePreco(precoMaximoReal);
                    setPendenteRating("Nenhum");
                    setPendenteSort("Nenhum");

                    setPrecoMaximo(precoMaximoReal);
                    setRatingSort("Nenhum");
                    setSortType("Nenhum");

                    setCurrentPage(1);
                    setIsFilterOpen(false);
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>

          {/*AQUI OH ACABA*/}

        {currentPage === 1 && (
          <>
            <h1 className="text-xl font-bold mb-4">Produtos de Jogos</h1>
            <div className="flex overflow-x-auto space-x-4 p-4">
              {produtosJogos.map((p) => (
                <Caixa_prod
                  key={p.id}
                  id={p.id}
                  nome={p.nome}
                  preco={p.preco}
                  imagemUrl={p.Imagems_produto_URL || ""}
                  disponivel={p.estoque > 0}
                  lojaURL={p.Loja?.sticker_url}
                />
              ))}
            </div>

            <h1 className="text-xl font-bold mb-4 mt-6">Produtos de Casa</h1>
            <div className="flex overflow-x-auto space-x-4 p-4">
              {produtosCasa.map((p) => (
                <Caixa_prod
                  key={p.id}
                  id={p.id}
                  nome={p.nome}
                  preco={p.preco}
                  imagemUrl={p.Imagems_produto_URL || ""}
                  disponivel={p.estoque > 0}
                  lojaURL={p.Loja?.sticker_url}
                />
              ))}
            </div>
          </>
        )}

        {/* TODOS OS PRODUTOS */}
        <h1 className="text-xl font-bold mt-6">Todos os Produtos</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {pagina.map((p) => (
            <Caixa_prod
              key={p.id}
              id={p.id}
              nome={p.nome}
              preco={p.preco}
              imagemUrl={p.Imagems_produto_URL || ""}
              disponivel={p.estoque > 0}
              lojaURL={p.Loja?.sticker_url}
            />
          ))}
        </div>

        {/* paginação */}
        <div className="flex justify-center space-x-2 my-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 ${currentPage === 1 ? "text-gray-400" : "hover:bg-[#982829] hover:text-white"}`}
          >
            {"<"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className={`p-2 ${n === currentPage ? "bg-[#982829] text-white" : "hover:bg-[#982829] hover:text-white"}`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 ${currentPage === totalPages ? "text-gray-400" : "hover:bg-[#982829] hover:text-white"}`}
          >
            {">"}
          </button>
        </div>
      </div>
    </>
  );
}