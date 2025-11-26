"use client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation"; 
import api from "@/lib/api"; 
import ModalEdicao from "../editar/page"; 
import { User } from "@/types/index"; 
import Navbar from "@/app/components/navbar";
import Caixa_prod from "@/app/components/caixinha_produto";

export default function PerfilPage() {
  const router = useRouter();
  const params = useParams(); 
  const userId = params.userId as string; 

  const [perfil, setPerfil] = useState<User | null>(null); 
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null); 
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  
  const [loja, setLoja] = useState<any | null>(null);


  const isMeuPerfil = usuarioLogado && perfil && usuarioLogado.id.toString() === userId;


  const buscarUsuarioLogado = useCallback(async (token: string) => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarioLogado(res.data);
      return res.data as User;
    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      setUsuarioLogado(null);
      return null;
    }
  }, []);


  const buscarPerfil = useCallback(async () => {
    try {
      const res = await api.get(`/user/${userId}`);
      setPerfil(res.data);
    } catch (error) {
      console.error(`Erro ao buscar perfil ${userId}:`, error);
      setPerfil(null);
    }
  }, [userId]);


  
  const buscarLoja = useCallback(async () => {
    try {
      const res = await api.get(`/loja/usuario/${userId}`); 
      console.log("Loja carregada:", res.data);
      setLoja(res.data ?? null);
    } catch (err) {
      console.log("Usuário não tem loja");
      setLoja(null);
    }
  }, [userId]);


  useEffect(() => {
    buscarPerfil();
    buscarLoja(); 

    const token = localStorage.getItem("token");
    if (token) {
      buscarUsuarioLogado(token);
    }

    setCarregando(false);
  }, [buscarPerfil, buscarUsuarioLogado, buscarLoja]);


  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center">Carregando perfil...</div>;
  }

  if (!perfil) {
    return <div className="min-h-screen text-center pt-20">Perfil não encontrado.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5f4eb]">

        {/* Faixa preta */}
        <div className="relative bg-black h-60">

          <button
            onClick={() => router.push('/')}
            className="absolute left-4 sm:left-12 top-4 sm:top-[57%] p-2 rounded-full hover:bg-white/10 transition"
          >
            <img src="/images/return.png" width={40} height={40} />
          </button>

          <div className="absolute left-[20%] bottom-0 transform -translate-x-1/2 translate-y-1/4">
            <img
              src={
                perfil?.foto_perfil_URL
                  ? `http://localhost:3001${perfil.foto_perfil_URL}`
                  : "/images/iconepessoa.png"
              }
              className="w-[200px] h-[200px] rounded-full border-4 border-[#f5f4eb] object-cover"
            />
          </div>
        </div>

        {/* Área branca */}
        <div className="pt-28 text-center relative px-4"> 

          {isMeuPerfil && (
            <button
              onClick={() => router.push(`/perfil/editar`)}
              className="absolute right-4 sm:right-10 top-0 sm:top-6 bg-[#d6993c] text-black py-2 px-14 rounded-full font-semibold hover:bg-yellow-600 transition"
            >
              Editar Perfil
            </button>
          )}

          <div className="text-left pl-4 sm:pl-40">
            <h1 className="text-5xl text-black font-bold mb-1">{perfil.name}</h1>
            <p className="text-2xl text-black mb-1">@{perfil.username}</p>
            {isMeuPerfil && <p className="text-2xl">{perfil.email}</p>}
          </div>

          <hr className="my-8 max-w-4xl mx-auto border-gray-500" />

                {/*SEÇÃO DA LOJA */}
        <div className="max-w-3xl mx-auto mt-12">

          {/* não tem loja */}
          {( !loja || loja.length === 0 ) && isMeuPerfil && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex justify-between items-center shadow-sm">
              <p className="text-gray-700">
                Você ainda não tem uma loja. Crie agora para começar a vender!
              </p>

              <button 
                onClick={() => router.push(`/criarloja`)}
                className="bg-[#d6993c] text-black font-semibold text-lg py-3 px-8 rounded-full hover:bg-yellow-500 transition shadow-lg"
              >
                Criar Minha Loja
              </button>
            </div>
          )}

          {/* lojas existem */}
          {loja && loja.length > 0 && (
            <div>

              {/* BOTÃO MOVIDO PARA FORA DO LOOP: Renderiza apenas uma vez */}
              {isMeuPerfil && (
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => router.push(`/minhas_lojas`)}
                    className="border border-[#325862] text-[#325862] text-sm py-2 px-4 rounded-full hover:bg-cyan-50 transition font-medium"
                  >
                    Visualizar Lojas
                  </button>
                </div>
              )}

              {/* lista de lojas */}
              {loja.map((l: any) => (
                <div key={l.id} className="mb-10 border-b pb-6 text-black">

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{l.nome}</h3>
                    {/* REMOVER O BOTÃO DAQUI */}
                  </div>

                  {/* produtos */}
                  {l.produtos?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {l.produtos.map((produto: any) => (
                        
                          <div 
                              key={produto.id} 
                              className="border p-4 rounded-xl shadow-sm hover:shadow-md transition bg-white"
                          >
                              
                              <div className="relative w-full h-32 mb-3 cursor-pointer">
                                  
                    {/* Imagem principal */}
                    {produto.Imagems_produto_URL && (
                        <img 
                            src={`http://localhost:3001${produto.Imagems_produto_URL}`} 
                            alt={produto.nome} 
                            className="w-full h-32 object-cover rounded-lg"
                            onClick={() => router.push(`/produto/${produto.id}`)}
                        />
                    )}
                    
                    {/* BOTÃO LÁPIS DE EDIÇÃO */}
                    {isMeuPerfil && ( 
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); 
                                
                                
                                router.push(`/produto/${produto.id}/editar`);
                            }}
                            className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm text-gray-800 rounded-full shadow-lg hover:bg-white transition"
                            title={`Editar ${produto.nome}`}
                        >
                            {/* Ícone de Lápis*/}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                    )}
                </div>

                {/* Detalhes do produto */}
                <p className="text-sm font-medium text-gray-400">{produto.Categoria?.nome}</p>
                <p className="text-lg font-bold text-black truncate">{produto.nome}</p>
                <p className="text-xl text-green-600 mt-1">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                
            </div>
        ))}
    </div>
) : (
    <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500 italic">Nenhum produto listado nesta loja.</p>
    </div>
)}
                </div>
              ))}

            </div>
          )}

        </div>

        </div>
      </div>
    </>
  );
}