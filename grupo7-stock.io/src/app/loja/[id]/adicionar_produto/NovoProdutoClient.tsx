"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoProdutoClient({ id }: { id: string }) {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [estoque, setEstoque] = useState("");
  const [descricao, setDescricao] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const form = new FormData();
    form.append("nome", nome);
    form.append("preco", preco);
    form.append("loja_id", id); // ✔ Agora funciona
    form.append("categoria_id", categoriaId);
    form.append("estoque", estoque);
    form.append("descrição", descricao);
    if (file) form.append("file", file);

    await fetch(`http://localhost:3001/produto`, {
      method: "POST",
      body: form,
    });

    router.push(`/loja/${id}`); // ✔ Agora funciona
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Adicionar Produto</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          placeholder="Nome"
          className="p-3 rounded text-black w-full"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Preço"
          className="p-3 rounded text-black w-full"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <input
          placeholder="Categoria ID"
          className="p-3 rounded text-black w-full"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
        />

        <input
          placeholder="Estoque"
          className="p-3 rounded text-black w-full"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}
        />

        <textarea
          placeholder="Descrição"
          className="p-3 rounded text-black w-full"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <button className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700">
          Criar Produto
        </button>
      </form>
    </div>
  );
}
