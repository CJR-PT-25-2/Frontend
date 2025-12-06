"use client";

import Navbar from "../components/navbar";
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
import Sticker_loja from "../components/sticker_loja";
import api from "@/lib/api";
import BarraPesquisa from "../components/barra_pesquisa";
import BarraFiltro from "../components/Filtro";



type LojaParacard = {
    id: number;
    nome: String;
    sticker_url: string;
    categoria: {
        id: number,
        nome: string
    } | null
}



export default function Home() {

    const router = useRouter();


    const [lojasOriginais, setLojasOriginais] = useState<LojaParacard[]>([]);

    const [lojasFiltradas, setLojasFiltradas] = useState<LojaParacard[]>([]);

    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeStoreFilterId, setActiveStoreFilterId] = useState<number>(0); 

    const [activeStoreCategory, setActiveStoreCategory] = useState<string>('Todas');

    const pegarValorAninhado = (obj: any, caminho: string) =>
        caminho.split(".").reduce((acc, key) => acc?.[key], obj);

    const handleUniversalSearch = (termo: string) => {

        const t = termo.toLowerCase();

        if (t.length === 0) {
            setIsSearching(false);
            setLojasFiltradas(lojasOriginais);
            return;
        }

        setIsSearching(true);

        const chavesProduto = ["nome", "Loja.nome"];
    

        const chavesLoja = ["nome", "categoria.nome"];
        const filtradasLojas = lojasOriginais.filter(l =>
            chavesLoja.some(ch => {
                const valor = pegarValorAninhado(l, ch);
                return String(valor ?? "").toLowerCase().includes(t);
            })
        );


        setLojasFiltradas(filtradasLojas);
    };

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



  

    useEffect(() => {

        const load = async () => {
            setLoading(true);
            const res = await api.get("/loja");
            setLojasOriginais(res.data);
            setLojasFiltradas(res.data);
            setLoading(false);
        };
        load();
    }, []);


    


    const renderLojas = (lista: LojaParacard[]) => (
        loading ? (
            <p>Carregando lojas...</p>
        ) : lista.length === 0 ? (
            <p>Nenhuma loja encontrada.</p>
        ) : (
            <div className="flex grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                    <h1 className="text-4xl font-bold pl-20 pt-15">VARIAS Possibilidades,</h1>
                    <h1 className="text-4xl font-bold pl-45 pb-10">em 1 so lugar!</h1>
                </div>

                <div className="h-full relative ml-8">
                    <img src="/images/Mascote1.png" className="w-130 h-130 object-contain pr-20" />
                </div>
            </div>

            <div className="relative z-10 bg-[#F6F3E4] pl-10 pt-10">
                <div className="pb-5 justify-end flex pr-5 ">
                                         <BarraFiltro 
                                            onFilter={handleStoreCategoryFilter} 
                                            filtroAtivoId={activeStoreFilterId}
                                        />
                                    </div>
                <div className="flex items-center justify-end pr-5 pb-5">
                    <div className="flex text-[#982829] rounded-2xl w-130 h-12 p-2">
                        <BarraPesquisa
                            dadosOriginais={[]} setDadosFiltrados={() => {}}
                            chave={["nome"]}
                            placeholder="Pesquisar por lojas..."
                            autoFilter={true} onSearch={handleUniversalSearch}
                        />
                    </div>
                </div>

                {isSearching ? (
                    <>
                        <h1 className="text-2xl font-bold text-black pt-3">Resultados</h1>


                        <h1 className="text-2xl font-bold text-black pt-10">Lojas Encontradas</h1>
                        {renderLojas(lojasFiltradas)}
                    </>
                ) : (
                <>

                    <h1 className="pt-10 text-xl text-black font-bold">Lojas</h1>
                    {renderLojas(lojasFiltradas)}
                </>
                )}

            </div>
        </>
    );
}
