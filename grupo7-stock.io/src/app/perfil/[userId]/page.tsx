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

  // ⭐ estado para guardar a loja do usuário
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


  // ⭐ nova função para buscar a loja do usuário
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
    buscarLoja(); // ⭐ buscar loja ao abrir a página

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

          {/* ⭐ SEÇÃO DA LOJA */}
          <div className="max-w-3xl mx-auto mt-12">

            {!loja && isMeuPerfil && (
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

            {/* loja existe */}
            {loja && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">{loja.nome}</h3>

                  {isMeuPerfil && (
                    <button
                      onClick={() => router.push(`/minhas_lojas`)}
                      className="border border-[#325862] text-[#325862] text-sm py-2 px-4 rounded-full hover:bg-cyan-50 transition font-medium"
                    >
                      Visualizar Lojas
                    </button>
                  )}
                </div>

                {/* produtos */}
                {loja.produtos?.length > 0 ? (
                  <div className="p-6 text-gray-400 italic">
                    Produtos listados futuramente...
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 italic">Nenhum produto listado nesta loja.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}