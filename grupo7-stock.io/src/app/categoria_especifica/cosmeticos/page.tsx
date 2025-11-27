"use client";

import Navbar from "../../components/navbar";
import { FaMagnifyingGlass } from "react-icons/fa6";


export default function FeedPage() {
    return (
        <>
        <Navbar />
        <div className="flex justify-center items-center h-65 bg-[#000000] text-white">
           <div className=" text-white">
             <h1 className="text-4xl leading-snug pl-20 pt-15 ">
                  O UNIVERSO da <strong className="font-bold">beleza</strong>,
             </h1>
             <h1 className="text-4xl leading-snug pl-56 pb-10">
                em um só lugar!
             </h1>   
           </div>
           <div className=" h-full relative ml-2">
                 <img src="/images/Mascote2.png" alt ="Mascote" className = " w-140 h-140 object-contain pr-15"/>
           </div>
           
        </div> 
        <div className=" relative z-10 bg-[#F6F3E4] h-300  pl-10 pt-10 ">
          <div className="  text-2xl font- League Spartan text-black">
            <div className=" flex items-center justify-end pr-5 pb-5">
              <div className="flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2">
              <input
                type = "text"
                placeholder="Procurar por..."
                className=" bg-transparent outline-none w-full h-full text-black px-2
                            placeholder: text-[#982829] 
                            placeholder: text-sm"
              />
              <button className=" text-white rounded-2xl px-4 py-2 hover:scale-105 cursor-pointer">
                <FaMagnifyingGlass size={20} className="ml-2 text-[#982829]"/>
              </button>
             </div>
            </div>
          </div>  
          <div className=" flex space-x-8  items-center   overflow-x-auto whitespace-nowrap">
            < button className=" h-10 w-20 text-[#982829] bg-white  rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Cabelo
            </button>
            < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Corpo
            </button>
            < button className=" h-10 w-22 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Skin Care
            </button>
            < button className=" h-10 w-26 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Maquiagem
            </button>
            < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Outros
            </button>
                        
          </div>

        </div>
        </>
        
    )
}