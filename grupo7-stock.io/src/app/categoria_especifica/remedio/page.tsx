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

  useEffect(() => {
    api
      .get("/produto/categoria_pai/10")
      .then((res) => {
        console.log("Produtos recebidos:", res.data);
        setProdutosOriginais(res.data);
        setProdutos(res.data);
      })
      .catch((err) => console.error("Erro ao carregar Farmácia:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtrarCategoria = (subId: number) => {
    console.log("Filtrando categoria:", subId);

    const filtrados = produtosOriginais.filter(
      (p) => Number(p.categoria_id) === Number(subId)
    );

    console.log("Filtrados:", filtrados);

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
        <div className=" text-white">
          <h1 className="text-4xl leading-snug pl-20 pt-15 ">
            O UNIVERSO da <strong className="font-bold">saúde</strong>,
          </h1>
          <h1 className="text-4xl leading-snug pl-55 pb-10">
            em um só lugar!
          </h1>
        </div>
        <div className=" h-full relative ml-8">
          <img src="/images/Mascote4.png" alt="Mascote" className=" w-140 h-140 object-contain pr-20" />
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
          <button onClick={() => filtrarCategoria(0)}
            className="h-10 w-15 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center">
            Todos
          </button>

          <button onClick={() => filtrarCategoria(13)}
            className="h-10 w-28 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center">
            Cósmeticos
          </button>

          <button onClick={() => filtrarCategoria(12)}
            className="h-10 w-15 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center">
            Higiene
          </button>

          <button onClick={() => filtrarCategoria(11)}
            className="h-10 w-32 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center">
            Medicamentos
          </button>

          <button onClick={() => filtrarCategoria(14)}
            className="h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer px-10 flex items-center justify-center">
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
