"client use";

import { useRouter } from "next/navigation";

interface UsuarioProps {
    id: number;
    nome: string;
    Foto_Perfil_URL?: string;
}

export default function ModalUsuario({
    id,
    nome,
    Foto_Perfil_URL,
}: UsuarioProps) {

    const placeholderpessoa = "/images/iconepessoa.png"; 

    const router = useRouter();

    const handleNavegationusuario = () =>{
        router.push(`perfil/${id}`);
    }


    return (
        <div className="items-center w-40 h-auto p-4 flex flex-col flex-shrink-0 ">
            <button className=" rounded-full overflow-hidden w-30 h-30 itens-center justify-center mb-2 cursor-pointer hover:scale-105" onClick={handleNavegationusuario}>
                <img src={Foto_Perfil_URL ? `http://localhost:3001${Foto_Perfil_URL}` : placeholderpessoa} alt={'Imagem da loja '} className=" w-full h-full object-cover mb-4"/>
            </button>
        <div className="text-black  font-semibold text-lg mb-2 items-start">
                {nome}
         </div>

        </div>
       

    )
}