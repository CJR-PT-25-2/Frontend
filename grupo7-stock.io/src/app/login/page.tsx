"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios"; // Alteração necessária: Importar axios

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroCampos, setErroCampos] = useState("");

  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [erroRecuperacao, setErroRecuperacao] = useState("");

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const { login } = useAuth();

  const router = useRouter();

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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

    try {
      await login(email, senha);
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErroCampos("Email ou senha inválidos. Tente novamente.");
    }
  };

  const handleEsqueceuSenha = () => {
    setErroRecuperacao(""); // Limpa o erro anterior do modal ao abrir
    setModalAberto(true);
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroRecuperacao("");

    if (!emailRecuperacao || !validarEmail(emailRecuperacao)) {
      setErroRecuperacao("Por favor, insira um email válido.");
      return;
    }

    // Lógica de integração com o backend:
    try {
      await axios.post("http://localhost:3001/auth/forgot-password", {
        email: emailRecuperacao,
      });

      alert(
        "Se o email estiver cadastrado, um link de recuperação será enviado!"
      );

      // Limpa o email e fecha o modal
      setEmailRecuperacao("");
      setModalAberto(false);
    } catch (error: any) {
      console.error("Erro ao solicitar recuperação:", error);
      // Alteração necessária: Capturar mensagem de erro do backend se existir
      const msgErro =
        error.response?.data?.message ||
        "Erro ao processar a solicitação. Tente novamente.";
      setErroRecuperacao(msgErro);
    }
  };

  return (
    <>
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

              {/* Mensagem de erro geral da tela de login */}
              {erroCampos && (
                <p className="text-red-400 text-xs text-center">{erroCampos}</p>
              )}

              {/* Botão */}
              <button
                type="submit"
                className="w-full bg-[#D79B4E] text-white py-2 rounded-full font-semibold mt-4 hover:bg-[#c38a43] transition text-sm courser-pointer"
              >
                ENTRAR
              </button>

              {/* Links de Cadastro e Esqueci a Senha */}
              <div className="flex flex-col space-y-1 text-sm mt-2">
                <p className="text-left text-sm">
                  Ainda não tem uma conta?{" "}
                  <a
                    href="/register"
                    className="text-[#D79B4E] hover:underline"
                  >
                    Cadastre-se
                  </a>
                </p>

                <button
                  type="button"
                  onClick={handleEsqueceuSenha}
                  className="text-[#D79B4E] hover:underline focus:outline-none text-sm text-left"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CÓDIGO DO MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1C1C1C] text-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Recuperar Senha
            </h2>

            <form onSubmit={handleRecuperarSenha}>
              <p className="text-sm mb-4 text-gray-400">
                Insira seu email para receber um link de redefinição de senha.
              </p>

              <input
                type="email"
                placeholder="Email"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                className="w-full px-4 py-2 mb-4 rounded-full bg-white text-black focus:outline-none text-sm"
              />

              {erroRecuperacao && (
                <p className="text-red-400 text-xs text-center mb-4">
                  {erroRecuperacao}
                </p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-sm text-gray-400 rounded-full hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#D79B4E] text-white rounded-full hover:bg-[#c38a43] transition font-semibold"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
