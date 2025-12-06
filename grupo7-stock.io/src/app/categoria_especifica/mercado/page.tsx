"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import api from "@/lib/api";
import BarraPesquisa from "@/app/components/barra_pesquisa";
import Caixa_prod from "@/app/components/caixinha_produto";
import { useRouter } from "next/navigation";
import { FaAngleDown } from "react-icons/fa";


type ProdutoParacard = {
    id: number;
    nome: string;
    preco: number;
    Imagems_produto_URL: string;
    categoria_id: number;
    estoque: number;
    Loja: {
      sticker_url : string;
    }

    avaliacoes?: any[];
}

const Itens_por_pagina = 20;


export default function FeedPage() {
    const [produtos, setProdutos] = useState<ProdutoParacard[]>([]);
    const [produtosOriginais, setProdutosOriginais] = useState<ProdutoParacard[]>([]);
    const [produtosGeraisMercado, setProdutosGeraisMercado] = useState<ProdutoParacard[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroAtivoId, setFiltroAtivoId] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();
    const [produtosFiltradosBuscaCategoria, setProdutosFiltradosBuscaCategoria] = useState<ProdutoParacard[]>([]);

    //BArra de filtros
    const [precoMaximo, setPrecoMaximo] = useState(1000);
    const [ratingSort, setRatingSort] = useState<"Nenhum" | "Melhor" | "Pior">("Nenhum");
    const [sortType, setSortType] = useState<"Nenhum" | "Mais Recente" | "Mais Antiga">("Nenhum");
    const [pendentePreco, setPendentePreco] = useState(1000);
    const [pendenteRating, setPendenteRating] = useState<"Nenhum" | "Melhor" | "Pior">("Nenhum");
    const [pendenteSort, setPendenteSort] = useState<"Nenhum" | "Mais Recente" | "Mais Antiga">("Nenhum");
    const [precoMaximoReal, setPrecoMaximoReal] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    //Aplicação de filtro
    const aplicarFiltros = () => {
    setPrecoMaximo(pendentePreco);
    setRatingSort(pendenteRating);
    setSortType(pendenteSort);
  };

    const filtrarCategoria = (subId: number) => {
        setFiltroAtivoId(subId);

        console.log("Filtrando categoria:", subId);

        const filtrados = produtosOriginais.filter(
            (p) => subId === 0 || Number(p.categoria_id) === Number(subId)
        );

        console.log("Filtrados:", filtrados);

        setProdutos(filtrados);
    };

    useEffect(() => {
        api
            .get("/produto/categoria_pai/1")
            .then((res) => {
                console.log("Produtos recebidos:", res.data);
                setProdutosOriginais(res.data);
                setProdutos(res.data);
            })
            .catch((err) => console.error("Erro ao carregar Mercado:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
    let list = [...produtosOriginais];
    if (filtroAtivoId !== 0) {
        list = list.filter(p => Number(p.categoria_id) === Number(filtroAtivoId));
    }
    
    // 2. Aplicar filtro de Busca (se ativo, se a BarraPesquisa n estiver fazendo isso)
    // Se a BarraPesquisa estiver fazendo isso, podemos pular este passo aqui
    // Se precisar da busca aqui, você precisará gerenciar `searchTerm` nesta página.
    
    // 3. Aplicar Filtro de Preço
    list = list.filter((p) => p.preco <= precoMaximo);

    // 4. Aplicar Ordenação por Avaliação
    if (ratingSort === "Melhor") {
        list.sort((a, b) => calcularNota(b) - calcularNota(a));
    } else if (ratingSort === "Pior") {
        list.sort((a, b) => calcularNota(a) - calcularNota(b));
    }

    // 5. Aplicar Ordenação por Adição
    if (sortType === "Mais Recente") {
        list.sort((a, b) => b.id - a.id);
    } else if (sortType === "Mais Antiga") {
        list.sort((a, b) => a.id - b.id);
    }

    setProdutos(list); // Atualiza a lista final que é renderizada
    setCurrentPage(1); // Opcional: Voltar para a página 1 ao aplicar filtros

}, [
    precoMaximo,
    ratingSort,
    sortType,
    filtroAtivoId,
    produtosOriginais,
    // Se a BarraPesquisa não atualizar `produtos` diretamente, adicione `searchTerm` aqui
]);

    const fetchTodosProdutos = async () => {
    try {
      const res = await api.get(`/produto/categoria_pai/1`, {
        params: { page: 1, limit: 10000 },
      });

      const data = res.data?.data || res.data || [];
      setProdutosGeraisMercado(data);

      const max = Math.max(...data.map((p: any) => p.preco || 0), 1000);

      setPrecoMaximoReal(max);
      setPrecoMaximo(max);
      setPendentePreco(max);
    } catch { }
  };

  //Filtro por avaliação
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


  //Produtos filtrados
    const applyFiltersAndSorting = (list: ProdutoParacard[]): ProdutoParacard[] => {
        let filteredList = [...list];

        
        filteredList = filteredList.filter((p) => p.preco <= precoMaximo);

        
        if (ratingSort === "Melhor") {
            filteredList.sort((a, b) => calcularNota(b) - calcularNota(a));
        } else if (ratingSort === "Pior") {
            filteredList.sort((a, b) => calcularNota(a) - calcularNota(b));
        }

        
        if (sortType === "Mais Recente") {
            filteredList.sort((a, b) => b.id - a.id);
        } else if (sortType === "Mais Antiga") {
            filteredList.sort((a, b) => a.id - b.id);
        }

        return filteredList;
    };

    
   

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-65 bg-[#000000] text-white">
                <div className="text-white">
                    <h1 className="text-4xl leading-snug pl-20 pt-15">
                        O UNIVERSO <strong className="font-bold">culinário</strong>,
                    </h1>
                    <h1 className="text-4xl leading-snug pl-55 pb-10">
                        em um só lugar!
                    </h1>
                </div>

                <div className="h-full relative ml-8">
                    <img
                        src="/images/Mascote4.png"
                        alt="Mascote"
                        className="w-140 h-140 object-contain pr-20"
                    />
                </div>
            </div>

            <div className="relative z-10 bg-[#F6F3E4] h-full min-h-150 pl-10 pt-10">
                <div className=" items-center flex justify-end pr-5 pb-5">
                     <div className="flex flex-col">
                    <BarraPesquisa
                        dadosOriginais={produtosOriginais}
                        setDadosFiltrados={setProdutos}
                        chave="nome"
                        placeholder="Buscar produtos..."
                    />

                    {/*AQUI OH COMEÇA*/}
                <div className="relative  w-130  pb-5 pt-5 ">
                
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
                        
                
                          {/*AQUI OH ACABA*/}
                </div>
                </div>
                

                <div className="flex space-x-8 items-center overflow-x-auto whitespace-nowrap">
                    <button
                        onClick={() => filtrarCategoria(0)}
                        className={`h-10 w-15  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 0 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Todos
                    </button>

                    <button
                        onClick={() => filtrarCategoria(5)}
                        className={`h-10 w-15  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center  ${filtroAtivoId === 5 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Adega
                    </button>

                    <button
                        onClick={() => filtrarCategoria(7)}
                        className={`h-10 w-23  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 7 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Açougue
                    </button>

                    <button
                        onClick={() => filtrarCategoria(6)}
                        className={`h-10 w-21  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 6 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Bebidas
                    </button>

                    <button
                        onClick={() => filtrarCategoria(2)}
                        className={`h-10 w-24  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 2 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Hortifruti
                    </button>

                    <button
                        onClick={() => filtrarCategoria(3)}
                        className={`h-10 w-23  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 3 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Limpeza
                    </button>

                    <button
                        onClick={() => filtrarCategoria(8)}
                        className={`h-10 w-24  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 8 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Mercearia
                    </button>

                    <button
                        onClick={() => filtrarCategoria(4)}
                        className={`h-10 w-20  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 4 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Padaria
                    </button>

                    <button
                        onClick={() => filtrarCategoria(9)}
                        className={`h-10 w-20  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 9 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Outros
                    </button>

                </div>


                <div className="grid grid-cols-4 gap-6 mt-10">
                          {loading ? (
                            <p>Carregando...</p>
                          ) : produtos.length === 0 ? (
                            <p>Nenhum produto encontrado.</p>
                          ) : (
                            produtos.map((p) => (
                              <div
                                key={p.id} className="cursor-pointer" onClick={() => router.push(`/produto/${p.id}`)}
                              >
                                <Caixa_prod
                                  id={p.id}
                                  nome={p.nome}
                                  preco={p.preco}
                                  imagemUrl={p.Imagems_produto_URL}
                                  quantidade={p.estoque}
                                  disponivel={true}
                                  lojaURL={p.Loja?.sticker_url ?? ""}
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  );
                }