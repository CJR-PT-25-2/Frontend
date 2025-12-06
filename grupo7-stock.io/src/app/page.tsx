"use client";

import Navbar from "../app/components/navbar";
import { useState, useEffect } from "react";
import { GiFruitBowl } from "react-icons/gi";
import { GiMedicinePills } from "react-icons/gi";
import { GiLipstick } from "react-icons/gi";
import { GiLargeDress } from "react-icons/gi";
import { FaLaptop } from "react-icons/fa";
import { IoGameControllerSharp } from "react-icons/io5";
import { TbHorseToy } from "react-icons/tb";
import { FaHouseChimneyWindow } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Caixa_prod from "../app/components/caixinha_produto";
import Sticker_loja from "./components/sticker_loja";
import api from "@/lib/api";
import BarraPesquisa from "./components/barra_pesquisa";
import BarraFiltro from "./components/Filtro";
import { FaBox } from "react-icons/fa6";

type ProdutoParacard = {
    id: number;
    nome: string;
    preco: number;
    Imagems_produto_URL: string;
    estoque: number;
    Loja: {
        sticker_url: string;
        nome: string;
    }
    avaliacoes?: any[];
}

type LojaParacard = {
    id: number;
    nome: String;
    sticker_url: string;
    categoria: {
        id: number,
        nome: string
    } | null
}

const Categoria_id_Casa = 33;
const Categoria_id_Jogos = 45;
const Categoria_id_Mercado = 1;
const Categoria_id_Eletronicos = 39;
const Categoria_id_Moda = 27;
const Categoria_id_Beleza = 21;
const Categoria_id_Brinquedos = 15;
const Categoria_id_Farmacia = 10;
const Categoria_id_Outros = 49;

