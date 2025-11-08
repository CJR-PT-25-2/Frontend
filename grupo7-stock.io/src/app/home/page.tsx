"use client";

import Navbar from "../components/navbar";

export default function FeedPage() {
    return (
        <>
        <Navbar />
        <div className="flex justify-center items-center h-60 bg-[#000000] text-white">
           <div className=" text-white">
             <h1 className="text-4xl font-bold leading-snug pl-20 pt-15 ">
                  Do CAOS à organização,
             </h1>
             <h1 className="text-4xl font-bold leading-snug pl-45 pb-10">
                em alguns cliques!
             </h1>   
           </div>
           <div className=" h-full relative ml-8">
                 <img src="/images/Mascote1.png" alt ="Mascote" className = " w-130 h-130 object-contain pr-20"/>
           </div>
           
        </div> 
        <div className=" relative z-10 bg-[#F6F3E4] h-300">


        </div>
        </>
        
    )
}