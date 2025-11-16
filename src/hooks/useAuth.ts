import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import AuthService from '../services/AuthService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para gerenciar autenticação
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          const userData = await AuthService.getCurrentUserData();
          setUser(userData);
          setFirebaseUser(firebaseUser);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setUser(null);
          setFirebaseUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await AuthService.login(email, password);
    return userData;
  };

  const register = async (email: string, password: string, displayName: string) => {
    const userData = await AuthService.register(email, password, displayName);
    return userData;
  };

  const logout = async () => {
    await AuthService.logout();
  };

  const sendPasswordResetEmail = async (email: string) => {
    await AuthService.sendPasswordResetEmail(email);
  };

  const updateProfile = async (displayName?: string, photoURL?: string) => {
    await AuthService.updateUserProfile(displayName, photoURL);
    // Recarrega os dados do usuário após atualização
    const userData = await AuthService.getCurrentUserData();
    setUser(userData);
  };

  return {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    sendPasswordResetEmail,
    updateProfile,
  };
};

/**
 * Provider do contexto de autenticação
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authData = useAuth();
  
  const value: AuthContextType = {
    ...authData,
    isAuthenticated: !!authData.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
