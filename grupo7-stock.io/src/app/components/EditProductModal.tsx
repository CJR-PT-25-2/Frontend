"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";


const CATEGORIAS_SUBCATEGORIAS: Record<string, string[]> = {
  Mercado: ["Hortifruti", "Limpeza", "Padaria", "Adega", "Bebidas", "Açogue", "Mercearia", "Outros"],
  Farmacia: ["Medicamentos", "Higiene", "Cosméticos", "Outros"],
  Beleza: ["Skincare", "Maquiagem", "Cabelo", "Corpo", "Outros"],
  Brinquedo: ["Boneca", "Carrinho", "Legos", "Pelúcia", "Outros"],
  Moda: ["Vestido", "Blusa", "Calça", "Sapato", "Outros"],
  Casa: ["Cozinha", "Sala", "Quarto", "Banheiro", "Outros"],
  Eletronicos: ["Celulares", "Notebooks", "TVs", "Acessórios", "Outros"],
  Jogos: ["Eletrônicos", "Tabuleiro", "Outros"],
  Outros: ["Diversos"],
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


interface ProdutoData {
    id: number;
    nome: string;
    preco: string;
    estoque: string;
    descrição: string;
    Loja: {
        id: number;
        donoId: number;
    };
    Categoria: {
        nome: string;
    };
    imagem1_url?: string;
    imagem2_url?: string;
    imagem3_url?: string;
    imagem4_url?: string;
}


interface EditProductModalProps {
    id: string; 
    onClose: () => void;
    onSaveSuccess: (produtoAtualizado: ProdutoData) => void;
}


export default function EditProductModal({ id, onClose, onSaveSuccess }: EditProductModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [produto, setProduto] = useState<ProdutoData | null>(null);
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
    newPreviews[index] = newFile 
        ? URL.createObjectURL(newFile) 
        : (previews[index] && previews[index]!.startsWith('blob:') ? null : previews[index]); 
    
    
    if (previews[index] && previews[index]!.startsWith('blob:') && !newFile) {
        URL.revokeObjectURL(previews[index]!);
    }

    setPreviews(newPreviews);
  };
  
 
  useEffect(() => {
    if (!id) return;
    
    
    let urlsToRevoke: string[] = [];

    async function fetchData() {
      try {
        
        const produtoRes = await fetch(`http://localhost:3001/produto/${id}`);
        if (!produtoRes.ok) {
            throw new Error("Produto não encontrado ou erro na API.");
        }
        const produtoData: ProdutoData = await produtoRes.json();
        setProduto(produtoData); 
        
        console.log("Dados do Produto Recebidos:", produtoData);
        console.log("Descrição Recebida:", produtoData.descrição);
        
        setNome(produtoData.nome);
        setPreco(String(produtoData.preco));
        setEstoque(String(produtoData.estoque));
        setDescricao(produtoData.descrição || ""); 
        setSubcategoriaNome(produtoData.Categoria.nome);
        setLojaId(String(produtoData.Loja.id));
        
        
        const currentUrls = [
            produtoData.imagem1_url,
            produtoData.imagem2_url,
            produtoData.imagem3_url,
            produtoData.imagem4_url,
        ];
        
        const initialPreviews = currentUrls.map(url => url ? `http://localhost:3001${url}` : null);
        setPreviews(initialPreviews);
        
        
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

    return () => {
        previews.forEach(url => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    };
  }, [id]);
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!produto || !isDono) {
        alert("Acesso negado ou dados incompletos.");
        return;
    }
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
        } else if (previews[index] === null && produto![`imagem${index + 1}_url` as keyof ProdutoData]) {
            
            form.append(`remove_imagem${index + 1}`, 'true'); 
        }
    });

    try {
        
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3001/produto/${id}`, {
            method: "PATCH",
            body: form,
             headers: { 
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("ERRO BRUTO:", text);
            alert("Erro ao editar produto! Verifique o console.");
            return;
        }

        const data: ProdutoData = await res.json();
        alert("Produto editado com sucesso!");
       
        onSaveSuccess(data); 
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor.");
    }
  };


  const excluirProduto = useCallback(async () => {
    if (!produto || !user || user.id !== produto.Loja.donoId) {
        alert("Erro: Você não tem permissão para excluir este produto.");
        return;
    }

    const confirmado = window.confirm(
        `Tem certeza que deseja excluir o produto "${produto.nome}"? Esta ação é irreversível.`
    );
    if (!confirmado) return;

    try {
        const token = localStorage.getItem("token");

        await api.delete(`/produto/${produto.id}`, { headers: { Authorization: `Bearer ${token}` } });
        
        alert(`Produto "${produto.nome}" excluído com sucesso!`);
        
        router.push(`/loja/${lojaId}`); 
        onClose(); 
        
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert("Erro ao excluir o produto. Verifique sua permissão.");
    }
  }, [produto, lojaId, user, router, onClose]);


  
  const isDono = user && produto && produto.Loja && user.id === produto.Loja.donoId;


  if (loading || !id) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <h1 className="text-xl text-gray-200 p-8 bg-black rounded-lg shadow-xl">Carregando dados do produto...</h1>
        </div>
    );
  }
  if (error) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-[1000]">
          <div className="p-8 bg-white rounded-lg shadow-xl text-center">
              <h1 className="text-2xl text-red-600 mb-4">❌ Erro de Carregamento</h1>
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
          <h1 className="text-3xl font-bold text-black text-left">Editar Produto: {nome}</h1>

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
                <p className="text-sm">Você não é o proprietário deste produto e só pode visualizar os dados.</p>
            </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-8 text-left">
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
                  disabled={!isDono}
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
                  disabled={!isDono}
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
                        disabled={!isDono}
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
                        disabled={!isDono}
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
                  disabled={!isDono}
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
                      onFileSelect={(file) => { if(isDono) handleFileSelect(index, file); }}
                      preview={previews[index]}
                    />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* BOTÃO DE EXCLUSÃO DE PRODUTO */}
            {isDono && (
                <button
                    type="button"
                    onClick={excluirProduto}
                    className="w-full md:w-auto bg-red-100 text-red-600 text-lg font-semibold py-3 px-6 rounded-xl shadow-md border border-red-300 hover:bg-red-200 transition"
                >
                    Excluir Produto
                </button>
            )}

            {/* BOTão DE SALVAR ALTERAÇÕES */}
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