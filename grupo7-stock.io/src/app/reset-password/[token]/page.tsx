"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();

  // O useParams pega o valor da pasta [token]
  const token = params.token as string;

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    // Validações básicas no front
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      // ATENÇÃO: Os nomes dos campos AQUI devem ser iguais ao seu DTO no NestJS (ResetPasswordDto)
      await axios.post("http://localhost:3001/auth/reset-password", {
        resetPasswordToken: token,
        novaSenha: novaSenha,
        confirmarSenha: confirmarSenha,
      });

      setMensagem(
        "Senha atualizada com sucesso! Redirecionando para o login..."
      );

      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push("/login"); // Coloque a rota correta do seu login
      }, 3001);
    } catch (error: any) {
      console.error(error);
      setErro(
        error.response?.data?.message ||
          "Ocorreu um erro ao redefinir a senha. O link pode ter expirado."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4eaa8] items-center justify-center font-sans">
      <div className="bg-[#1C1C1C] text-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-6 text-center text-[#D79B4E]">
          Criar Nova Senha
        </h2>

        {mensagem && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm text-center">
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label className="block text-xs text-gray-400 ml-2 mb-1">
              Nova Senha
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm border border-transparent focus:border-[#D79B4E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 ml-2 mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm border border-transparent focus:border-[#D79B4E]"
              required
            />
          </div>

          {erro && <p className="text-red-400 text-xs text-center">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-2 mt-2 bg-[#D79B4E] text-white rounded-full transition font-semibold 
              ${
                carregando
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#c38a43]"
              }`}
          >
            {carregando ? "Atualizando..." : "Confirmar Mudança"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-xs text-gray-400 hover:text-[#D79B4E]"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
}
