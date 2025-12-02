"use client";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { useState } from "react";

interface BarraPesquisaProps {
    dadosOriginais: any[];                      
    setDadosFiltrados: (dados: any[]) => void; 
    chave: string | string[];  //permite a busca em um ou mais campos
    placeholder?: string;
    autoFilter?: boolean;
    className?: string;
    onSearch?: (termo: string) => void; 
}

export default function BarraPesquisa({
    dadosOriginais,
    setDadosFiltrados,
    chave,
    placeholder = "Pesquisar...",
    autoFilter = true,
    className = "",
    onSearch
}: BarraPesquisaProps) {

    const [texto, setTexto] = useState("");

    const chavesPesquisa = Array.isArray(chave) ? chave : [chave];

    const pegarValorAninhado = (obj: any, caminho: string) => {
        return caminho.split(".").reduce((acc, key) => acc?.[key], obj);
    };

    const filtrar = (valor: string) => {
        if (onSearch) {
            onSearch(valor);
            return;
        }

        const termo = valor.toLowerCase();

        const filtrado = dadosOriginais.filter((item) =>
            chavesPesquisa.some((ch) => {
                const valorCampo = pegarValorAninhado(item, ch);
                return String(valorCampo ?? "").toLowerCase().includes(termo);
            })
        );

        setDadosFiltrados(filtrado);
    };

    const handleChange = (value: string) => {
        setTexto(value);
        if (autoFilter || onSearch) filtrar(value); // Filtra enquanto digita, ou chama onSearch
    };
    
    const handleAction = () => {
        filtrar(texto); 
    };

    return (
        <div className={`flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2 ${className}`}>
            <input
                type="text"
                value={texto}
                placeholder={placeholder}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAction()} // Usa handleAction
                className="bg-transparent outline-none w-full h-full text-black px-2 
                           placeholder:text-[#982829] placeholder:text-sm"
            />

            <button
                onClick={handleAction} // Usa handleAction
                className="rounded-2xl px-4 py-2 hover:scale-105 cursor-pointer"
            >
                <FaMagnifyingGlass size={20} className="ml-2 text-[#982829]" />
            </button>
        </div>
    );
}