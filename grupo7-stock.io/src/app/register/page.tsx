import Image from "next/image";

export default function CadastroPage() {
  return (
    <div className="flex h-screen bg-[#f4eaa8]">
      
      <div className="flex flex-col justify-end items-center w-[55%] relative">
        
        <div className="bg-[#1C1C1C] text-white px-12 py-16 rounded-tl-[40px] rounded-tr-[40px] shadow-lg w-[75%] h-[550px] mt-auto flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-6 text-center">CRIE SUA CONTA</h1>
          
          <form className="w-full max-w-sm space-y-3 mx-auto">
            <input type="text" placeholder="Nome Completo" className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm" />
            <input type="text" placeholder="Username" className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm" />
            <input type="email" placeholder="Email" className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm" />
            <input type="password" placeholder="Senha" className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm" />
            <input type="password" placeholder="Confirmar Senha" className="w-full px-4 py-2 rounded-full bg-white text-black focus:outline-none text-sm" />

            <button type="submit" className="w-full bg-[#D79B4E] text-white py-2 rounded-full font-semibold mt-4 hover:bg-[#c38a43] transition text-sm">
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
      <div className="flex flex-col justify-center items-center w-[40%] pt-27">
        <Image src="/images/LOGO.png" alt="Logo da Empresa" width={400} height={180} className="mb-8" />
        <Image src="/images/Mascote5.png" alt="Personagem" width={330} height={180} />
      </div>
    </div>
  );
}

