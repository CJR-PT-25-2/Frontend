"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User } from "@/types";

interface EditProfileModalProps {
  onClose: () => void; 
  onSaveSuccess: () => void; 
}

export default function EditProfileModal({ onClose, onSaveSuccess }: EditProfileModalProps) {
  const router = useRouter(); 

  const [perfil, setPerfil] = useState<User | null>(null);

  const [dadosForm, setDadosForm] = useState({
    name: "",
    username: "",
    email: "",
    senha: ""
  });

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [deletando, setDeletando] = useState(false); 
  const [carregando, setCarregando] = useState(true);

  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      
      router.replace("/login?redirect=/perfil/editar");
      return;
    }

    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setPerfil(res.data);

        setDadosForm({
          name: res.data.name || "",
          username: res.data.username || "",
          email: res.data.email || "",
          senha: res.data.senha || "",
        });

        if (res.data.foto_perfil_URL) {
            setPreviewUrl(`http://localhost:3001${res.data.foto_perfil_URL}`);
        }

        setCarregando(false);
      })
      .catch(() => router.replace("/login"));
  }, []);

  
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
      
      await api.patch(`/user/${perfil.id}`, dadosForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      if (fotoArquivo) {
        const formData = new FormData();
        formData.append("file", fotoArquivo); 

        const upload = await api.post(
          `/user/${perfil.id}/avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        
        if (upload.data.foto_perfil_URL) {
          setPerfil((prev) =>
            prev ? { ...prev, foto_perfil_URL: upload.data.foto_perfil_URL } : prev
          );
        }
      }

      alert("Perfil atualizado com sucesso!");
      
      onSaveSuccess();

    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  
  const apagarPerfil = useCallback(async () => {
    if (!perfil) return;

    const confirmacao = window.confirm(
      `ATENÇÃO! Você tem certeza que deseja APAGAR PERMANENTEMENTE sua conta? Esta ação é irreversível e excluirá todas as suas lojas e produtos.`
    );
    if (!confirmacao) return;

    const usernameConfirmado = window.prompt(
      `Para confirmar a exclusão, digite seu username: "${perfil.username}"`
    );
    
    if (usernameConfirmado?.toLowerCase() !== perfil.username.toLowerCase()) {
      alert("Username não corresponde. Exclusão abortada.");
      return;
    }

    setDeletando(true);
    const token = localStorage.getItem("token");
    
    try {
      await api.delete(`/user/${perfil.id}`, { headers: { Authorization: `Bearer ${token}` } });
      
      localStorage.removeItem("token");
      alert("Seu perfil e dados associados foram excluídos com sucesso.");
      router.replace("/login"); 

    } catch (error) {
      console.error("Erro ao apagar perfil:", error);
      alert("Erro ao apagar o perfil. Tente novamente ou entre em contato com o suporte.");
    } finally {
      setDeletando(false);
    }
  }, [perfil, router]);



  if (carregando || !perfil) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
        <div className="p-8 bg-white rounded-xl shadow-2xl">
          Carregando dados para edição...
        </div>
      </div>
    );
  }


  
  return (
    
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] overflow-y-auto py-10 px-6">
      
      {/* Container do Modal */}
      <div className="max-w-2xl w-full mx-auto bg-white p-8 rounded-xl shadow-lg relative my-auto"> 

          {/* BOTÃO DE FECHAR */}
          <button
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition p-2 rounded-full hover:bg-gray-100"
            disabled={salvando || deletando}
            title="Cancelar e Fechar"
          >
            <svg
              className="w-6 h-6"
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

          <h1 className="text-3xl font-bold mb-8 text-black">Editar Perfil</h1>

          <div className="flex items-center space-x-6 mb-8">
            <img 
            src={
              previewUrl
                ? previewUrl
                : perfil?.foto_perfil_URL
                  ? `http://localhost:3001${perfil.foto_perfil_URL}`
                  : "/images/iconepessoa.png"
            }
            alt="Foto de perfil atual"
            className="w-[100px] h-[100px] rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/images/iconepessoa.png";
            }}
          />


            <input
              type="file"
              id="file-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (!e.target.files?.length) return;

                const file = e.target.files[0];

                setFotoArquivo(file);

                if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);

                setPreviewUrl(URL.createObjectURL(file));
              }}
            />

            <label htmlFor="file-upload" className="cursor-pointer">
              <button
                type="button"
                className="bg-[#d6993c] text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Alterar Foto
              </button>
            </label>
          </div>

          {fotoArquivo && (
            <p className="text-sm text-gray-700 -mt-4 mb-4">
              Arquivo selecionado: **{fotoArquivo.name}**
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-black">Nome</label>
              <input
                type="text"
                name="name"
                value={dadosForm.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-100 text-gray-700"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-black">Username</label>
              <input
                type="text"
                name="username"
                value={dadosForm.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-100 text-gray-700"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                name="email"
                value={dadosForm.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 bg-gray-100 text-gray-700"
                //disabled
              />
            </div>

            {/* Senha */}
            <div>
                <label className="block text-sm font-medium text-black">Nova Senha</label>
                <input
                    type="senha"
                    name="senha"
                    value={dadosForm.senha}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 bg-gray-100 text-gray-700"
                />
            </div>

            {erro && <p className="text-red-500 text-sm">{erro}</p>}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className={`px-6 py-3 text-white rounded-lg transition ${
                  salvando ? "bg-black/50 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                }`}
                disabled={salvando || deletando}
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>

          {/* Seção de Apagar perfil*/}
          <div className="mt-10 pt-6 border-t border-gray-200">
            
            <button
              type="button"
              onClick={apagarPerfil}
              className={`w-full py-3 text-lg font-semibold rounded-lg transition border 
                ${deletando ? "bg-red-200 text-red-400 cursor-not-allowed" : "bg-white text-red-600 border-red-600 hover:bg-red-50"}
              `}
              disabled={deletando || salvando}
            >
              {deletando ? "Deletando..." : "Apagar Perfil Permanentemente"}
            </button>
          </div>
        </div>
    </div>
  );
}