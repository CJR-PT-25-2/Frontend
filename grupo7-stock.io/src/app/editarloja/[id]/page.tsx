"use client";
import React from 'react';
import { useParams } from 'next/navigation';

export default function EditarLojaPage() {
  const params = useParams();
  const lojaId = params.id; 

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-black">
        Página de Edição da Loja #{lojaId}
      </h1>
    </div>
  );
}