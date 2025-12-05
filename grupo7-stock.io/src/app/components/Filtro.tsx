"use client";

import { useState, useMemo } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';


interface BarraFiltroProps {
    onFilter: (categoriaId: number) => void; // Função de filtro que o pai (Home) fornecerá
    filtroAtivoId: number; // ID ativo para estilizar o botão
}

const CATEGORIAS = [
    { id: 0, nome: "Sem filtro" }, // ID 0 para mostrar todas as lojas
    { id: 1, nome: "Mercado" },
    { id: 2, nome: "Farmacia" },
    { id: 4, nome: "Cosméticos" }, // Usei 4 para Cosméticos, como no seu código original
    { id: 5, nome: "Moda" },
    { id: 7, nome: "Eletrônicos" },
    { id: 8, nome: "Jogos" },
    { id: 3, nome: "Brinquedos" }, // Usei 3
    { id: 6, nome: "Casa" }, // Usei 6
];

export default function BarraFiltro({onFilter, filtroAtivoId}: BarraFiltroProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen); // Inverte o valor atual de isOpen
    };

     const handleFilterClick = (id: number) => {
        onFilter(id); 
        setIsOpen(false); 
    };

    

    return(
        <div>
        <div className="w-130 h-12 p-2  bg-white text-[#982829] rounded-2xl flex cursor-pointer"
                        onClick={toggleMenu}>
            <h1 className='text-xl font-bold pl-4'>Filtros</h1>
            {isOpen ? <FaAngleUp className="ml-2 mt-1"/> : <FaAngleDown className="ml-2 mt-1"/>}
        </div>
        {isOpen && (
            <div className='position: absolute'>
            <div className="w-130 bg-white text-[#982829] mt-2 p-4 rounded-2xl shadow-lg">
                 {CATEGORIAS.map((categoria) => (
                            <button
                                key={categoria.id}
                                onClick={() => handleFilterClick(categoria.id)}
                                className={`
                                    block w-full text-left py-2 px-3 rounded-lg transition duration-200
                                    ${filtroAtivoId === categoria.id 
                                        ? 'bg-[#982829] text-white font-bold' // Estilo para filtro ativo
                                        : 'hover:bg-gray-100'
                                    }
                                `}
                            >
                                {categoria.nome}
                            </button>
                        ))}
            </div>

            
            </div>
        )}
        </div>
    );
}
    
