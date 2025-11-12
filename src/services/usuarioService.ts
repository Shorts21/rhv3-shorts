import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface Usuario {
  id: string
  nome: string
  telefone: string
  perfil: 'rh' | 'supervisor' | 'colaborador' | 'bp_rh'
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface UsuarioForm {
  nome: string
  telefone: string
  perfil: 'rh' | 'supervisor' | 'colaborador' | 'bp_rh'
  ativo: boolean
}

export class UsuarioService {
  async getUsuarios(): Promise<Usuario[]> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome')

      if (error) {
        logger.error('Erro ao buscar usuários:', error)
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Erro no serviço getUsuarios:', error)
      return []
    }
  }

  async createUsuario(usuarioData: UsuarioForm): Promise<Usuario> {
    try {
      logger.info('Dados para inserção:', usuarioData)

      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nome: usuarioData.nome,
          telefone: usuarioData.telefone,
          perfil: usuarioData.perfil,
          ativo: usuarioData.ativo
        })
        .select('*')
        .single()

      if (error) {
        logger.error('Erro ao criar usuário:', error)
        logger.error('Mensagem:', error.message)
        logger.error('Detalhes:', error.details)
        logger.error('Hint:', error.hint)
        logger.error('Code:', error.code)
        throw error
      }

      logger.success('Usuário criado com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço createUsuario:', error)
      throw error
    }
  }

  async updateUsuario(id: string, usuarioData: UsuarioForm): Promise<Usuario> {
    try {
      logger.info('Atualizando usuário:', id, usuarioData)

      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nome: usuarioData.nome,
          telefone: usuarioData.telefone,
          perfil: usuarioData.perfil,
          ativo: usuarioData.ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        logger.error('Erro ao atualizar usuário:', error)
        logger.error('Detalhes:', error.message, error.details, error.hint)
        throw error
      }

      logger.success('Usuário atualizado com sucesso:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço updateUsuario:', error)
      throw error
    }
  }

  async deleteUsuario(id: string): Promise<void> {
    try {
      logger.info('Excluindo usuário:', id)

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) {
        logger.error('Erro ao excluir usuário:', error)
        logger.error('Detalhes:', error.message, error.details, error.hint)
        throw error
      }

      logger.success('Usuário excluído com sucesso:', id)
    } catch (error) {
      logger.error('Erro no serviço deleteUsuario:', error)
      throw error
    }
  }

  async toggleStatus(id: string, currentStatus: boolean): Promise<Usuario> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          ativo: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        logger.error('Erro ao alterar status do usuário:', error)
        throw error
      }

      logger.success('Status do usuário atualizado:', data)
      return data
    } catch (error) {
      logger.error('Erro no serviço toggleStatus:', error)
      throw error
    }
  }
}

export const usuarioService = new UsuarioService()
