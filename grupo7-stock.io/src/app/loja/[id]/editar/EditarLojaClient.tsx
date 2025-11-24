"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const categoriaMap: Record<string, number> = {
  mercado: 1,
  farmacia: 2,
  brinquedo: 3,
  beleza: 4,
  moda: 5,
  casa: 6,
  eletrônicos: 7,
  jogos: 8,
};


const categoriasFixas = Object.entries(categoriaMap).map(([nome, id]) => ({
  id: id,
  nome: nome.charAt(0).toUpperCase() + nome.slice(1), 
}));


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

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onFileSelect(null);
    if (inputRef.current) {
        inputRef.current.value = ""; 
    }
  };

  return (
    <div
      className="border-2 border-dashed border-gray-400 bg-gray-50 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-100 transition-colors h-full flex flex-col justify-center relative min-h-[150px]"
      onClick={() => inputRef.current?.click()}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover rounded-xl absolute inset-0"
          />
          {/* Botão para remover a imagem */}
          <button
            type="button"
            onClick={handleClearFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-80 hover:opacity-100 transition-opacity"
            title="Remover imagem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <svg
            className="w-10 h-10 text-gray-500"
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
          <p className="text-sm font-medium text-gray-700">{label}</p>
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



export default function EditarLojaClient({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const [loja, setLoja] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  
  const [categoriaId, setCategoriaId] = useState<number | null>(null);


  const [filePerfil, setFilePerfil] = useState<File | null>(null);
  const [fileSticker, setFileSticker] = useState<File | null>(null);
  const [fileBanner, setFileBanner] = useState<File | null>(null);

  
  const [previewPerfil, setPreviewPerfil] = useState<string | null>(null);
  const [previewSticker, setPreviewSticker] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);


  useEffect(() => {
    
    fetch(`http://localhost:3001/loja/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLoja(data);
        setNome(data.nome);
        setDescricao(data.descricao);
        setCategoriaId(data.categoriaId ? Number(data.categoriaId) : null);

        
        const BASE = "http://localhost:3001";

        if (data.perfil_url)
          setPreviewPerfil(data.perfil_url.startsWith("http")
            ? data.perfil_url
            : BASE + data.perfil_url);

        if (data.sticker_url)
          setPreviewSticker(data.sticker_url.startsWith("http")
            ? data.sticker_url
            : BASE + data.sticker_url);

        if (data.banner_url)
          setPreviewBanner(data.banner_url.startsWith("http")
            ? data.banner_url
            : BASE + data.banner_url);

      })
      .catch(error => console.error("Erro ao carregar loja:", error));

    
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("nome", nome);
    form.append("descricao", descricao);
    if (categoriaId !== null) {
      form.append("categoriaId", String(categoriaId));
    }

    
    if (filePerfil) form.append("fotoPerfil", filePerfil);
    if (fileSticker) form.append("logoSticker", fileSticker);
    if (fileBanner) form.append("banner", fileBanner);
    if (!previewPerfil && !filePerfil && loja?.perfil_url) form.append("removeFotoPerfil", "true");
    if (!previewSticker && !fileSticker && loja?.sticker_url) form.append("removeLogoSticker", "true");
    if (!previewBanner && !fileBanner && loja?.banner_url) form.append("removeBanner", "true");


    try {
        const res = await fetch(`http://localhost:3001/loja/${id}`, {
            method: "PATCH",
            body: form,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("ERRO BRUTO:", text);
            alert("Erro ao editar loja!");
            return;
        }

        alert("Loja editada com sucesso!");
        router.push(`/loja/${id}`);
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor.");
    }
  };

  if (!loja) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-xl text-gray-500">Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl">
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-black">Editar Loja</h1>

          <button
            onClick={() => router.push(`/loja/${id}`)}
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
            {/* LADO ESQUERDO: Detalhes da Loja */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Detalhes da Loja
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  placeholder="Nome da loja"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria Principal
                </label>
                <select
                
                value={categoriaId !== null ? String(categoriaId) : ""}
                
                onChange={(e) => setCategoriaId(Number(e.target.value))}
                className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 bg-white cursor-pointer"
                required
                >
                <option value="" disabled>Selecione uma categoria</option>

                
                {categoriasFixas.map((c) => (
                    <option 
                        key={c.id} 
                        
                        value={String(c.id)}>
                    {c.nome}
                    </option>
                ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  placeholder="Fale um pouco sobre sua loja..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 resize-none"
                />
              </div>
            </div>

            {/* LADO DIREITO: Identidade Visual */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Identidade Visual
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foto de Perfil */}
                <FileDropzone
                    label="Foto de perfil de sua loja"
                    onFileSelect={(file) => {
                      setFilePerfil(file);
                      setPreviewPerfil(file ? URL.createObjectURL(file) : null);
                    }}
                    preview={previewPerfil}
                  />

                {/* Logo Sticker */}
                <FileDropzone
                    label="Logo em SVG de sua loja"
                    onFileSelect={(file) => {
                      setFileSticker(file);
                      setPreviewSticker(file ? URL.createObjectURL(file) : null);
                    }}
                    preview={previewSticker}
                  />

                {/* Banner */}
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
              className="w-full bg-blue-600 text-white text-xl font-semibold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}