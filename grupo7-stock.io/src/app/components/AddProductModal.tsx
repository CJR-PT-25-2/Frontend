"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation"; 


interface AddProductModalProps {
    lojaId: string; 
    onClose: () => void;
    onSuccess: (newProduto: any) => void;
}

const CATEGORIAS_SUBCATEGORIAS: Record<string, string[]> = {
  Mercado: [
    "Hortifruti", "Limpeza", "Padaria", "Adega", "Bebidas", "Açougue", "Mercearia", "Outros",
  ],
  Farmacia: [
    "Medicamentos", "Higiene", "Cosméticos", "Outros",
  ],
  Beleza: [
    "Skincare", "Maquiagem", "Cabelo", "Corpo", "Outros",
  ],
  Brinquedo: [
    "Boneca", "Carrinho", "Legos", "Pelúcia", "Outros",
  ],
  Moda: [
    "Vestido", "Blusa", "Calça", "Sapato", "Outros",
  ],
  Casa: [
    "Cozinha", "Sala", "Quarto", "Banheiro", "Outros",
  ],
  Eletronicos: [
    "Celulares", "Notebooks", "TVs", "Acessórios", "Outros",
  ],
  Jogos: [
    "Consoles e Eletrônicos", "Tabuleiro", "Outros",
  ],
  Outros: [
    "Diversos",
  ],
};



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
          <p className="text-sm font-medium text-gray-700">Selecione o arquivo</p>
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


export default function AddProductModal({ lojaId, onClose, onSuccess }: AddProductModalProps) {
  const router = useRouter(); 
  
  
  const id = lojaId; 

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
    
    
    if (previews[index] && previews[index]!.startsWith('blob:')) URL.revokeObjectURL(previews[index]!);

    newPreviews[index] = newFile ? URL.createObjectURL(newFile) : null;
    setPreviews(newPreviews);
  };

  
  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      try {
        const lojaRes = await fetch(`http://localhost:3001/loja/${id}`);
        if (!lojaRes.ok) {
            throw new Error("Loja não encontrada ou erro na API.");
        }
        const lojaData = await lojaRes.json();
        let categoriaNomeAPI = lojaData.categoria.nome; 

        if (!categoriaNomeAPI) {
            throw new Error("Categoria principal da loja não definida. Verifique o findOne no LojaService.");
        }


        const normalizeName = (name: string) => 
            name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, ''); 


        const categoriaChave = normalizeName(categoriaNomeAPI); 
        const nomeExibicao = categoriaNomeAPI;

        const lista = CATEGORIAS_SUBCATEGORIAS[categoriaChave as keyof typeof CATEGORIAS_SUBCATEGORIAS];
        
        if (lista) {
        setSubcategoriasDisponiveis(lista);
        setCategoriaPaiNome(nomeExibicao); 
      }
        else {
          setError(`Nenhuma subcategoria mapeada para a categoria: ${categoriaNomeAPI}`);
        }
        
      } catch (err: any) {
        console.error("Erro no carregamento:", err);
        setError(err.message || "Não foi possível carregar as opções de subcategoria.");
        
        onClose(); 
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, onClose]); 

  
  useEffect(() => {
    return () => {
        previews.forEach(url => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    };
  }, [previews]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subcategoriaNome) {
        alert("Por favor, selecione uma subcategoria.");
        return;
    }
    if (!categoriaPaiNome) {
        alert("Erro interno: Categoria da loja não identificada.");
        return;
    }
    if (!files[0]) {
        alert("A foto principal (Foto 1) é obrigatória.");
        return;
    }


    const form = new FormData();
    form.append("nome", nome);
    form.append("preco", preco); 
    form.append("estoque", estoque);
    form.append("loja_id", String(id)); 
    form.append("descricao", descricao);
    
    form.append("subcategoria", subcategoriaNome); 
    form.append("categoriaPai", categoriaPaiNome);
    
    files.forEach((file, index) => {
        if (file) {
            form.append(`imagem${index + 1}`, file);
        }
    });

    try {
        const res = await fetch(`http://localhost:3001/produto`, {
            method: "POST",
            body: form,
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("ERRO BRUTO:", text);
            alert("Erro ao criar produto! Verifique o console.");
            return;
        }

        const newProduto = await res.json();
        alert("Produto criado com sucesso!");
        
        onSuccess(newProduto); 
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor.");
    }
  };

  
  if (loading || !id) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <h1 className="text-xl text-gray-200 p-8 bg-black rounded-lg shadow-xl">Carregando categorias da loja...</h1>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-[1000]">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center">
            <h1 className="text-2xl text-red-600 mb-4">Erro de Carregamento</h1>
            <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }


  return (
    
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] overflow-y-auto py-10 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl my-auto relative">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-black text-left">Adicionar Novo Produto</h1>

          <button
            onClick={onClose} 
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
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-green-500 text-lg text-gray-800"
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
                  className="w-full p-3 border-0 rounded-xl shadow-md appearance-none focus:ring-2 focus:ring-green-500 text-lg text-gray-800 bg-white cursor-pointer"
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

              {/* Preço e Estoque em GRID */}
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
                        className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-green-500 text-lg text-gray-800"
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
                        className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-green-500 text-lg text-gray-800"
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
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-green-500 text-lg text-gray-800 resize-none"
                />
              </div>

            </div>

            {/* LADO DIREITO: MÍDIA */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Mídia e Imagens (Máx. 4)
              </h2>

              {/* Mapeamento para exibir 4 dropzones */}
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

          {/* Botão de Criação */}
          <div className="pt-8 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-[#325862] text-white text-xl font-semibold py-4 rounded-xl shadow-lg hover:bg-[#2b4c53] transition"
            >
              Criar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}