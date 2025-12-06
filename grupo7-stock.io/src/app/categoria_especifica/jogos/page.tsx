"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import api from "@/lib/api";
import BarraPesquisa from "@/app/components/barra_pesquisa";
import { useRouter } from "next/navigation";
import Caixa_prod from "@/app/components/caixinha_produto";
import { FaAngleDown } from "react-icons/fa";

type ProdutoParacard = {
  id: number;
  nome: string;
  preco: number;
  Imagems_produto_URL: string;
  estoque: number;
  categoria_id: number;
  Loja?: {
    sticker_url: string;
    nome: string;
  };

  avaliacoes?: any[];
};

export default function FeedPage() {
  const [produtos, setProdutos] = useState<ProdutoParacard[]>([]);
  const [produtosOriginais, setProdutosOriginais] = useState<ProdutoParacard[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filtroAtivoId, setFiltroAtivoId] = useState(0);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  //BArra de filtros
  const [precoMaximo, setPrecoMaximo] = useState(1000);
  const [ratingSort, setRatingSort] = useState<"Nenhum" | "Melhor" | "Pior">(
    "Nenhum"
  );
  const [sortType, setSortType] = useState<
    "Nenhum" | "Mais Recente" | "Mais Antiga"
  >("Nenhum");
  const [pendentePreco, setPendentePreco] = useState(1000);
  const [pendenteRating, setPendenteRating] = useState<
    "Nenhum" | "Melhor" | "Pior"
  >("Nenhum");
  const [pendenteSort, setPendenteSort] = useState<
    "Nenhum" | "Mais Recente" | "Mais Antiga"
  >("Nenhum");
  const [precoMaximoReal, setPrecoMaximoReal] = useState(1000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  //Aplicação de filtro
  const aplicarFiltros = () => {
    setPrecoMaximo(pendentePreco);
    setRatingSort(pendenteRating);
    setSortType(pendenteSort);
  };

  useEffect(() => {
    let list = [...produtosOriginais];
    if (filtroAtivoId !== 0) {
      list = list.filter(
        (p) => Number(p.categoria_id) === Number(filtroAtivoId)
      );
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

  const calcularNota = (p: ProdutoParacard) => {
    if (!Array.isArray(p.avaliacoes) || p.avaliacoes.length === 0) return -1;

    const notas = p.avaliacoes
      .map((a: any) => a?.nota ?? a?.rating ?? a?.avaliacao ?? null)
      .filter((v: any) => typeof v === "number");

    if (notas.length === 0) return p.estoque;
    return notas.reduce((s: number, n: number) => s + n, 0) / notas.length;
  };

  useEffect(() => {
    api
      .get("/produto/categoria_pai/45")
      .then((res) => {
        console.log("Produtos recebidos:", res.data);
        setProdutosOriginais(res.data);
        setProdutos(res.data);
      })
      .catch((err) => console.error("Erro ao carregar Jogos:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtrarCategoria = (subId: number) => {
    // 1. ATUALIZA O ESTADO ATIVO: Isso fará com que o React renderize novamente todos os botões.
    setFiltroAtivoId(subId); // <-- Adicione esta linha

    console.log("Filtrando categoria:", subId);

    const filtrados = produtosOriginais.filter(
      (p) => subId === 0 || Number(p.categoria_id) === Number(subId)
    );

    console.log("Filtrados:", filtrados);

    setProdutos(filtrados);
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-65 bg-[#000000] text-white">
        <div className=" text-white">
          <h1 className="text-4xl leading-snug pl-45 pt-15 ">
            O UNIVERSO dos <strong className="font-bold">games</strong>,
          </h1>
          <h1 className="text-4xl leading-snug pl-70 pb-10">em um só lugar!</h1>
        </div>
        <div className=" h-full relative ml-8">
          <img
            src="/images/Mascote3.png"
            alt="Mascote"
            className=" w-130 h-130 object-contain pr-20"
          />
        </div>
      </div>

      <div className="relative z-10 bg-[#F6F3E4] h-full pl-10 pt-10">
        <div className="flex items-center justify-end pr-5 pb-5">
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
                  className={`transition-transform duration-300 ${
                    isFilterOpen ? "rotate-180" : ""
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
                      onChange={(e) => setPendentePreco(Number(e.target.value))}
                      className="w-full accent-[#982829]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#982829] mb-1">
                      Avaliação
                    </label>
                    <select
                      value={pendenteRating}
                      onChange={(e) => setPendenteRating(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
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
                      onChange={(e) => setPendenteSort(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
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
            className={`h-10 w-15 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${
              filtroAtivoId === 0
                ? "bg-[#982829] text-white font-bold  "
                : "text-[#982829] bg-white"
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => filtrarCategoria(46)}
            className={`h-10 w-25 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${
              filtroAtivoId === 46
                ? "bg-[#982829] text-white font-bold  "
                : "text-[#982829] bg-white"
            }`}
          >
            Eletrônicos
          </button>

          <button
            onClick={() => filtrarCategoria(47)}
            className={`h-10 w-24 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${
              filtroAtivoId === 47
                ? "bg-[#982829] text-white font-bold  "
                : "text-[#982829] bg-white"
            }`}
          >
            Tabuleiros
          </button>

          <button
            onClick={() => filtrarCategoria(48)}
            className={`h-10 w-20 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${
              filtroAtivoId === 48
                ? "bg-[#982829] text-white font-bold  "
                : "text-[#982829] bg-white"
            }`}
          >
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
                key={p.id}
                className="cursor-pointer"
                onClick={() => router.push(`/produto/${p.id}`)}
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
