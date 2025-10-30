"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroCampos, setErroCampos] = useState("");

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const router = useRouter();

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const fazerLogin = async () => {
    try {
      console.log("Usuário logado:", email);
      router.push("/home"); 
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErroEmail("");
    setErroSenha("");
    setErroCampos("");

    if (!email || !senha) {
      setErroCampos("Por favor, preencha todos os campos.");
      return;
    }

    if (!validarEmail(email)) {
      setErroEmail("Por favor, insira um email válido.");
      return;
    }

    await fazerLogin();
  };

  return (
    <div className="flex h-screen bg-[#f4eaa8]">
  {/*esquerda*/}
  <div className="flex flex-col justify-center items-center w-[40%] pt-13">
    <Image
      src="/images/LOGO.png"
      alt="Logo geral"
      width={400}
      height={180}
      className="mb-8"
    />
    <Image
      src="/images/moco2.png"
      alt="boneco"
      width={330}
      height={180}
    />
  </div>

  {/*espaço login*/}
  <div className="flex flex-col justify-end items-center w-[55%] relative">
    <div className="bg-[#1C1C1C] text-white px-12 py-16 rounded-tl-[40px] rounded-tr-[40px] shadow-lg w-[75%] h-[550px] mt-auto flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center">
        BEM VINDO DE VOLTA!
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-3 mx-auto"
      >
        {/* Campo de Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
        />
        {erroEmail && <p className="text-red-400 text-xs">{erroEmail}</p>}

        {/* Campo de Senha */}
        <div className="relative">
          <input
            type={senhaVisivel ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setSenhaVisivel(!senhaVisivel)}
            className="absolute right-4 top-2 text-xs text-gray-600"
          >
            {senhaVisivel ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {erroSenha && <p className="text-red-400 text-xs">{erroSenha}</p>}

        {/* Mensagem de erro geral */}
        {erroCampos && (
          <p className="text-red-400 text-xs text-center">{erroCampos}</p>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="w-full bg-[#D79B4E] text-white py-2 rounded-full font-semibold mt-4 hover:bg-[#c38a43] transition text-sm"
        >
          ENTRAR
        </button>

        {/* Link para cadastro */}
        <p className="text-s mt-2 text-left">
          Ainda não tem uma conta?{" "}
          <a href="/register" className="text-[#D79B4E] hover:underline">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  </div>
</div>

  );
}
