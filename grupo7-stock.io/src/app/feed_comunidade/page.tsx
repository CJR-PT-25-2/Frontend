"use client";

import Navbar from "../components/navbar";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import ModalUsuario from "../components/Moldal_usuario";
import BarraPesquisa from "../components/barra_pesquisa";

type UsuarioParacard = {
    id: number;
    nome: String;
    foto_perfil_URL?: string;
}

const Itens_por_pagina = 20;


export default function Feed_comunidade() {

    const router = useRouter();

    const [Usuarios, setUsuarios] = useState<UsuarioParacard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [UsuariosOriginais, setUsuariosOriginais] = useState<UsuarioParacard[]>([]);



    const renderPaginationButtons = () => {

        if (totalPages <= 1) return null;
        const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <div className="flex justify-center space-x-2 my-8">
                {/* Botão Anterior */}
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2  ${currentPage === 1 ? 'text-gray-400' : 'text-black hover:bg-[#982829]  hover:scale-105 cursor-pointer'}`}
                >
                    &lt;
                </button>

                {/* Números das Páginas */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`p-2 transition-all  cursor-pointer ${page === currentPage
                                ? 'bg-[#982829] text-white font-bold'
                                : ' text-gray-700 hover:bg-[#982829] hover:scale-105 hover:text-white'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Botão Próximo */}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2  ${currentPage === totalPages ? 'text-gray-400' : 'text-black hover:bg-[#982829] hover:scale-105 cursor-pointer'}`}
                >
                    &gt;
                </button>
            </div>
        );
    };

    const fetchUsuarios = async (page: number, setFunction: React.Dispatch<React.SetStateAction<UsuarioParacard[]>>, setTotalPages: React.Dispatch<React.SetStateAction<number>>) => {
        try {
            const response = await api.get(`/user`, {
                params: {
                    page: page,
                    limit: Itens_por_pagina,
                }
            });

            setFunction(response.data.data); // Define a lista de usuarios 
            setUsuariosOriginais(response.data.data);
            setTotalPages(response.data.meta.totalPages);
        } catch (err) {
            console.error(`Erro ao buscar usuarios`, err);
            setError(`Erro ao buscar usuarios`);

        }
    };

    useEffect(() => {
        const loadprodutosGeral = async () => {
            setLoading(true);

            await fetchUsuarios(currentPage,
                setUsuarios,
                setTotalPages

            );
            setLoading(false);
        };
        loadprodutosGeral();
    }, [currentPage]);

    const renderProdutosGerais = ( usuarios: UsuarioParacard[]) => (
        <div className="pt-5">
                    {loading ? (
                        <p className="text-black">Carregando usuarios...</p>
                    ) : usuarios.length === 0 ? (
                        <p className="text-black">Nenhum usuario encontrado.</p>
                    ) : (
                        <div className="grid grid-clos-2 sm-grid-cols-3 lg:grid-cols-5 xl-grid-cols-6  gap-4 p-4">
                            <h1 className="text-2xl font-bold text-black mb-4 col-span-full">Usuarios da Comunidade</h1>
                            {usuarios.map((usuario) => (
                                <ModalUsuario
                                    key={usuario.id}
                                    id={usuario.id}
                                    nome={String(usuario.name)}
                                    Foto_Perfil_URL={usuario.foto_perfil_URL}
                                />
                            ))}
                        </div>
                    )}
                </div>
    );
   


    return (
        <div>
            <Navbar />
            <div className="flex justify-center items-center h-60 bg-[#000000] text-white">
                <div>
                    <h1 className="text-4xl font-bold pl-20 pt-15">CONHEÇA novas ideias,</h1>
                    <h1 className="text-4xl font-bold pl-45 pb-10">em 1 so lugar!</h1>
                </div>

                <div className="h-full relative ml-8">
                    <img src="/images/Mascote4.png" className="w-130 h-130 object-contain pr-20" />
                </div>

            </div>
            <div className=" relative z-10 bg-[#F6F3E4] h-full  pl-10 pt-10 ">
                <div className="flex items-center justify-end pr-10 pb-5">
                    <BarraPesquisa
                        dadosOriginais={UsuariosOriginais}
                        setDadosFiltrados={setUsuarios}
                        chave="name"
                        placeholder="Buscar usuários..."
                    />
                </div>


                {renderProdutosGerais(Usuarios)}
                {renderPaginationButtons()}
            </div>
        </div>
    )

}



