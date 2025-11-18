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
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Caixa_prod from "../app/components/caixinha_produto";
import api from "@/lib/api";

type ProdutoParacard = {
    id: number;
    nome: string;
    preco: number;
    Imagems_produto_URL: string;
    estoque: number;
    sticker_url ?: string;

}

const Categoria_id_Casa = 1;
const Categoria_id_Jogos = 2;

export default function Home() {

    const router = useRouter();
    const [produtosCasa, setProdutosCasa] = useState<ProdutoParacard[]>([]);
    const [produtosJogos, setProdutosJogos] = useState<ProdutoParacard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProdutosPorCategoriaPai = async (id: number, setFunction: React.Dispatch<React.SetStateAction<ProdutoParacard[]>>, categoriaNome: string) => {
        try {
          const response = await api.get(`/produto/categoria_pai/${id}`); 
            setFunction(response.data);
        } catch (err) {
          console.error(`Erro ao buscar produtos da categoria ${categoriaNome}:`, err);
          setError(`Erro ao buscar produtos da categoria ${categoriaNome}`);
        }
      };

    useEffect(() => {
        const loadprodutos = async () => {
            setLoading(true);
            setLoading(false);
            await fetchProdutosPorCategoriaPai(Categoria_id_Casa, setProdutosCasa, "Casa");
            await fetchProdutosPorCategoriaPai(Categoria_id_Jogos, setProdutosJogos, "Jogos");
          setLoading(false);
        };
        loadprodutos();
    } , []);

    const renderProdutos = (titulo: string, produtos: ProdutoParacard[]) => (
        <div className="pt-5">
            <h1 className="text-2xl font-bold mb-4">{titulo}</h1>
            {loading ? (
                <p>Carregando produtos...</p>
            ) : produtos.length === 0 ? (
                <p>Nenhum produto de {titulo} encontrado.</p>
            ) : (
                <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4">
                    {produtos.map((produto) => (
                        <Caixa_prod 
                            key={produto.id}
                            id={produto.id}
                            nome={produto.nome}
                            preco={produto.preco}     
                            imagemUrl={produto.Imagems_produto_URL} 
                            quantidade ={produto.estoque}
                            // Adicionamos LojaURL usando o sticker_url se existir
                            lojaURL={produto.sticker_url || undefined} 
                            disponivel={produto.estoque > 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
    return (
        <>
        <Navbar />
        <div className="flex justify-center items-center h-60 bg-[#000000] text-white">
           <div className=" text-white">
             <h1 className="text-4xl font-bold leading-snug pl-20 pt-15 ">
                  Do CAOS à organização,
             </h1>
             <h1 className="text-4xl font-bold leading-snug pl-45 pb-10">
                em alguns cliques!
             </h1>   
           </div>
           <div className=" h-full relative ml-8">
                 <img src="/images/Mascote1.png" alt ="Mascote" className = " w-130 h-130 object-contain pr-20"/>
           </div>
           
        </div> 
        <div className=" relative z-10 bg-[#F6F3E4] h-300  pl-10 pt-10 ">
          <div className="  text-2xl font-
League Spartan text-black">
            <div className=" flex items-center justify-end pr-5 pb-5">
              <div className="flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2">
              <input
                type = "text"
                placeholder="Procurar por..."
                className=" bg-transparent outline-none w-full h-full text-black px-2
                            placeholder: text-[#982829] 
                            placeholder: text-sm"
              />
              <button className=" text-white rounded-2xl px-4 py-2 hover:scale-105 cursor-pointer">
                <FaMagnifyingGlass size={20} className="ml-2 text-[#982829]"/>
              </button>

              </div>

              
              

            </div>
            <h1> Categorias </h1>
            <div className=" justify-center flex overflow-x-auto whitespace-nowrap p-4 space-x-10  flex-shrink-0"> {/* botoes de categorias com scroll horizontal */}
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105" onClick={() => router.push('../categoria_especifica')}>
                <GiFruitBowl size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Mercado</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <GiMedicinePills size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Remédios</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <GiLipstick size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Cosmeticos</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <GiLargeDress size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Roupas</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <FaLaptop size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Eletronicos</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <IoGameControllerSharp size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Jogos</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <TbHorseToy size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Brinquedos</p>
              </button>
              <button className="h-25 w-25  bg-white rounded-2xl cursor-pointer hover:scale-105">
                <FaHouseChimneyWindow size={40} className="mx-auto mt-2 text-[#982829]"/>
                <p className="text-sm text-center mt-1">Casa</p>
              </button>
            </div>
            {renderProdutos("Produtos de Jogos", produtosJogos)}
            {renderProdutos("Produtos de Casa", produtosCasa)}
            <div className="flexbox flex items-center justify-between pr-5 ">
             <h1 className="pt-5"> Lojas </h1>
             <div className="flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2 justify-between items-center pl-4">
              Filtros
                <button className=" text-white rounded-2xl px-4 py-2 hover:scale-105 cursor-pointer">
                <FaAngleDown size={30} className="ml-2 text-[#982829]"/>
              </button>
             </div>
            </div>
          </div>

        </div>
        </>
        
    )
}