"use client";

import Image from "next/image";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erroNome, setErroNome] = useState("");
  const [erroUsername, setErroUsername] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroConfirmarSenha, setErroConfirmarSenha] = useState("");
  const [erroCampos, setErroCampos] = useState("");

  const [popupAberto, setPopupAberto] = useState(false);
  const router = useRouter();

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);

  const validarSenhaSegura = (senha: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };
  const validarNomeCompleto = (nome: string) => {
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return regex.test(nome.trim());
  };
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErroNome("");
    setErroUsername("");
    setErroEmail("");
    setErroSenha("");
    setErroConfirmarSenha("");
    setErroCampos("");

    if (!nome || !email || !username || !senha || !confirmarSenha) {
      setErroCampos("Por favor, preencha todos os campos.");
      return;
    }
    if (!validarNomeCompleto(nome)) {
      setErroNome("Por favor, insira um nome completo válido.");
      return;
    }
    if (!validarEmail(email)) {
      setErroEmail("Por favor, insira um email válido.");
      return;
    }
    if (!validarSenhaSegura(senha)) {
      setErroSenha(
        "A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais."
      );
      return;
    }
    if (senha !== confirmarSenha) {
      setErroConfirmarSenha("As senhas não coincidem.");
      return;
    }

    try {
      await api.post("/user", {
        name: nome,
        username: username,
        email: email,
        senha: senha,
      });

      setPopupAberto(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao registrar usuário:", error);
      if (
        error.response?.data?.message?.includes("P2002") ||
        error.response?.status === 409
      ) {
        setErroEmail("Este email já está em uso.");
      } else {
        setErroCampos("Ocorreu um erro ao registrar. Tente novamente.");
      }
    }
  };
  return (
    <div className="flex h-screen bg-[#f4eaa8]">
      {/* Lado esquerdo - formulário */}
      <div className="flex flex-col justify-end items-center w-[55%] relative">
        <div className="bg-[#1C1C1C] text-white px-12 py-16 rounded-tl-[40px] rounded-tr-[40px] shadow-lg w-[75%] h-[550px] mt-auto flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-6 text-center">
            CRIE SUA CONTA
          </h1>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm space-y-3 mx-auto"
          >
            <input
              type="text"
              placeholder="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
            />
            {erroNome && <p className="text-red-400 text-xs">{erroNome}</p>}

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
            />
            {erroUsername && (
              <p className="text-red-400 text-xs">{erroUsername}</p>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
            />
            {erroEmail && <p className="text-red-400 text-xs">{erroEmail}</p>}

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
            />
            {erroSenha && <p className="text-red-400 text-xs">{erroSenha}</p>}

            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
            />
            {erroConfirmarSenha && (
              <p className="text-red-400 text-xs">{erroConfirmarSenha}</p>
            )}

            {erroCampos && (
              <p className="text-red-400 text-xs text-center">{erroCampos}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#D79B4E] text-white py-2 rounded-full font-semibold mt-4 hover:bg-[#c38a43] transition text-sm"
            >
              CRIAR CONTA
            </button>

            <p className="text-s mt-2 text-left">
              Já possui uma conta?{" "}
              <a href="/login" className="text-[#D79B4E] hover:underline">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex flex-col justify-center items-center w-[40%] pt-20 overflow-hidden " >
      <Image
        src="/images/LOGO.png"
        alt="Logo da Empresa"
        width={400}
        height={180}
        className="mb-8 object-contain cursor-pointer hover:scale-105"
        onClick={() => router.push('/')}
      />

      <div className="flex items-center justify-center w-full h-full">
        <Image
          src="/images/Mascote5.png"
          alt="Personagem"
          width={330}
          height={330}
          className="object-contain max-h-full"
          priority
        />
    </div>
</div>

      {popupAberto && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-scaleIn">
            <h2 className="text-2xl font-bold mb-2 text-[#1C1C1C]">
              Cadastro Bem-Sucedido!
            </h2>
            <p className="text-gray-700">
              Você será redirecionado para a página de login.
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
