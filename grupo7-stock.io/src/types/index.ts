export interface User {
  id: string | number; // Use 'string' se for um UUID ou 'number' se for um ID sequencial.
  nome: string;
  username: string;
  email: string;
  fotoUrl?: string; // O ponto de interrogação indica que o campo é opcional.
  // Adicione aqui outros campos relevantes para o seu perfil.
  // Exemplo:
  // bio?: string;
  // dataRegistro: Date;
}