export default function Home() {

    const router = useRouter();

    const [produtosCasa, setProdutosCasa] = useState<ProdutoParacard[]>([]);
    const [produtosJogos, setProdutosJogos] = useState<ProdutoParacard[]>([]);
    const [produtosMercado, setProdutosMercado] = useState<ProdutoParacard[]>([]);
    const [produtosBeleza, setProdutosBeleza] = useState<ProdutoParacard[]>([]);
    const [produtosBrinquedos, setProdutosBrinquedos] = useState<ProdutoParacard[]>([]);
    const [produtosEletronicos, setProdutosEletronicos] = useState<ProdutoParacard[]>([]);
    const [produtosFarmacia, setProdutosFarmacia] = useState<ProdutoParacard[]>([]);
    const [produtosModa, setProdutosModa] = useState<ProdutoParacard[]>([]);
    const [produtosOutros, setProdutosOutros] = useState<ProdutoParacard[]>([]);
    const [todosProdutos, setTodosProdutos] = useState<ProdutoParacard[]>([]);


    const [searchTerm, setSearchTerm] = useState("");
    const [lojasOriginais, setLojasOriginais] = useState<LojaParacard[]>([]);

    const [gerarprodutosFiltrados, setGerarProdutosFiltrados] = useState<ProdutoParacard[]>([]);
    const [lojasFiltradas, setLojasFiltradas] = useState<LojaParacard[]>([]);

    const [activeStoreFilterId, setActiveStoreFilterId] = useState<number>(0);

    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);


    const [precoMaximo, setPrecoMaximo] = useState(1000);
    const [ratingSort, setRatingSort] = useState<"Nenhum" | "Melhor" | "Pior">("Nenhum");
    const [sortType, setSortType] = useState<"Nenhum" | "Mais Recente" | "Mais Antiga">("Nenhum");
    const [pendentePreco, setPendentePreco] = useState(1000);
    const [pendenteRating, setPendenteRating] = useState<"Nenhum" | "Melhor" | "Pior">("Nenhum");
    const [pendenteSort, setPendenteSort] = useState<"Nenhum" | "Mais Recente" | "Mais Antiga">("Nenhum");
    const [precoMaximoReal, setPrecoMaximoReal] = useState(1000);
    const [isFilterOpen, setIsFilterOpen] = useState(false);


    const aplicarFiltros = () => {
        setPrecoMaximo(pendentePreco);
        setRatingSort(pendenteRating);
        setSortType(pendenteSort);
    };


    const calcularNota = (p: ProdutoParacard) => {
        if (!Array.isArray(p.avaliacoes) || p.avaliacoes.length === 0)
            return null;

        const notas = p.avaliacoes
            .map(a => a?.nota ?? a?.rating ?? a?.avaliacao ?? null)
            .filter(v => typeof v === "number");

        if (notas.length === 0) return null;

        return notas.reduce((s, n) => s + n, 0) / notas.length;
    };


    const applyFiltersAndSorting = (list: ProdutoParacard[]): ProdutoParacard[] => {
        let filteredList = [...list];


        filteredList = filteredList.filter((p) => p.preco <= precoMaximo);


        if (ratingSort === "Melhor") {
            filteredList.sort((a, b) => {
                const notaA = calcularNota(a);
                const notaB = calcularNota(b);

                if (notaB === null && notaA === null) return 0;
                if (notaB === null) return -1; // sem avaliação → vai pro fim
                if (notaA === null) return 1;

                return notaB - notaA; // maior nota primeiro
            });
        }
        else if (ratingSort === "Pior") {
            filteredList.sort((a, b) => {
                const notaA = calcularNota(a);
                const notaB = calcularNota(b);

                if (notaA === null && notaB === null) return 0;
                if (notaA === null) return -1; // sem avaliação → vai pro começo
                if (notaB === null) return 1;

                return notaA - notaB; // menor nota primeiro
            });
        }




        if (sortType === "Mais Recente") {
            filteredList.sort((a, b) => b.id - a.id);
        } else if (sortType === "Mais Antiga") {
            filteredList.sort((a, b) => a.id - b.id);
        }

        return filteredList;
    };


    const pegarValorAninhado = (obj: any, caminho: string) =>
        caminho.split(".").reduce((acc, key) => acc?.[key], obj);

    const handleStoreCategoryFilter = (id: number) => {
        setActiveStoreFilterId(id);

        if (id === 0) {
            setLojasFiltradas(lojasOriginais);
            return;
        }

        const filtradas = lojasOriginais.filter(loja =>
            loja.categoria && loja.categoria.id === id
        );

        setLojasFiltradas(filtradas);
    };

    const handleUniversalSearch = (termo: string) => {
        const t = termo.toLowerCase();

        if (t.length === 0) {
            setIsSearching(false);
            setGerarProdutosFiltrados(todosProdutos);
            setLojasFiltradas(lojasOriginais);
            return;
        }

        setIsSearching(true);

        const chavesProduto = ["nome", "Loja.nome"];
        const produtosComTermoDeBusca = todosProdutos.filter(p =>
            chavesProduto.some(ch => {
                const valor = pegarValorAninhado(p, ch);
                return String(valor ?? "").toLowerCase().includes(t);
            })
        );


        const produtosFinaisFiltrados = applyFiltersAndSorting(produtosComTermoDeBusca);

        const chavesLoja = ["nome", "categoria.nome"];
        const filtradasLojas = lojasOriginais.filter(l =>
            chavesLoja.some(ch => {
                const valor = pegarValorAninhado(l, ch);
                return String(valor ?? "").toLowerCase().includes(t);
            })
        );

        setGerarProdutosFiltrados(produtosFinaisFiltrados);
        setLojasFiltradas(filtradasLojas);
    };


    useEffect(() => {
        const load = async () => {
            setLoading(true);


            const [res1, res2, res3, res4, res5, res6, res7, res8, res9] = await Promise.all([
                api.get(`/produto/categoria_pai/${Categoria_id_Casa}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Jogos}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Mercado}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Eletronicos}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Moda}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Beleza}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Brinquedos}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Farmacia}`),
                api.get(`/produto/categoria_pai/${Categoria_id_Outros}`)
            ]);


            const todos = [
                ...res1.data,
                ...res2.data,
                ...res3.data,
                ...res4.data,
                ...res5.data,
                ...res6.data,
                ...res7.data,
                ...res8.data,
                ...res9.data
            ];

            setProdutosCasa(res1.data);
            setProdutosJogos(res2.data);
            setProdutosMercado(res3.data);
            setProdutosEletronicos(res4.data);
            setProdutosModa(res5.data);
            setProdutosBeleza(res6.data);
            setProdutosBrinquedos(res7.data);
            setProdutosFarmacia(res8.data);
            setProdutosOutros(res9.data);

            setTodosProdutos(todos);
            setGerarProdutosFiltrados(todos);


            const max = Math.max(...todos.map((p: any) => p.preco || 0), 1000);
            setPrecoMaximoReal(max);
            setPrecoMaximo(max);
            setPendentePreco(max);

            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        const load = async () => {
            const res = await api.get("/loja");
            setLojasOriginais(res.data);
            setLojasFiltradas(res.data);
            setLoading(false);
        };
        load();
    }, []);


    useEffect(() => {
        if (isSearching) {
            handleUniversalSearch(searchTerm);
        }
    }, [precoMaximo, ratingSort, sortType]);


    const renderProdutos = (titulo: string, lista: ProdutoParacard[]) => {

        let listaParaRenderizar = lista;


        if (!isSearching) {
            listaParaRenderizar = applyFiltersAndSorting(lista);
        } else {

            listaParaRenderizar = lista;
        }

        return (
            <div className="pt-5">
                <h1 className="text-xl text-black font-bold mb-4">{titulo}</h1>

                {loading ? (
                    <p>Carregando...</p>
                ) : listaParaRenderizar.length === 0 ? (
                    <p className="text-black">Nenhum item encontrado</p>
                ) : (
                    <>

                        {listaParaRenderizar.length > 5 && (
                            <div className="flex justify-end pr-4 ">
                                <button
                                    className="text-[#982829] mt-2 ml-4 cursor-pointer"
                                    onClick={() => {
                                        const map: any = {
                                            "Produtos de Casa": "casa",
                                            "Produtos de Jogos": "jogos",
                                            "Produtos de Mercado": "mercado",
                                            "Produtos de Moda": "moda",
                                            "Produtos de Beleza": "cosmeticos",
                                            "Produtos de Farmácia": "remedio",
                                            "Produtos de Brinquedos": "brinquedos",
                                            "Produtos de Eletrônicos": "eletronicos",
                                            "Outros Produtos": "outros"
                                        };
                                        router.push(`../categoria_especifica/${map[titulo]}`);
                                    }}
                                >
                                    Ver mais
                                </button>
                            </div>
                        )}
                        <div className="flex overflow-hidden whitespace-nowrap p-4 space-x-4">
                            {listaParaRenderizar.slice(0, 6).map(produto => (
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

                    </>
                )}
            </div>
        );
    }

    const renderLojas = (lista: LojaParacard[]) => (
        loading ? (
            <p>Carregando lojas...</p>
        ) : lista.length === 0 ? (
            <p className="text-black">Nenhuma loja encontrada...</p>
        ) : (
            <div className="flex justify-start overflow-x-auto whitespace-nowrap p-4 space-x-4">
                {lista.map(loja => (
                    <Sticker_loja
                        key={loja.id}
                        id={loja.id}
                        nome={String(loja.nome)}
                        categoria={String(loja.categoria?.nome || "")}
                        descricao=""
                        sticker_URL={loja.sticker_url}
                    />
                ))}
            </div>
        )
    );

    return (
        <>
            <Navbar />

            <div className="flex justify-center items-center h-60 bg-[#000000] text-white">
                <div>
                    <h1 className="text-4xl pl-20 pt-15">Do CAOS à organização,</h1>
                    <h1 className="text-4xl pl-45 pb-10">em alguns cliques!</h1>
                </div>

                <div className="h-full relative ml-8">
                    <img src="/images/Mascote1.png" className="w-130 h-130 object-contain pr-20" />
                </div>
            </div>

            <div className="relative z-10 bg-[#F6F3E4] pl-10 pt-10 min-h-400">

                <div className="flex flex-col items-end pr-5 pb-5">

                    {/* BARRA DE PESQUISA */}
                    <div className="flex text-[#982829] rounded-2xl w-130 h-12 p-2 mb-4">
                        <BarraPesquisa
                            dadosOriginais={[]} setDadosFiltrados={() => { }}
                            chave={["nome"]}
                            placeholder="Pesquisar produtos, lojas e categorias..."
                            autoFilter={true} onSearch={handleUniversalSearch}
                        />
                    </div>

                    {/* AQUI OH FILTRO */}
                    <div className="relative w-128">

                        <button
                            className="flex justify-between items-center w-full bg-white p-4 rounded-xl shadow-md border border-gray-200 text-base text-[#982829]"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            Filtros
                            <FaAngleDown
                                className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute top-full right-0 w-full bg-white border border-gray-300 shadow-lg rounded-xl p-4 mt-2 z-50 space-y-3">

                                <div>
                                    <label className="block text-sm text-[#982829] mb-1">
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


                                {/* SELEÇÃO DE AVALIAÇÃO */}
                                <div>
                                    <label className="block text-sm text-[#982829] mb-1">
                                        Avaliação
                                    </label>
                                    <select
                                        value={pendenteRating}
                                        onChange={(e) =>
                                            setPendenteRating(e.target.value as any)
                                        }
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
                                    >
                                        <option value="Nenhum">Padrão</option>
                                        <option value="Melhor">Melhor Avaliados</option>
                                        <option value="Pior">Pior Avaliados</option>
                                    </select>
                                </div>

                                {/* SELEÇÃO DE ORDENAÇÃO */}
                                <div>
                                    <label className="block text-sm text-[#982829] mb-1">
                                        Ordenar por Adição
                                    </label>
                                    <select
                                        value={pendenteSort}
                                        onChange={(e) =>
                                            setPendenteSort(e.target.value as any)
                                        }
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
                                    >
                                        <option value="Nenhum">Padrão</option>
                                        <option value="Mais Recente">Mais Recente</option>
                                        <option value="Mais Antiga">Mais Antiga</option>
                                    </select>
                                </div>

                                {/* BOTÃO APLICAR */}
                                <button
                                    className="w-full bg-[#982829] text-white py-1.5 px-3 rounded-lg hover:scale-105 transition text-sm"
                                    onClick={() => {
                                        aplicarFiltros();
                                        setIsFilterOpen(false);
                                    }}
                                >
                                    Aplicar Filtros
                                </button>

                                {/* BOTÃO LIMPAR */}
                                <button
                                    className="w-full bg-gray-300 text-black py-1.5 px-3 rounded-lg hover:scale-105 transition text-sm"
                                    onClick={() => {
                                        setPendentePreco(precoMaximoReal);
                                        setPendenteRating("Nenhum");
                                        setPendenteSort("Nenhum");

                                        setPrecoMaximo(precoMaximoReal);
                                        setRatingSort("Nenhum");
                                        setSortType("Nenhum");

                                        setIsFilterOpen(false);
                                    }}
                                >
                                    Limpar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* AQUI TERMINA O BLOCO DE PESQUISA/FILTRO */}
                {isSearching ? (
                    <>
                        <h1 className="text-2xl text-black pt-3">Resultados</h1>

                        {renderProdutos("Produtos Encontrados", gerarprodutosFiltrados)}

                        <h1 className="text-2xl pt-10">Lojas Encontradas</h1>
                        {renderLojas(lojasFiltradas)}

                        {gerarprodutosFiltrados.length === 0 && lojasFiltradas.length === 0 && (
                            <h1 className="text-xl text-black pt-5">Nenhum resultado encontrado.</h1>
                        )}
                    </>
                ) : (
                    <>
                        <h1 className="text-black text-2xl font-bold"> Categorias </h1>

                        <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-10">
                            <button onClick={() => router.push('../categoria_especifica/mercado')} className=" cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <GiFruitBowl size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Mercado</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/remedio')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <GiMedicinePills size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black  mt-1">Remédios</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/cosmeticos')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <GiLipstick size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Cosméticos</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/moda')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <GiLargeDress size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Moda</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/eletronicos')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <FaLaptop size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Eletrônicos</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/jogos')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <IoGameControllerSharp size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Jogos</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/brinquedos')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <TbHorseToy size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Brinquedos</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/casa')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <FaHouseChimneyWindow size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Casa</p>
                            </button>

                            <button onClick={() => router.push('../categoria_especifica/outros')} className="cursor-pointer h-25 w-25 bg-white rounded-2xl hover:scale-105">
                                <FaBox size={40} className="mx-auto mt-2 text-[#982829]" />
                                <p className="text-sm text-center text-black mt-1">Outros</p>
                            </button>
                        </div>
                        

                        {renderProdutos("Produtos de Mercado", produtosMercado)}
                        {renderProdutos("Produtos de Farmácia", produtosFarmacia)}
                        {renderProdutos("Produtos de Beleza", produtosBeleza)}
                        {renderProdutos("Produtos de Moda", produtosModa)}
                        {renderProdutos("Produtos de Eletrônicos", produtosEletronicos)}
                        {renderProdutos("Produtos de Jogos", produtosJogos)}
                        {renderProdutos("Produtos de Brinquedos", produtosBrinquedos)}
                        {renderProdutos("Produtos de Casa", produtosCasa)}
                        {renderProdutos("Outros Produtos", produtosOutros)}



                        <h1 className="pt-10 text-black text-2xl font-bold">Lojas</h1>
                        <div className="pb-5 justify-end flex pr-5 ">
                            <BarraFiltro
                                onFilter={handleStoreCategoryFilter}
                                filtroAtivoId={activeStoreFilterId}
                            />
                        </div>
                        {renderLojas(lojasFiltradas)}
                    </>
                )}

                {/* AQUI TERMINA O CONTEÚDO DA DIV bg-[#F6F3E4] */}
            </div>

        </>
    );
}