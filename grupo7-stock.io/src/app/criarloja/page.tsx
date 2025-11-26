"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
const categoriaMap: Record<string, number> = {
  mercado: 1,
  farmacia: 2,
  brinquedo: 3,
  beleza: 4,
  moda: 5,
  casa: 6,
  eletronicos: 7,
  jogos: 8,
};

interface FileDropzoneProps {
  label: string;
  onFileSelect: (file: File | null) => void;
}

const FileDropzone = ({
  label,
  onFileSelect,
  preview,
}: {
  label: string;
  onFileSelect: (file: File | null) => void;
  preview?: string | null;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="border-2 border-dashed border-cyan-400 bg-cyan-50 p-6 rounded-xl text-center cursor-pointer hover:bg-cyan-100 transition-colors h-full flex flex-col justify-center relative"
      onClick={() => inputRef.current?.click()}
    >
      {preview ? (
        <img
          src={preview}
          alt="preview"
          className="w-full h-full object-cover rounded-xl absolute inset-0"
        />
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <svg
            className="w-10 h-10 text-[#325862]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.884-7.884A5 5 0 0115 6a5 5 0 014.884 4.116A4 4 0 0120 16v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z"
            ></path>
          </svg>
          <p className="text-sm font-medium text-[#325862]">{label}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default function CriarLojaPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  const [nomeLoja, setNomeLoja] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricaoLoja, setDescricaoLoja] = useState("");

  
  const [filePerfil, setFilePerfil] = useState<File | null>(null);
  const [fileSticker, setFileSticker] = useState<File | null>(null);
  const [fileBanner, setFileBanner] = useState<File | null>(null);
  const [previewPerfil, setPreviewPerfil] = useState<string | null>(null);
  const [previewSticker, setPreviewSticker] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);


  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Erro: Usuário não identificado!");
      return;
    }
    
    try {
      const form = new FormData();
      const categoriaId = categoriaMap[categoria];

      if (!categoriaId) {
        alert("Selecione uma categoria válida!");
        return;
      }

      form.append("categoriaId", String(categoriaId));
      form.append("nome", nomeLoja);
      form.append("descricao", descricaoLoja);
      form.append("donoId", String(Number(user.id)));

      if (filePerfil) form.append("fotoPerfil", filePerfil);
      if (fileSticker) form.append("logoSticker", fileSticker);
      if (fileBanner) form.append("banner", fileBanner);

      const res = await fetch("http://localhost:3001/loja", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
      const text = await res.text();
      console.error("ERRO BRUTO:", text);
      alert("Erro ao criar loja!");
      return;
    }

      alert("Loja criada com sucesso!");
      router.push(`/perfil/${user.id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar ao servidor.");
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-xl text-gray-500">Verificando autenticação...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl">
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-black">Adicionar Loja</h1>

          <button
            onClick={() => router.push(`/perfil/${user?.id}`)}
            className="text-gray-500 hover:text-gray-900 transition"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LADO ESQUERDO */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Detalhes da Loja
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Loja (Obrigatório)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rare Beauty"
                  value={nomeLoja}
                  onChange={(e) => setNomeLoja(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-purple-500 text-lg text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria Principal
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md appearance-none focus:ring-2 focus:ring-purple-500 text-lg text-gray-800 bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Selecione uma categoria</option>
                  <option value="mercado">Mercado</option>
                  <option value="farmacia">Farmácia</option>
                  <option value="brinquedo">Brinquedo</option>
                  <option value="beleza">Beleza</option>
                  <option value="moda">Moda</option>
                  <option value="casa">Casa</option>
                  <option value="eletronicos">Eletrônicos</option>
                  <option value="jogos">Jogos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Fale um pouco sobre sua loja..."
                  value={descricaoLoja}
                  onChange={(e) => setDescricaoLoja(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-purple-500 text-lg text-gray-800 resize-none"
                />
              </div>
            </div>

            {/* LADO DIREITO */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Identidade Visual
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileDropzone
                    label="Foto de perfil de sua loja"
                    onFileSelect={(file) => {
                      setFilePerfil(file);
                      setPreviewPerfil(file ? URL.createObjectURL(file) : null);
                    }}
                    preview={previewPerfil}
                  />

                  <FileDropzone
                    label="Logo em SVG de sua loja"
                    onFileSelect={(file) => {
                      setFileSticker(file);
                      setPreviewSticker(file ? URL.createObjectURL(file) : null);
                    }}
                    preview={previewSticker}
                  />

                  <FileDropzone
                    label="Anexe o banner de sua loja (Horizontal)"
                    onFileSelect={(file) => {
                      setFileBanner(file);
                      setPreviewBanner(file ? URL.createObjectURL(file) : null);
                    }}
                    preview={previewBanner}
                  />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-[#325862] text-white text-xl font-semibold py-4 rounded-xl shadow-lg hover:bg-[#2a4a53] transition"
            >
              Adicionar Loja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
