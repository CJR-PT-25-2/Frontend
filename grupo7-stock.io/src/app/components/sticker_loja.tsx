"client use";

import { useRouter } from "next/navigation";

interface CaixaLojaProps {
    id: number;
    nome: string;
    descricao: string;
    dono?: string;
    sticker_URL: string;
    categoria: string;
}

export default function Sticker_loja({
    id,
    nome,
    descricao,
    dono,
    categoria,
    sticker_URL,
}: CaixaLojaProps) {

    const placeholderloja = "/images/placeholder_loja.png"; 

    const router = useRouter();

    const handleNavegationloja = () =>{
        router.push(`loja/${id}`);
    }


    return (
        <div className="items-center w-40 h-auto p-4 flex flex-col flex-shrink-0 ">
            <button className=" rounded-full overflow-hidden w-30 h-30 itens-center justify-center mb-2 cursor-pointer hover:scale-105" onClick={handleNavegationloja}>
                <img src={sticker_URL ? `http://localhost:3001${sticker_URL}` : placeholderloja} alt={'Imagem da loja '} className=" w-full h-full object-cover mb-4"/>
            </button>
        <div className="text-black  font-semibold text-lg mb-2 items-start">
                {nome}
         </div>
          <div className="text-[#d6993c]  font-semibold text-lg mb-2 items-start  ">
                {categoria}
         </div>

        </div>
       

    )
}