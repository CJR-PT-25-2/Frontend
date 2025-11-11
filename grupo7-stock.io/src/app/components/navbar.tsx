'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoBag } from "react-icons/io5";
import { FaStore } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import { IoMdExit } from "react-icons/io";

export default function Navbar(){
    const {isAuthenticated,user,logout} = useAuth();
    const router = useRouter();
    

    return(
        <header>
            <nav className=" bg-[#000000] text-white h-16 justify-between flex">
                        <button 
                        aria-label="feed"
                        className="p-2 rounded-full hover:scale-105 cursor-pointer "
                        onClick={() => router.push('/home')}>
                            <img
                            className="h-10 w-auto"
                            src="/images/logo.png"
                            alt="Logo"
                        />
                        </button>   
                <div className="justify-between flex items-center pr-10">
                    <button className="mr-6 cursor-pointer hover:text-[#d6993c] hover:scale-105">
                        <IoBag size={30}/>

                    </button>
                     <button className="mr-6 cursor-pointer hover:text-[#d6993c] hover:scale-105">
                         <FaStore size={28} />

                    </button>

                    {isAuthenticated ? (
                        <div>
                            <button className="mr-6 cursor-pointer hover:text-[#d6993c] hover:scale-105">
                            <IoMdPerson size={30} />
                        </button>

                        <button className="mr-6 cursor-pointer hover:text-[#d6993c] hover:scale-105"
                                onClick={() => logout}>
                            <IoMdExit size={30}/>
                        </button>
                        </div>   
                    ) : (
                       <div>
                        <button 
                        className="mr-6 w-10 cursor-pointer hover:text-[#d6993c] hover:scale-105 "
                        onClick={() => router.push('/login')}>
                            Login
                        </button> 
                        <button 
                        className="mr-6 w-30 cursor-pointer hover:text-[#d6993c] bg-[#325862] rounded-full hover:scale-105 "
                        onClick={() => router.push('/login')}>
                            Cadastre-se
                        </button> 
                        </div>
                    )}
                  
                </div>
            </nav>



        </header>


    )


}