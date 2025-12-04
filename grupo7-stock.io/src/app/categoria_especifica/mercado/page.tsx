"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import api from "@/lib/api";
import BarraPesquisa from "@/app/components/barra_pesquisa";


interface Produto {
    id: number;
    nome: string;
    preco: number;
    categoria_id: number;

    Imagems_produto_URL: string | null;
    imagem1_url: string | null;
    imagem2_url: string | null;
    imagem3_url: string | null;
    imagem4_url: string | null;
}



export default function FeedPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [produtosOriginais, setProdutosOriginais] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroAtivoId, setFiltroAtivoId] = useState(0);

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

    

    const getImagemProduto = (p: Produto) => {
        return (
            p.Imagems_produto_URL ??
            p.imagem1_url ??
            p.imagem2_url ??
            p.imagem3_url ??
            p.imagem4_url ??
            "/images/sem-imagem.png"
        );
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

            <div className="relative z-10 bg-[#F6F3E4] h-300 pl-10 pt-10">
                <div className="flex items-center justify-end pr-5 pb-5">
                    <BarraPesquisa
                        dadosOriginais={produtosOriginais}
                        setDadosFiltrados={setProdutos}
                        chave="nome"
                        placeholder="Buscar produtos..."
                    />
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
                        className={`h-10 w-23  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 7   ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
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
                                key={p.id}
                                className="bg-white p-4 rounded-xl shadow-md hover:scale-105 transition"
                            >
                                <img
                                    src={getImagemProduto(p)}
                                    className="w-full h-40 object-cover rounded-lg"
                                />

                                <p className="mt-2 font-bold">{p.nome}</p>

                                <p className="font-bold text-[#982829] mt-1">
                                    R$ {Number(p.preco).toFixed(2)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
