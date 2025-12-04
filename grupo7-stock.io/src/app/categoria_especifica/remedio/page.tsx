"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import api from "@/lib/api";
import BarraPesquisa from "@/app/components/barra_pesquisa";
import Caixa_prod from "@/app/components/caixinha_produto";
import { useRouter } from "next/navigation";

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
};



export default function FeedPage() {
  const [produtos, setProdutos] = useState<ProdutoParacard[]>([]);
  const [produtosOriginais, setProdutosOriginais] = useState<ProdutoParacard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivoId, setFiltroAtivoId] = useState(0);
  const router = useRouter();


  const filtrarCategoria = (subId: number) => {
    setFiltroAtivoId(subId);

    console.log("Filtrando categoria:", subId);

    const filtrados = produtosOriginais.filter(
      (p) => subId === 0 || Number(p.categoria_id) === Number(subId)
    );

    console.log("Filtrados:", filtrados);

    setProdutos(filtrados);
  };

  useEffect(() => {
    api
      .get("/produto/categoria_pai/10")
      .then((res) => {
        console.log("Produtos recebidos:", res.data);
        setProdutosOriginais(res.data);
        setProdutos(res.data);
      })
      .catch((err) => console.error("Erro ao carregar Mercado:", err))
      .finally(() => setLoading(false));
  }, []);





  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-65 bg-[#000000] text-white">
        <div className="text-white">
          <h1 className="text-4xl leading-snug pl-20 pt-15">
            O UNIVERSO <strong className="font-bold">da saúde</strong>,
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
            onClick={() => filtrarCategoria(13)}
            className={`h-10 w-25  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center  ${filtroAtivoId === 13 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
            Cosméticos
          </button>

          <button
            onClick={() => filtrarCategoria(12)}
            className={`h-10 w-20  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 12 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
            Higiene
          </button>

          <button
            onClick={() => filtrarCategoria(11)}
            className={`h-10 w-30  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 11 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
            Medicamentos
          </button>

          <button
            onClick={() => filtrarCategoria(14)}
            className={`h-10 w-20  rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center ${filtroAtivoId === 14 ? 'bg-[#982829] text-white font-bold  ' : 'text-[#982829] bg-white'}`}>
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
                key={p.id} className="cursor-pointer" onClick={() => router.push(`/produto/${p.id}`)}
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
