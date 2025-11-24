import EditarLojaClient from "@/app/loja/[id]/editar/EditarLojaClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  return <EditarLojaClient id={id} />;
}
