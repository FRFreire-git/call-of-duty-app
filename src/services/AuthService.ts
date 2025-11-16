import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';
import { User } from '../types';

/**
 * Serviço de Autenticação
 * Gerencia todas as operações relacionadas à autenticação do usuário
 */
class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Atualiza o perfil com o nome de exibição
      await updateProfile(userCredential.user, { displayName });

      // Cria documento do usuário no Firestore
      const userData: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName,
        photoURL: null,
        createdAt: new Date(),
      };

      await setDoc(doc(firestore, 'users', userCredential.user.uid), userData);

      return userData;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Faz login do usuário
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Busca dados do usuário no Firestore
      const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
        } as User;
      } else {
        // Se não existe documento, cria um com os dados básicos
        const userData: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date(),
        };

        await setDoc(doc(firestore, 'users', userCredential.user.uid), userData);
        return userData;
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw error;
    }
  }

  /**
   * Atualiza o perfil do usuário
   */
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('Usuário não está logado');
      }

      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });

      // Atualiza também no Firestore
      await setDoc(
        doc(firestore, 'users', auth.currentUser.uid),
        {
          displayName,
          photoURL,
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Busca dados completos do usuário atual
   */
  async getCurrentUserData(): Promise<User | null> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
        } as User;
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }
}

export default new AuthService();
