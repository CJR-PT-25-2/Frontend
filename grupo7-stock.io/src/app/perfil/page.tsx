"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function PerfilRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    
    if (!token) {
      
      router.replace("/login"); 
      return;
    }

    
    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const userId = res.data.id;
        if (userId) {
          
          router.replace(`/perfil/${userId}`);
        } else {
          
          router.replace("/login"); 
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dados do usuário logado:", error);
        
        router.replace("/login"); 
      });

  }, [router]);

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f4eb]">
      <p className="text-xl">Acessando seu perfil...</p>
    </div>
  );
}