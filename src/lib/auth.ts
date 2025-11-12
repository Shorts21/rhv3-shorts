export interface User {
  id: string
  nome: string
  telefone: string
  perfil: 'rh' | 'supervisor' | 'colaborador' | 'bp_rh'
}

export interface AuthResponse {
  user: User | null
  error: string | null
}

export class AuthService {
  private currentUser: User | null = null
  private readonly STORAGE_KEY = 'luiza_user_session'

  constructor() {
    this.loadSessionFromStorage()
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  private loadSessionFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const user = JSON.parse(stored)
        // Validate that the user ID is a proper UUID
        if (user && user.id && this.isValidUUID(user.id)) {
          this.currentUser = user
        } else {
          console.warn('Invalid UUID found in stored session, clearing session')
          this.clearSession()
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
      this.clearSession()
    }
  }

  private saveSessionToStorage(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    this.currentUser = null
  }

  async login(nome: string, telefone: string): Promise<AuthResponse> {
    try {
      // Importar dinamicamente para evitar circular dependency
      const { supabase } = await import('./supabase')

      // Buscar usuário no banco de dados
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('ativo', true)
        .ilike('nome', nome)
        .eq('telefone', telefone)

      if (error) {
        console.error('Erro ao buscar usuário:', error)
        return {
          user: null,
          error: 'Erro ao conectar com o banco de dados.'
        }
      }

      if (!usuarios || usuarios.length === 0) {
        return {
          user: null,
          error: 'Usuário ou telefone incorretos. Tente novamente.'
        }
      }

      const usuario = usuarios[0]

      const user: User = {
        id: usuario.id,
        nome: usuario.nome,
        telefone: usuario.telefone,
        perfil: usuario.perfil as 'rh' | 'supervisor' | 'colaborador' | 'bp_rh'
      }

      this.currentUser = user
      this.saveSessionToStorage(user)

      return { user, error: null }
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return {
        user: null,
        error: 'Erro interno. Tente novamente.'
      }
    }
  }

  logout(): void {
    this.clearSession()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  isRH(): boolean {
    return this.currentUser?.perfil === 'rh'
  }

  isSupervisor(): boolean {
    return this.currentUser?.perfil === 'supervisor'
  }

  isBPRH(): boolean {
    return this.currentUser?.perfil === 'bp_rh'
  }

  canEvaluate(): boolean {
    return this.currentUser?.perfil === 'rh' || this.currentUser?.perfil === 'supervisor' || this.currentUser?.perfil === 'bp_rh'
  }

  isAdmin(): boolean {
    return this.currentUser?.perfil === 'rh' || this.currentUser?.perfil === 'bp_rh'
  }
}

export const authService = new AuthService()