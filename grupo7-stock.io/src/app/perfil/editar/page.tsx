"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";
import api from "@/lib/api";
import { User } from "@/types";

export default function EditarPerfilPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<User | null>(null);

  const [dadosForm, setDadosForm] = useState({
    name: "",
    username: "",
    email: ""
  });

  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // =========================
  // 🔹 Carregar dados do usuário
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?redirect=/perfil/editar");
      return;
    }

    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        console.log("📌 DADOS RECEBIDOS DO BACKEND:", res.data);

        setPerfil(res.data);

        setDadosForm({
          name: res.data.name || "",
          username: res.data.username || "",
          email: res.data.email || "",
        });

        setCarregando(false);
      })
      .catch(() => router.replace("/login"));
  }, []);

  // =========================
  // 🔹 Alterar dados textuais
  // =========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDadosForm({ ...dadosForm, [e.target.name]: e.target.value });
  };

  // =========================
  // 🔹 Salvar alterações
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    const token = localStorage.getItem("token");
    if (!token || !perfil) return;

    try {
      // 1. Atualizar dados textuais
      await api.patch(`/user/${perfil.id}`, dadosForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Enviar foto se houver
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

        console.log("📸 Upload retornou:", upload.data);

        // Atualiza a imagem no estado
        if (upload.data.foto_perfil_URL) {
          setPerfil((prev) =>
            prev ? { ...prev, foto_perfil_URL: upload.data.foto_perfil_URL } : prev
          );
        }
      }

      router.push(`/perfil/${perfil.id}`);

    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando || !perfil) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        Carregando dados para edição...
      </div>
    </>
  );
}


  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4eaa8] py-10 px-6">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">

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

                if (previewUrl) URL.revokeObjectURL(previewUrl);

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
              Arquivo selecionado: <strong>{fotoArquivo.name}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {erro && <p className="text-red-500 text-sm">{erro}</p>}

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-[#982829] text-white rounded-lg hover:bg-[#7a1f21] transition"
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`px-6 py-3 text-white rounded-lg transition ${
                  salvando ? "bg-black/50 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                }`}
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
