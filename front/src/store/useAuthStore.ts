import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  nombre: string;
  rol: string;
  mail: string;
  fotoPerfil?: string | null;
  grupoId?: number | null;
  esDemo?: boolean;
}

interface AuthState {
  /** Token activo de la sesión actual. Se limpia en logout. */
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  /**
   * Mapa de tokens de reinicio por rol: { "LECTOR": "jwt...", "MASTER": "jwt...", ... }
   * Persiste en localStorage incluso al hacer logout para permitir reutilizar
   * la misma cuenta demo al volver a hacer clic en el botón de acceso rápido.
   */
  reinitTokens: Record<string, string>;

  login: (token: string, user: User) => void;
  loginWithReinit: (token: string, user: User, reinitToken: string) => void;
  logout: () => void;
  getReinitToken: (rol: string) => string | null;
  clearReinitToken: (rol: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      reinitTokens: {},

      /** Login estándar (usuarios normales). */
      login: (token, user) => set({ token, user, isAuthenticated: true }),

      /**
       * Login con reinitToken para cuentas demo.
       * Guarda el reinitToken en el mapa por rol para reutilización futura.
       */
      loginWithReinit: (token, user, reinitToken) =>
        set((state) => ({
          token,
          user,
          isAuthenticated: true,
          reinitTokens: {
            ...state.reinitTokens,
            [user.rol]: reinitToken,
          },
        })),

      /**
       * Logout: elimina token activo y usuario, pero CONSERVA los reinitTokens.
       * Esto permite que al volver a hacer clic en "Acceder como X demo",
       * el sistema detecte el reinitToken y reutilice la cuenta existente
       * en lugar de crear una nueva.
       */
      logout: () =>
        set((state) => ({
          token: null,
          user: null,
          isAuthenticated: false,
          reinitTokens: state.reinitTokens, // Intencional: se mantienen
        })),

      /** Obtiene el reinitToken para un rol específico, o null si no existe. */
      getReinitToken: (rol: string) => get().reinitTokens[rol] ?? null,

      /**
       * Limpia el reinitToken de un rol específico.
       * Llamar cuando el reinitToken falló en el backend (expirado o inválido).
       */
      clearReinitToken: (rol: string) =>
        set((state) => {
          const nuevos = { ...state.reinitTokens };
          delete nuevos[rol];
          return { reinitTokens: nuevos };
        }),
    }),
    {
      name: 'auth-storage', // Key en localStorage
    }
  )
);
