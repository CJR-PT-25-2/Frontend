"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api'; 
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  nome: string; 
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me'); 
          setUser(response.data);
        } catch (error) {
          console.error("Token inválido, limpando.");
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUserFromToken();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);

      router.push('/home'); 
    } catch (error) {
      console.error("Erro no login:", error);
      // Lança o erro para que a página de login possa tratá-lo
      throw new Error('Falha no login');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};