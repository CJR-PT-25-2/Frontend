"use client";

import { useRouter } from "next/navigation";

interface Avaliacao {
  id: number;
  nota: number;
  comentario: string;
}

interface AvaliacoesModalProps {
  avaliacoes: Avaliacao[];
  produtoId: string;
  onClose: () => void;
}

export default function AvaliacoesModal({ avaliacoes, produtoId, onClose }: AvaliacoesModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex justify-center items-center z-[999]">
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-2xl relative border border-gray-200">

        <h2 className="text-2xl font-bold mb-4 text-gray-900">Avaliações do Produto</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 hover:text-black text-xl font-bold"
        >
          ✕
        </button>

        {avaliacoes?.length > 0 ? (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {avaliacoes.map((a) => (
              <div
                key={a.id}
                className="border-b pb-3 hover:bg-gray-50 transition-all rounded-lg cursor-pointer p-2"
                onClick={() => router.push(`/produto/${produtoId}/comentario/${a.id}`)}
              >

                {/* Estrelas */}
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={star <= a.nota ? "#facc15" : "#e5e7eb"}
                      className="w-6 h-6"
                    >
                      <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848 1.417 8.267L12 18.896l-7.417 4.967L6 15.596 0 9.748l8.332-1.593z"/>
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700">{a.comentario}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Ainda não há avaliações para este produto.</p>
        )}
      </div>
    </div>
  );
}
