"client use";

interface CaixaProdProps {
    id: number;
    nome: string;
    preco: number;
    imagemUrl?: string;
    disponivel: boolean;
    lojaURL?: string;
    quantidade?: number;
}

export default function Caixa_prod({ 
    id,
    nome,
    preco,
    imagemUrl,
    disponivel,
    lojaURL,
    quantidade,
 
}: CaixaProdProps) {

    const precoValido = typeof preco === 'number' ? preco : 0; //Caso preco n seja um numero, atribui 0
    const precoFormatado = precoValido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const placeholderProduto = "/images/placeholder_produto.png"; 
    const placeholderLoja = "/images/placeholder_loja.png"; 
    const finalImageUrl = imagemUrl && imagemUrl.trim() !== '' ? imagemUrl : placeholderProduto;
    const finalLojaUrl = lojaURL && lojaURL.trim() !== '' ? lojaURL : placeholderLoja;

    return (
        <div className=" bg-white w-50 h-75 rounded-2xl shadow-lg p-4 flex flex-col flex-shrink-0 cursor-pointer hover:scale-105 ">
            <div className="relative items-center justify-center ">
                { finalImageUrl ? (
                <img src={finalImageUrl} alt={'Imagem do produto '} className=" w-40 h-40 object-contain mb-4"/>
                ) : (
                <div className=" w-40 h-40 bg-gray-200 flex items-center justify-center mb-4">
                    <span className="text-gray-500">Imagem não disponível</span>
                </div>
                )}
                <img src={finalLojaUrl} alt="logo" className="w-15 h-15 absolute
                                                                      top-0 right-0
                                                                      z-10"/>                                           
            </div>
            
            <div className="text-black  font-semibold text-lg mb-2 items-start">
                {nome}
        </div>
        <div className="text-black  font-semibold text-lg mb-2 items-start">
                {precoFormatado}
        </div>
        {disponivel ? (
            <div className="text-green-600 font-semibold">
                Disponível
            </div>
        ) : (
            <div className="text-red-600 font-semibold">
                Indisponível
            </div>
        )}
        </div>
    )

}