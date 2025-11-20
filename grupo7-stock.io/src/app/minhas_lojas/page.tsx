"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/app/components/navbar";
import api from "@/lib/api";
import { User } from "@/types";

export default function MinhasLojasPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [lojas, setLojas] = useState<any[]>([]);
  const router = useRouter();
  console.log("USER:", user);
  console.log("LOADING:", loading);


  useEffect(() => {
  if (!loading && isAuthenticated && user) {
    const url = `http://localhost:3001/loja/usuario/${user.id}`;
    console.log("Fazendo requisição para:", url);

    fetch(url)
      .then((res) => {
        console.log("Status da resposta:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Resposta da API /loja/usuario:", data);
        setLojas(data);
      })

      .catch((err) => console.error("Erro no fetch:", err));
  }
}, [loading, isAuthenticated, user]);


  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-black p-10">
      <h1 className="text-4xl text-center font-bold text-white mb-10">
        Minhas Lojas
      </h1>

      <div className="space-y-4 max-w-3xl mx-auto">
        {lojas.map((loja) => (
          <div
            key={loja.id}
            onClick={() => router.push(`/loja/${loja.id}`)}
            className="flex items-center gap-4 bg-gray-300 rounded-xl p-4 cursor-pointer hover:bg-gray-200 transition shadow-md"
          >
            {/* Foto de perfil da loja */}
            <img
              src={
                loja.perfil_url
                  ? `http://localhost:3001${loja.perfil_url}`
                  : "/placeholder.png"
              }
              alt={loja.nome}
              className="w-16 h-16 rounded-full object-cover border-2 border-white"
            />

            {/* Nome */}
            <span className="text-2xl text-black font-semibold">
              {loja.nome}
            </span>

            {/* Botão visualizar(aparece apenas se for o dono) */}
            {user && loja.donoId === Number(user.id) && (
              <button
                onClick={(e) => {
                  //e.stopPropagation(); // impede abrir página ao clicar
                  router.push(`/loja/${loja.id}`);
                }}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
