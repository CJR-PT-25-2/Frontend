"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import api from "@/lib/api";
import { FaMagnifyingGlass } from "react-icons/fa6";

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
    const [pesquisa, setPesquisa] = useState("");
    const [filtroAtivoId, setFiltroAtivoId] = useState(0);

    useEffect(() => {
        api
            .get("/produto/categoria_pai/15")
            .then((res) => {
                setProdutosOriginais(res.data);
                setProdutos(res.data);
            })
            .catch((err) => console.error("Erro ao carregar Brinquedos:", err))
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

    const filtrarPorNome = (termo: string) => {
        const texto = termo.toLowerCase();

        const filtrados = produtosOriginais.filter((p) =>
            p.nome.toLowerCase().includes(texto)
        );

        setProdutos(filtrados);
    };

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
                <div className="text-white text-right pr-5">
                    <h1 className="text-4xl leading-snug pt-15">
                        O UNIVERSO da <strong className="font-bold">imaginação</strong>,
                    </h1>
                    <h1 className="text-4xl leading-snug pb-10">
                        em um só lugar!
                    </h1>
                </div>

                <div className="h-full relative ml-2">
                    <img
                        src="/images/Mascote2.png"
                        alt="Mascote"
                        className="w-140 h-140 object-contain pr-20"
                    />
                </div>
            </div>

            <div className="relative z-10 bg-[#F6F3E4] h-300 pl-10 pt-10">

                {/* Barra de Pesquisa */}
                <div className="flex items-center justify-end pr-5 pb-5">
                    <div className="flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2">
                        <input
                            type="text"
                            placeholder="Procurar por..."
                            value={pesquisa}
                            onChange={(e) => {
                                setPesquisa(e.target.value);
                                filtrarPorNome(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") filtrarPorNome(pesquisa);
                            }}
                            className="bg-transparent outline-none w-full h-full text-black px-2 placeholder:text-[#982829] placeholder:text-sm"
                        />
                        <button
                            onClick={() => filtrarPorNome(pesquisa)}
                            className="text-white rounded-2xl px-4 py-2 hover:scale-105 cursor-pointer"
                        >
                            <FaMagnifyingGlass size={20} className="ml-2 text-[#982829]" />
                        </button>
                    </div>
                </div>

                {/* Categorias */}
                <div className="flex space-x-8 items-center overflow-x-auto whitespace-nowrap">
                    <button
                        onClick={() => filtrarCategoria(0)}
                        className={`h-10 w-15 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 0 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Todos
                    </button>

                    <button
                        onClick={() => filtrarCategoria(16)}
                        className={`h-10 w-18 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 16 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Boneca
                    </button>

                    <button
                        onClick={() => filtrarCategoria(17)}
                        className={`h-10 w-22 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 17 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Carrinho
                    </button>

                    <button
                        onClick={() => filtrarCategoria(18)}
                        className={`h-10 w-20 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 18 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Legos
                    </button>

                    <button
                        onClick={() => filtrarCategoria(19)}
                        className={`h-10 w-24 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 19 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Pelúcias
                    </button>

                    <button
                        onClick={() => filtrarCategoria(20)}
                        className={`h-10 w-20 rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 20 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
                        Outros
                    </button>
                </div>

                {/* Produtos */}
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