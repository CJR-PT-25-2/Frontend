"use client";

import Navbar from "../../components/navbar";
import { FaMagnifyingGlass } from "react-icons/fa6";


export default function FeedPage() {
    return (
        <>
            <Navbar />
            <div className="flex justify-end items-center h-65 bg-[#000000] text-white pr-25">
                <div className="text-white text-right pr-5">
                    <h1 className="text-4xl leading-snug pt-15">
                        O UNIVERSO do <strong className="font-bold">lar</strong>,
                    </h1>
                    <h1 className="text-4xl leading-snug pb-10">
                        em um só lugar!
                    </h1>
                </div>

                <div className="h-full relative ml-10">
                    <img
                        src="/images/Mascote1.png" alt="Mascote" className="w-140 h-140 object-contain"
                    />
                </div>

            </div>

            <div className=" relative z-10 bg-[#F6F3E4] h-300  pl-10 pt-10 ">
                <div className="  text-2xl font- League Spartan text-black">
                    <div className=" flex items-center justify-end pr-5 pb-5">
                        <div className="flex bg-white text-[#982829] rounded-2xl w-130 h-12 p-2">
                            <input
                                type="text"
                                placeholder="Procurar por..."
                                className=" bg-transparent outline-none w-full h-full text-black px-2
                            placeholder: text-[#982829] 
                            placeholder: text-sm"
                            />
                            <button className=" text-white rounded-2xl px-4 py-2 hover:scale-105 cursor-pointer">
                                <FaMagnifyingGlass size={20} className="ml-2 text-[#982829]" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className=" flex space-x-8  items-center   overflow-x-auto whitespace-nowrap">
                    < button className=" h-10 w-20 text-[#982829] bg-white  rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                        Bonecas
                    </button>
                    < button className=" h-10 w-24 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                        Carrinhos
                    </button>
                    < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                        Legos
                    </button>
                    < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                        Pelúcias
                    </button>
                    < button className=" h-10 w-20 text-[#982829] bg-white rounded-2xl hover:scale-105 cursor-pointer pl-10 pr-10 flex items-center justify-center">
                        Outros
                    </button>



                </div>

            </div>
        </>

    )
}