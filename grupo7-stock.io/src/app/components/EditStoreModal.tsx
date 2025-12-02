"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";


const categoriaMap: Record<string, number> = {
  mercado: 1,
  farmacia: 2,
  brinquedo: 3,
  beleza: 4,
  moda: 5,
  casa: 6,
  eletrônicos: 7,
  jogos: 8,
  outros: 9,
};

const categoriasFixas = Object.entries(categoriaMap).map(([nome, id]) => ({
  id: id,
  nome: nome.charAt(0).toUpperCase() + nome.slice(1), 
}));

interface EditStoreModalProps {
  id: string; 
  onClose: () => void; 
  onSaveSuccess: (lojaAtualizada: any) => void; 
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



export default function EditStoreModal({ id, onClose, onSaveSuccess }: EditStoreModalProps) {
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
    
    let urlsToRevoke: string[] = [];

    fetch(`http://localhost:3001/loja/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLoja(data);
        setNome(data.nome);
        setDescricao(data.descricao);
        setCategoriaId(data.categoriaId ? Number(data.categoriaId) : null);

        const BASE = "http://localhost:3001";

        const updatePreview = (url: string | null, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
            if (url) {
                const fullUrl = url.startsWith("http") ? url : BASE + url;
                setPreview(fullUrl);
            }
        };
        
        
        updatePreview(data.perfil_url, setPreviewPerfil);
        updatePreview(data.sticker_url, setPreviewSticker);
        updatePreview(data.banner_url, setPreviewBanner);

      })
      .catch(error => {
        console.error("Erro ao carregar loja:", error);
        alert("Erro ao carregar loja.");
        onClose(); 
      });

    
    return () => {
        urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [id, onClose]);

  
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
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/loja/${id}`, {
            method: "PATCH",
            body: form,
            headers: { 
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("ERRO BRUTO:", text);
            alert("Erro ao editar loja!");
            return;
        }

        const data = await res.json();
        alert("Loja editada com sucesso!");
       
        onSaveSuccess(data); 

    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor.");
    }
  };


  
  const excluirLoja = useCallback(async () => {
    
    if (!loja || !user || user.id !== loja.donoId) {
        alert("Erro: Você não tem permissão para excluir esta loja.");
        return;
    }

    
    const confirmacao = window.confirm(
      `ATENÇÃO: Você tem certeza que deseja excluir a loja "${loja.nome}"? Esta ação é irreversível e excluirá todos os produtos.`
    );
    if (!confirmacao) return;

    const nomeConfirmado = window.prompt(
      `Para confirmar a exclusão, digite o nome completo da loja: "${loja.nome}"`
    );
    if (nomeConfirmado !== loja.nome) {
      alert("Nome não corresponde. Exclusão abortada.");
      return;
    }

    
    try {
        const token = localStorage.getItem("token");
        await api.delete(`/loja/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        
        alert(`Loja "${loja.nome}" excluída com sucesso!`);
        router.push(`/perfil/${user.id}`); 
        onClose(); 

    } catch (error) {
        console.error("Erro ao excluir loja:", error);
        alert("Erro ao excluir a loja. Verifique sua permissão.");
    }
  }, [loja, user, id, router, onClose]);


  if (!loja) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <div className="p-8 bg-white rounded-xl shadow-2xl">
          <h1 className="text-xl text-gray-500">Carregando dados da loja...</h1>
        </div>
      </div>
    );
  }

 
  const isDono = user && loja && user.id === loja.donoId;

  return (
    
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] overflow-y-auto py-10 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl my-auto relative">
        
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-black text-left">Editar Loja: {loja.nome}</h1>

          {/* BOTÃO DE FECHAR */}
          <button
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-900 transition p-1.5 rounded-full hover:bg-gray-100"
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
        
        {/* Aviso de permissão */}
        {!isDono && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-left" role="alert">
                <p className="font-bold">Acesso Negado</p>
                <p className="text-sm">Você não é o proprietário desta loja e só pode visualizar os dados.</p>
            </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LADO ESQUERDO: Detalhes da Loja */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 text-left">
                Detalhes da Loja
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  placeholder="Nome da loja"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800"
                  required
                  disabled={!isDono}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Categoria Principal
                </label>
                <select
                
                value={categoriaId !== null ? String(categoriaId) : ""}
                
                onChange={(e) => setCategoriaId(Number(e.target.value))}
                className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 bg-white cursor-pointer"
                required
                disabled={!isDono}
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
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  placeholder="Fale um pouco sobre sua loja..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 resize-none"
                  disabled={!isDono}
                />
              </div>
            </div>

            {/* LADO DIREITO: Identidade Visual */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 text-left">
                Identidade Visual
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foto de Perfil */}
                <FileDropzone
                    label="Foto de perfil de sua loja"
                    onFileSelect={(file) => {
                      if(isDono) { 
                        setFilePerfil(file);
                        setPreviewPerfil(file ? URL.createObjectURL(file) : null);
                      }
                    }}
                    preview={previewPerfil}
                  />

                {/* Logo Sticker */}
                <FileDropzone
                    label="Logo em SVG de sua loja"
                    onFileSelect={(file) => {
                      if(isDono) {
                        setFileSticker(file);
                        setPreviewSticker(file ? URL.createObjectURL(file) : null);
                      }
                    }}
                    preview={previewSticker}
                  />

                {/* Banner */}
                <FileDropzone
                    label="Anexe o banner de sua loja (Horizontal)"
                    onFileSelect={(file) => {
                      if(isDono) {
                        setFileBanner(file);
                        setPreviewBanner(file ? URL.createObjectURL(file) : null);
                      }
                    }}
                    preview={previewBanner}
                  />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* BOTÃO DE EXCLUSÃO (Alinhado à esquerda) */}
            {isDono && (
                <button
                    type="button"
                    onClick={excluirLoja}
                    className="w-full md:w-auto bg-red-100 text-red-600 text-lg font-semibold py-3 px-6 rounded-xl shadow-md border border-red-300 hover:bg-red-200 transition"
                >
                    Excluir Loja
                </button>
            )}

            {/* BOTÃO DE SALVAR ALTERAÇÕES (Alinhado à direita) */}
            <button
              type="submit"
              className={`w-full md:w-auto text-xl font-semibold py-4 px-12 rounded-xl shadow-lg transition
                ${isDono ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"}
              `}
              disabled={!isDono}
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}