// src/app/criarloja/page.tsx
"use client";
import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
// O import 'useParams' foi removido pois não é usado na página

// --- Componente auxiliar FileDropzone (mantido) ---
const FileDropzone = ({ label }: { label: string }) => (
  
  <div 
    className="border-2 border-dashed border-purple-400 bg-purple-50 p-6 rounded-xl text-center cursor-pointer hover:bg-purple-100 transition-colors h-full flex flex-col justify-center"
  >
    <div className="flex flex-col items-center space-y-2">
      <svg 
        className="w-10 h-10 text-purple-600" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.884-7.884A5 5 0 0115 6a5 5 0 014.884 4.116A4 4 0 0120 16v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z"></path>
      </svg>
      <p className="text-sm font-medium text-purple-800">{label}</p>
    </div>
    <input type="file" className="hidden" />
  </div>
);

// --- Componente principal CriarLojaPage ---
export default function CriarLojaPage() {
  const router = useRouter();
  // const params = useParams(); // REMOVIDO: Não é usado nesta página.
  
  const [nomeLoja, setNomeLoja] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricaoLoja, setDescricaoLoja] = useState('');
  
  const { isAuthenticated, user, loading } = useAuth(); // Removido 'logout', pois não é usado

  // 1. Redirecionamento se não estiver autenticado
  useEffect(() => {
    // Se o carregamento terminou e o usuário NÃO está autenticado, redireciona para login/home
    if (!loading && !isAuthenticated) {
      router.push('/login'); // Ou a rota que você usa para login
    }
  }, [loading, isAuthenticated, router]);

  // 2. Função de Submissão
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      return;
    }
    // Lógica real de envio de dados e arquivos aqui.
    console.log("Dados da Loja para API:", { nomeLoja, categoria, descricaoLoja, donoId: user.id });
    alert(`Tentativa de criar loja: ${nomeLoja}`); 
    // Após sucesso: router.push(`/perfil/${user.id}`);
  };

  // 3. Renderização Condicional durante o carregamento
  if (loading || !isAuthenticated) {
    // Mostra uma tela de carregamento ou vazia enquanto a autenticação é verificada
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h1 className="text-xl text-gray-500">Verificando autenticação...</h1>
        </div>
    );
  }

  // 4. Renderização do Formulário (Apenas se autenticado)
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl">
        
        {/* Título e Botão de Fechar/Voltar */}
        <div className="flex justify-between items-center mb-10 border-b pb-4">
          <h1 className="text-3xl font-bold text-black">Adicionar Loja</h1>
          <button 
            // CORREÇÃO: Verifica se 'user' existe antes de acessar 'user.id'
            onClick={() => router.push(`/perfil/${user?.id}`)} 
            className="text-gray-500 hover:text-gray-900 transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Detalhes da Loja</h2>

              {/* Nome da Loja */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja (Obrigatório)</label>
                <input
                  type="text"
                  id="nome"
                  placeholder="Ex: Rare Beauty"
                  value={nomeLoja}
                  onChange={(e) => setNomeLoja(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-purple-500 text-lg text-gray-800"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria Principal</label>
                <div className="relative">
                  <select
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-3 border-0 rounded-xl shadow-md appearance-none focus:ring-2 focus:ring-purple-500 text-lg text-gray-800 bg-white cursor-pointer"
                    required
                  >
                    <option value="" disabled>Selecione uma categoria</option>
                    <option value="alimentos">Alimentos e Bebidas</option>
                    <option value="roupas">Roupas e Moda</option>
                    <option value="arte">Arte e Artesanato</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Descrição da Loja */}
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                <textarea
                  id="descricao"
                  rows={4}
                  placeholder="Fale um pouco sobre sua loja e seus produtos..."
                  value={descricaoLoja}
                  onChange={(e) => setDescricaoLoja(e.target.value)}
                  className="w-full p-3 border-0 rounded-xl shadow-md focus:ring-2 focus:ring-purple-500 text-lg text-gray-800 resize-none"
                />
              </div>

            </div>
            
            {/* COLUNA 2: Uploads de Imagens (Expandido) */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Identidade Visual</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foto de Perfil */}
                <FileDropzone label="Foto de perfil de sua loja" />
                
                {/* Logo em SVG */}
                <FileDropzone label="Logo em SVG de sua loja" />
              </div>

              {/* Banner (Ocupa a largura total da coluna) */}
              <div className="h-48"> 
                <FileDropzone label="Anexe o banner de sua loja (Horizontal)" />
              </div>
          </div>
          </div>
          
          {/* Botão Adicionar (Rodapé e largura total) */}
          <div className="pt-8 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white text-xl font-semibold py-4 rounded-xl shadow-lg hover:bg-purple-700 transition"
            >
              Adicionar Loja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}