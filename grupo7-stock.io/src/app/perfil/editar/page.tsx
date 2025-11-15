// app/perfil/editar/page.tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { User } from "@/types";
import Navbar from "@/app/components/navbar";

export default function EditarPerfilPage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<User | null>(null);
  const [dadosForm, setDadosForm] = useState<any>(null); 
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null); 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); 

  
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?redirect=/perfil/editar"); 
      return;
    }

    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setPerfil(res.data);
        setDadosForm(res.data); 
        setCarregando(false);
      })
      .catch(() => {
        router.replace("/login"); 
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDadosForm({ ...dadosForm, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    const token = localStorage.getItem("token");
    if (!token || !perfil) return;

    try {
        const formData = new FormData();
        
        formData.append('nome', dadosForm.nome || ''); 
        formData.append('username', dadosForm.username || '');
        formData.append('email', dadosForm.email || '');

        if (fotoArquivo) {
          formData.append('file', fotoArquivo); 
        } else {
          
        }

        await api.patch(`/user/${perfil.id}`, JSON, {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
        });
        
        router.push(`/perfil/${perfil.id}`); 
      } catch (err) {
        setErro("Erro ao salvar: verifique os dados ou tente novamente.");
        console.error(err);
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

  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4eaa8] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">

          {/* Título e Foto de Perfil */}
          <h1 className="text-3xl font-bold mb-8 text-black">Editar Perfil</h1>

          <div className="flex items-center space-x-6 mb-8">
            <img 
              src={previewUrl || perfil!.fotoUrl || "/images/iconepessoa.png"} 
              alt="Foto de perfil atual"
              width={100}
              height={100}
              className="rounded-full object-cover aspect-square"
            />

            {/* 1. O Input de Arquivo (Escondido) */}
            <input
              type="file"
              id="file-upload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
              const file = e.target.files[0];
              setFotoArquivo(file);
              // ✅ CRIA O URL TEMPORÁRIO para pré-visualização
                  if (previewUrl) {
                URL.revokeObjectURL(previewUrl); // Limpa o URL antigo, se existir
              }
              setPreviewUrl(URL.createObjectURL(file)); 
    }
              }}
            />

           
            <label htmlFor="file-upload" className="cursor-pointer">
              <button
                type="button" 
                className="bg-[#d6993c] text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Alterar Foto
              </button>
            </label>
          </div>

          {/* 3. Pré-visualização e Botão de Upload Imediato (Opcional) */}
          {fotoArquivo && (
            <div className="text-sm text-gray-700 mt-[-20px] mb-4">
              Arquivo selecionado: **{fotoArquivo.name}**
            </div>
          )}

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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-500"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-50 text-gray-500" // Email como somente leitura visualmente
                //disabled // Desabilitar a edição direta de email é mais seguro
              />
            </div>

            {erro && <p className="text-red-500 text-sm">{erro}</p>}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()} // Volta para a página anterior
                className="px-6 py-3 bg-[#982829] text-white rounded-lg hover:bg-gray-300 transition"
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