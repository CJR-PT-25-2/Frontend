"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";

const CATEGORIAS_SUBCATEGORIAS: Record<string, string[]> = {
  Mercado: [
    "Hortifruti", "Limpeza", "Padaria", "Adega", "Bebidas", "Açogue", "Mercearia",
  ],
  Farmacia: [
    "Medicamentos", "Higiene", "Cosméticos", 
  ],
  Beleza: [
    "Skincare", "Maquiagem", "Cabelo", "Corpo",
  ],
  Brinquedo: [
    "Boneca", "Carrinho", "Legos", "Pelúcia",
  ],
  Moda: [
    "Vestido", "Blusa", "Calça", "Sapato",
  ],
  Casa: [
    "Cozinha", "Sala", "Quarto", "Banheiro",
  ],
  Eletronicos: [
    "Celulares", "Notebooks", "TVs", "Acessórios",
  ],
  Jogos: [
    "Eletrônicos", "Tabuleiro",
  ],
};

const normalizeKey = (name: string) => 
    name
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s/g, '');

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
      className="border-2 border-dashed border-gray-400 bg-gray-50 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-100 transition-colors h-full flex flex-col justify-center relative min-h-[200px]"
      onClick={() => inputRef.current?.click()}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover rounded-xl absolute inset-0"
          />
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



export default function EditarProdutoClient() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : null; 
  const router = useRouter();
  const { user } = useAuth();
  
  const [lojaId, setLojaId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [subcategoriaNome, setSubcategoriaNome] = useState(""); 
  const [estoque, setEstoque] = useState("");
  const [descricao, setDescricao] = useState("");
  
 
  const [files, setFiles] = useState<Array<File | null>>([null, null, null, null]);
  const [previews, setPreviews] = useState<Array<string | null>>([null, null, null, null]);

  
  const [subcategoriasDisponiveis, setSubcategoriasDisponiveis] = useState<string[]>([]);
  const [categoriaPaiNome, setCategoriaPaiNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const handleFileSelect = (index: number, newFile: File | null) => {
    const newFiles = [...files];
    newFiles[index] = newFile;
    setFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews[index] = newFile ? URL.createObjectURL(newFile) : null;
    setPreviews(newPreviews);
  };
  
 
  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      try {
        
        const produtoRes = await fetch(`http://localhost:3001/produto/${id}`);
        if (!produtoRes.ok) {
            throw new Error("Produto não encontrado ou erro na API.");
        }
        const produtoData = await produtoRes.json();
        
        
        setNome(produtoData.nome);
        setPreco(String(produtoData.preco));
        setEstoque(String(produtoData.estoque));
        setDescricao(produtoData.descricao);
        setSubcategoriaNome(produtoData.Categoria.nome);
        setLojaId(String(produtoData.Loja.id));
        
        
        const currentUrls = [
            produtoData.imagem1_url,
            produtoData.imagem2_url,
            produtoData.imagem3_url,
            produtoData.imagem4_url,
        ];
        
        setPreviews(currentUrls.map(url => url ? `http://localhost:3001${url}` : null));
        
        
        const lojaRes = await fetch(`http://localhost:3001/loja/${produtoData.Loja.id}`);
        const lojaData = await lojaRes.json();
        const categoriaNomeOriginal = lojaData.categoriaNome; // Ex: "Farmácia"

        if (!categoriaNomeOriginal) {
            throw new Error("Categoria principal da loja não definida.");
        }
        
        const categoriaChaveNormalizada = normalizeKey(categoriaNomeOriginal);

        const lista = CATEGORIAS_SUBCATEGORIAS[categoriaChaveNormalizada as keyof typeof CATEGORIAS_SUBCATEGORIAS];
        
        if (lista) {
          setSubcategoriasDisponiveis(lista);
         
          setCategoriaPaiNome(categoriaChaveNormalizada); 
        } else {
          
          setError(`Nenhuma subcategoria mapeada para a categoria: ${categoriaChaveNormalizada}`);
        }
        
      } catch (err: any) {
        console.error("Erro no carregamento:", err);
        setError(err.message || "Não foi possível carregar os dados para edição.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subcategoriaNome || !categoriaPaiNome) {
        alert("Dados de categoria incompletos.");
        return;
    }
    
   
    const form = new FormData();
    form.append("nome", nome);
    form.append("preco", preco); 
    form.append("estoque", estoque);
    form.append("descricao", descricao);
    
    
    form.append("subcategoria", subcategoriaNome); 
    form.append("categoriaPai", categoriaPaiNome);
    
    
    files.forEach((file, index) => {
        if (file) {
            
            form.append(`imagem${index + 1}`, file);
        } else if (previews[index] === null) {
            
            form.append(`remove_imagem${index + 1}`, 'true'); 
        }
    });

    try {
        
        const res = await fetch(`http://localhost:3001/produto/${id}`, {
            method: "PATCH",
            body: form,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("ERRO BRUTO:", text);
            alert("Erro ao editar produto! Verifique o console.");
            return;
        }

        alert("Produto editado com sucesso!");
       
        router.push(`/perfil/${user?.id}`); 
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor.");
    }
  };


  
  if (loading || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-xl text-gray-500">Carregando dados do produto...</h1>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center">
            <h1 className="text-2xl text-red-600 mb-4">❌ Erro de Carregamento</h1>
            <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-black">Editar Produto: {nome}</h1>

          <button
            onClick={() => router.push(`/produto/${id}`)}
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
            
            {/* LADO ESQUERDO: DETALHES DO PRODUTO */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Detalhes Básicos
              </h2>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tênis Runner Pro"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800"
                  required
                />
              </div>

              {/* Subcategoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria ({categoriaPaiNome || 'Carregando'})
                </label>
                <select
                  value={subcategoriaNome}
                  onChange={(e) => setSubcategoriaNome(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md appearance-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Selecione a Subcategoria</option>
                  {subcategoriasDisponiveis.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço e Estoque */}
              <div className="grid grid-cols-2 gap-4">
                {/* Preço */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço (R$)
                    </label>
                    <input
                        type="number"
                        placeholder="0.00"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800"
                        required
                    />
                </div>

                {/* Estoque */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estoque
                    </label>
                    <input
                        type="number"
                        placeholder="Quantidade"
                        value={estoque}
                        onChange={(e) => setEstoque(e.target.value)}
                        className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800"
                        required
                    />
                </div>
              </div>


              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalhes, materiais, usos, etc."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 text-lg text-gray-800 resize-none"
                />
              </div>

            </div>

            {/* LADO DIREITO: MÍDIA */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Mídia e Imagens (Máx. 4)
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, index) => (
                  <FileDropzone
                      key={index}
                      label={index === 0 ? "Foto 1 (Principal)" : `Foto ${index + 1}`}
                      onFileSelect={(file) => handleFileSelect(index, file)}
                      preview={previews[index]}
                    />
                ))}
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