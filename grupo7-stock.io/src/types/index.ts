export interface Imagens_produto {
  id: number;
  ordem: number;
  Img_URL: string; 
  produto_id: number;
  categoria_id: number;
}

export interface Produto {
  id: number;
  loja_id: number;
  categoria_id: number;
  nome: string;
  descrição: string; 
  donoId?: number;
  preco: number;
  estoque: number;
  imagens: Imagens_produto[]; 
}

export interface Loja {
  id: number;
  nome: string;
  descricao?: string;
  categoriaId: number;
  donoId: number;
  banner_url?: string;
  sticker_url?: string;
  produtos: Produto[];
}
export interface User {
  id: string | number; 
  name: string;
  username: string;
  email: string;
  foto_perfil_URL?: string;
  loja?: Loja; 
}