"use client";

import Navbar from "../components/navbar";
import { GiFruitBowl } from "react-icons/gi";
import { GiMedicinePills } from "react-icons/gi";
import { GiLipstick } from "react-icons/gi";
import { GiLargeDress } from "react-icons/gi";
import { FaLaptop } from "react-icons/fa";
import { IoGameControllerSharp } from "react-icons/io5";
import { TbHorseToy } from "react-icons/tb";
import { FaHouseChimneyWindow } from "react-icons/fa6";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa";


export default function FeedPage() {
    return (
        <>
        <Navbar />
        <div className="flex justify-center items-center h-60 bg-[#000000] text-white">
           <div className=" text-white">
             <h1 className="text-4xl font-bold leading-snug pl-20 pt-15 ">
                  O UNIVERSO culinário,
             </h1>
             <h1 className="text-4xl font-bold leading-snug pl-60 pb-10">
                em so lugar!
             </h1>   
           </div>
           <div className=" h-full relative ml-8">
                 <img src="/images/Mascote3.png" alt ="Mascote" className = " w-130 h-130 object-contain pr-20"/>
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
                Frutas
            </button>
            < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Doces
            </button>
            < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Bebidas
            </button>
            < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                Salgados
            </button>
            

                        
          </div>

        </div>
        </>
        
    )
}