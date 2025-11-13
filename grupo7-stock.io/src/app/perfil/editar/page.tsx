// app/perfil/editar/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation"; // Importar useParams
import Image from "next/image";
import api from "@/lib/api";
import { User } from "@/types";
import Navbar from "@/app/components/navbar"; // Importe a Navbar

export default function EditarPerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<User | null>(null);
  const [dadosForm, setDadosForm] = useState<any>(null); // Use any ou uma tipagem de DTO
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // 1. Busca os dados do usuário logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?redirect=/perfil/editar"); // Redireciona se não estiver logado
      return;
    }

    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setPerfil(res.data);
        setDadosForm(res.data); // Inicializa o formulário com os dados do usuário
        setCarregando(false);
      })
      .catch(() => {
        router.replace("/login"); // Erro ao buscar dados (token inválido)
      });
  }, [router]);

  // Função para lidar com a mudança dos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDadosForm({ ...dadosForm, [e.target.name]: e.target.value });
  };

  // Função para salvar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    const token = localStorage.getItem("token");
    if (!token || !perfil) return;

    try {
      // Endpoint PATCH/PUT /usuarios/:id para atualizar (o mesmo que você usou antes)
      await api.patch(`/user/${perfil.id}`, dadosForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Redireciona para o perfil após salvar
      router.push(`/perfil/${perfil.id}`); 
    } catch (err) {
      setErro("Erro ao salvar: verifique os dados ou tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando || !dadosForm) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">Carregando dados para edição...</div>
      </>
    );
  }

  // 2. O JSX da Página
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5f4eb] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">

          {/* Título e Foto de Perfil */}
          <h1 className="text-3xl font-bold mb-8 text-black">Editar Perfil</h1>

          <div className="flex items-center space-x-6 mb-8">
            <img 
              src={perfil!.fotoUrl || "/images/iconepessoa.png"} 
              alt="Foto de perfil"
              width={200}
              height={200}
              className="rounded-full border-4 border-[#f5f4eb] object-cover"
              />
            <button className="bg-[#d6993c] text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition">
              Alterar Foto
            </button> {/* Este botão requer lógica de upload de arquivo no futuro */}
          </div>

          {/* Formulário de Edição */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-black">Nome</label>
              <input
                type="text"
                name="nome"
                id="nome"
                value={dadosForm.nome}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
              />
            </div>
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={dadosForm.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3"
              />
            </div>

            {/* Email (Geralmente não é editável facilmente, mas mantivemos) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={dadosForm.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50" // Email como somente leitura visualmente
                //disabled // Desabilitar a edição direta de email é mais seguro
              />
            </div>

            {erro && <p className="text-red-500 text-sm">{erro}</p>}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()} // Volta para a página anterior
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-6 py-3 text-white rounded-lg transition ${salvando ? 'bg-black/50 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}