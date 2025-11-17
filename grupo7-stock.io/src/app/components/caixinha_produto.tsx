"client use";


export default function Caixa_prod() {

    return (
        <div className=" bg-white w-50 h-75 rounded-2xl shadow-lg p-4 flex flex-col flex-shrink-0 cursor-pointer hover:scale-105 ">
            <div className="relative items-center justify-center ">
                <img src="/images/brownie-teste.jpg" alt="Produto" className=" w-40 h-40 object-contain mb-4"/>
                <img src="/images/cjr logo.png" alt="logo" className="w-15 h-15 absolute
                                                                      top-0 right-0
                                                                      z-10"/>                                           
            </div>
            
            <div className="text-black  font-semibold text-lg mb-2 items-start">
                bronwie teste
        </div>
        <div className="text-black  font-semibold text-lg mb-2 items-start">
                preço
        </div>
         <div className="text-[#C6E700]  font-semibold text-lg mb-2 text-sm pb-5 items-start">
                Disponivel
        </div>

        </div>
    )

}