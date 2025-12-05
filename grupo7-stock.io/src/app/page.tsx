"use client";

import Navbar from "../app/components/navbar";
import {useState, useEffect} from "react";
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

type ProdutoParacard = {
    id: number;
    nome: string;
    preco: number;
    Imagems_produto_URL: string;
    estoque: number;
    Loja: {
      sticker_url : string;
      nome: string;
    }
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
    

    const [lojasOriginais, setLojasOriginais] = useState<LojaParacard[]>([]);

    const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoParacard[]>([]);
    const [lojasFiltradas, setLojasFiltradas] = useState<LojaParacard[]>([]);

    const [activeStoreFilterId, setActiveStoreFilterId] = useState<number>(0); 

    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);

    // barra de filtro de categorias - loja
    const [activeStoreCategory, setActiveStoreCategory] = useState<string>('Todas');

    const pegarValorAninhado = (obj: any, caminho: string) =>
        caminho.split(".").reduce((acc, key) => acc?.[key], obj);

     const handleStoreCategoryFilter = (id: number) => {
        setActiveStoreFilterId(id); // Atualiza o estado para destacar o botão no BarraFiltro

        if (id === 0) {
            setLojasFiltradas(lojasOriginais); // Sem filtro, mostra tudo
            return;
        }

        const filtradas = lojasOriginais.filter(loja => 
            loja.categoria && loja.categoria.id === id
        );

        setLojasFiltradas(filtradas); // Atualiza a lista exibida de lojas
    };

    const handleUniversalSearch = (termo: string) => {

        const t = termo.toLowerCase();

        if (t.length === 0) {
            setIsSearching(false);
            setProdutosFiltrados(todosProdutos);
            setLojasFiltradas(lojasOriginais);
            return;
        }

        setIsSearching(true);

        const chavesProduto = ["nome", "Loja.nome"];
        const filtradosProdutos = todosProdutos.filter(p =>
            chavesProduto.some(ch => {
                const valor = pegarValorAninhado(p, ch);
                return String(valor ?? "").toLowerCase().includes(t);
            })
        );

        const chavesLoja = ["nome", "categoria.nome"];
        const filtradasLojas = lojasOriginais.filter(l =>
            chavesLoja.some(ch => {
                const valor = pegarValorAninhado(l, ch);
                return String(valor ?? "").toLowerCase().includes(t);
            })
        );

        setProdutosFiltrados(filtradosProdutos);
        setLojasFiltradas(filtradasLojas);
    };


    useEffect(() => {
        const load = async () => {
            setLoading(true);

            const res1 = await api.get(`/produto/categoria_pai/${Categoria_id_Casa}`);
            const res2 = await api.get(`/produto/categoria_pai/${Categoria_id_Jogos}`);
            const res3 = await api.get(`/produto/categoria_pai/${Categoria_id_Mercado}`);
            const res4 = await api.get(`/produto/categoria_pai/${Categoria_id_Eletronicos}`);
            const res5 = await api.get(`/produto/categoria_pai/${Categoria_id_Moda}`);
            const res6 = await api.get(`/produto/categoria_pai/${Categoria_id_Beleza}`);
            const res7 = await api.get(`/produto/categoria_pai/${Categoria_id_Brinquedos}`);
            const res8 = await api.get(`/produto/categoria_pai/${Categoria_id_Farmacia}`);
            const res9 = await api.get(`/produto/categoria_pai/${Categoria_id_Outros}`);
            const todos = [...res1.data, ...res2.data];

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
            setProdutosFiltrados(todos);

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

const renderProdutos = (titulo: string, lista: ProdutoParacard[]) => (
    <div className="pt-5">
        <h1 className="text-xl text-black font-bold mb-4">{titulo}</h1>

        {loading ? (
            <p>Carregando...</p>
        ) : lista.length === 0 ? (
            <p>Nenhum item encontrado.</p>
        ) : (
            <>

            {lista.length > 5 && (
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
                    {/* <div className="flex flex-row gap-4 p-4"> */}
                    {lista.slice(0, 6).map(produto => (
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
    const renderLojas = (lista: LojaParacard[]) => (
    loading ? (
        <p>Carregando lojas...</p>
    ) : lista.length === 0 ? (
        <p>Nenhuma loja encontrada...</p>
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
                    <h1 className="text-4xl font-bold pl-20 pt-15">Do CAOS à organização,</h1>
                    <h1 className="text-4xl font-bold pl-45 pb-10">em alguns cliques!</h1>
                </div>

                <div className="h-full relative ml-8">
                    <img src="/images/Mascote1.png" className="w-130 h-130 object-contain pr-20" />
                </div>
            </div>

            <div className="relative z-10 bg-[#F6F3E4] pl-10 pt-10 min-h-400">

                <div className="flex items-center justify-end pr-5 pb-5">
                    <div className="flex text-[#982829] rounded-2xl w-130 h-12 p-2">
                        <BarraPesquisa
                            dadosOriginais={[]} setDadosFiltrados={() => {}}
                            chave={["nome"]}
                            placeholder="Pesquisar produtos, lojas e categorias..."
                            autoFilter={true} onSearch={handleUniversalSearch}
                        />
                    </div>
                </div>

                {isSearching ? (
                    <>
                        <h1 className="text-2xl font-bold text-black pt-3">Resultados</h1>

                        {renderProdutos("Produtos Encontrados", produtosFiltrados)}

                        <h1 className="text-2xl font-bold pt-10">Lojas Encontradas</h1>
                        {renderLojas(lojasFiltradas)}

                        {produtosFiltrados.length === 0 && lojasFiltradas.length === 0 && (
                            <h1 className="text-xl text-black font-bold pt-5">Nenhum resultado encontrado.</h1>
                        )}
                    </>
                ) : (
                <>
                    <h1 className="text-black font-bold text-xl"> Categorias </h1>

                    <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-15">
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



                    <h1 className="pt-10 text-black text-xl font-bold ">Lojas</h1>
                     <div className="pb-5 justify-end flex pr-5 ">
                         <BarraFiltro 
                            onFilter={handleStoreCategoryFilter} 
                            filtroAtivoId={activeStoreFilterId}
                        />
                    </div>
                     {renderLojas(lojasFiltradas)}
                </>
                )}

            </div>
        </>
    );
}