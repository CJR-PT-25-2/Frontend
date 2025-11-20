"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function EditarLojaClient({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loja, setLoja] = useState<any>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/loja/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLoja(data);
        setNome(data.nome);
        setDescricao(data.descricao);
      });
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const form = new FormData();
    form.append("nome", nome);
    form.append("descricao", descricao);
    if (file) form.append("file", file);

    await fetch(`http://localhost:3001/loja/${id}`, {
      method: "PATCH",
      body: form,
    });

    router.push(`/loja/${id}`);
  };

  if (!loja) return <p>Carregando...</p>;

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Editar Loja</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="p-3 rounded text-black w-full"
          placeholder="Nome da loja"
        />

        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="p-3 rounded text-black w-full"
          placeholder="Descrição"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700"
          type="submit"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
