"use client";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation"; // Importar useParams
import api from "@/lib/api"; // Assumindo que você tem essa instância do axios ou fetch wrapper
import ModalEdicao from "../editar/page"; // Componente que vamos criar
import { User } from "@/types/index"; // Assumindo uma tipagem básica de usuário
import Navbar from "@/app/components/navbar";
// Defina a tipagem de User em um arquivo como `src/types/index.ts`
// export interface User {
//   id: number;
//   nome: string;
//   username: string;
//   email: string;
//   fotoUrl: string;
// }

export default function PerfilPage() {
  const router = useRouter();
  const params = useParams(); // Hook para pegar parâmetros da URL
  const userId = params.userId as string; // O ID do perfil que estamos visitando

  const [perfil, setPerfil] = useState<User | null>(null); // Dados do perfil visitado
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null); // Se o usuário está logado, seus dados
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Variável que indica se o perfil visitado É o do usuário logado
  const isMeuPerfil = usuarioLogado && perfil && usuarioLogado.id.toString() === userId;

  // --- Funções de Busca ---

  // 1. Buscar dados do usuário logado (quem está visitando)
  const buscarUsuarioLogado = useCallback(async (token: string) => {
    try {
      // Endpoint para buscar 'eu' (o usuário logado)
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

  // 2. Buscar dados do perfil que está sendo visualizado (pode ser qualquer um)
  const buscarPerfil = useCallback(async () => {
  setCarregando(true);
  try {
    // ✅ CHAMADA AGORA DEVE SER PARA A ROTA PÚBLICA
    const res = await api.get(`/user/public/${userId}`); // Ajuste para a rota 'public'
    console.log("Dados do Perfil Recebidos:", res.data);
    setPerfil(res.data);
  } catch (error) {
    console.error(`Erro ao buscar perfil ${userId}:`, error);
    setPerfil(null);
  } finally {
    setCarregando(false);
  }
}, [userId]);

  // --- Efeitos ---

  useEffect(() => {
    // Busca o perfil que está sendo visualizado (sempre)
    buscarPerfil();

    // Tenta buscar o usuário logado (se houver token)
    const token = localStorage.getItem("token");
    if (token) {
      buscarUsuarioLogado(token);
    }
  }, [buscarPerfil, buscarUsuarioLogado]);

  // --- Renderização ---

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center">Carregando perfil...</div>;
  }

  if (!perfil) {
    return <div className="min-h-screen text-center pt-20">Perfil não encontrado.</div>;
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-[#f5f4eb]">
      
      {/* Faixa preta */}
      <div className="relative bg-black h-60">
        {/* Botão voltar */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 sm:left-12 top-4 sm:top-[57%] p-2 rounded-full hover:bg-white/10 transition"
          >
          <img
            src="/images/return.png"
            alt="Voltar"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </button>
        
        {/* Foto de perfil */}
        <div className="absolute left-[20%] bottom-0 transform -translate-x-1/2 translate-y-1/4">
          <img 
            src={perfil.fotoUrl || "/images/iconepessoa.png"} 
            alt="Foto de perfil"
            width={200}
            height={200}
            className="rounded-full border-4 border-[#f5f4eb] object-cover"
            />
        </div>
      </div>

        {/* Área branca (infos) */}
        <div className="pt-28 text-center relative px-4"> {/* Adicione RELATIVE aqui */}
            
            {/* Botão de Edição (Movido para aqui) */}
            {isMeuPerfil && (
            <button
                // ✅ Mude a ação para navegar para a nova página
                onClick={() => router.push(`/perfil/editar`)} 
                className="absolute right-4 sm:right-10 top-0 sm:top-6 bg-[#d6993c] text-black py-2 px-14 rounded-full font-semibold hover:bg-yellow-600 transition"
            >
                Editar Perfil
            </button>
            )}
          {/* NOVO Container para o Texto: Alinhado à esquerda com margem lateral */}
          <div className="text-left pl-4 sm:pl-40">
          
          {/* Adicione um padding horizontal (px-4 ou px-6) aqui se precisar de mais espaço */}
          
          <h1 className="text-5xl text-black font-bold mb-1 mt-[-30]">
            {perfil.nome}
          </h1>
          <p className="text-2xl text-black mb-1 mt-10">@{perfil.username}</p>
          <p className="text-2xl text-black mb-4">
            {isMeuPerfil ? perfil.email : null} {/* Exibe email só no próprio perfil */}
          </p>
        </div>

      {/* ✅ LINHA DIVISÓRIA ADICIONADA AQUI */}
        <hr className="my-8 max-w-4xl mx-auto border-gray-500" />

        {/* --- Seção da Loja (Futura) --- */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-black">Produtos</h2>
          {/* Se a pessoa não tem loja e É o meu perfil, mostrar botão para criar */}
          {/* {!perfil.loja && isMeuPerfil && (
            <button className="bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 transition">
              Criar Minha Loja
            </button>
          )} */}
          {/* Se tem loja, mostrar produtos */}
          {/* {perfil.loja && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <p>Produtos virão aqui...</p>
            </div>
          )} */}
          <p className="text-gray-500 italic">Aqui serão exibidos os produtos.</p>
        </div>
      </div>
    </div>
    </>
  );
}