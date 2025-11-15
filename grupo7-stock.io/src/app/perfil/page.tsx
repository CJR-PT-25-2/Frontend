"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function PerfilRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Se não houver token, redireciona para a página de login
    if (!token) {
      // ⚠️ Ajuste a rota de login conforme a sua aplicação
      router.replace("/login"); 
      return;
    }

    // Se houver token, busca o ID do usuário logado
    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const userId = res.data.id; // Supondo que o backend retorna o ID
        if (userId) {
          // Redireciona para o perfil específico, usando o ID na URL
          router.replace(`/perfil/${userId}`);
        } else {
          // Se não conseguir o ID, redireciona para login
          router.replace("/login"); 
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do usuário logado:", error);
        // Em caso de erro (token inválido/expirado), redireciona para login
        router.replace("/login"); 
      });

  }, [router]);

  // Enquanto o redirecionamento ocorre
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f4eb]">
      <p className="text-xl">Acessando seu perfil...</p>
    </div>
  );
}