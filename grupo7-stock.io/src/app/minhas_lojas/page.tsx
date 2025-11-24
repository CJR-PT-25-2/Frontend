"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/components/navbar";


export default function MinhasLojasPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [lojas, setLojas] = useState<any[]>([]);
  const [isLoadingLojas, setIsLoadingLojas] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const url = `http://localhost:3001/loja/usuario/${user.id}`;
      setIsLoadingLojas(true);

      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setLojas(data);
        })
        .catch((err) => console.error("Erro no fetch:", err))
        .finally(() => {
          setIsLoadingLojas(false);
        });
    } else if (!loading && !isAuthenticated) {
       
    }
  }, [loading, isAuthenticated, user, router]);

  
  if (loading || isLoadingLojas) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
              <p className="text-xl">Carregando lojas...</p>
          </div>
      );
  }

  
  if (lojas.length === 0) {
      return (
          <>
              <Navbar />
              <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 p-10 text-white">
                  <h1 className="text-4xl font-bold mb-4">Minhas Lojas</h1>
                  <p className="text-xl text-gray-400">Você ainda não possui lojas cadastradas.</p>
                  <button
                    onClick={() => router.push('/criar-loja')} // Assumindo uma rota de criação
                    className="mt-6 px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    + Criar Minha Primeira Loja
                  </button>
              </div>
          </>
      );
  }


  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-neutral-900 p-8 md:p-12">
      
      {/* TÍTULO */}
      <h1 className="text-5xl text-center font-extrabold text-white mb-12">
        Seus Empreendimentos
      </h1>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/criarloja')}
          className="mb-8 px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold text-white"
        >
          + Criar Nova Loja
        </button>
        </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {lojas.map((loja) => (
          <div
            key={loja.id}
            onClick={() => router.push(`/loja/${loja.id}`)}
            
            className="flex items-center gap-6 bg-neutral-800 rounded-2xl p-5 cursor-pointer hover:bg-neutral-700 transition shadow-xl border border-neutral-700"
          >
            
            {/* Foto de perfil da loja */}
            <img
              src={
                loja.perfil_url
                  ? `http://localhost:3001${loja.perfil_url}`
                  : "/images/placeholder_loja.png"
              }
              alt={loja.nome}
              className="w-20 h-20 rounded-full object-cover border-4 border-neutral-600 shadow-md"
            />

            {/* Detalhes da Loja */}
            <div className="flex-1 min-w-0">
                <p className="text-3xl text-white font-bold truncate">
                    {loja.nome}
                </p>
                <p className="text-gray-400 truncate text-sm">
                    {loja.descricao || "Sem descrição."}
                </p>
            </div>

            {/* BOTÕES DE AÇÃO */}
            {user && loja.donoId === Number(user.id) && (
              <div className="flex gap-3 ml-auto">
                <button
                    onClick={(e) => {
                        
                        e.stopPropagation(); 
                        router.push(`/loja/${loja.id}/adicionar_produto`);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm md:text-base"
                    title="Adicionar Novo Produto"
                >
                    + Produto
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        router.push(`/loja/${loja.id}/editar`);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base"
                    title="Configurações da Loja"
                >
                    Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}