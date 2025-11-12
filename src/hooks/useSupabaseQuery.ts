import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rhService } from '../services/rhService'
import { usuarioService } from '../services/usuarioService'
import { logger } from '../lib/logger'
import { supabaseAuditService } from '../services/supabaseAuditService'
import toast from 'react-hot-toast'

// ==================== COLABORADORES ====================

export function useColaboradores(gestorId?: string) {
  return useQuery({
    queryKey: ['colaboradores', gestorId],
    queryFn: async () => {
      logger.info('Carregando colaboradores...')
      const data = await rhService.getColaboradores(gestorId)
      logger.success('Colaboradores carregados:', data?.length)
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useCreateColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ colaboradorData, gestorId }: { colaboradorData: any, gestorId: string | null }) => {
      logger.info('Criando colaborador...', colaboradorData)
      const result = await rhService.createColaborador(colaboradorData, gestorId)
      logger.success('Colaborador criado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] })
      toast.success('✅ Colaborador cadastrado com sucesso!')
    },
    onError: (error: any) => {
      logger.error('Erro ao criar colaborador:', error)
      logger.error('Detalhes:', error?.message, error?.details, error?.hint)
      supabaseAuditService.handleSchemaError(error, 'criar colaborador')
      const errorMessage = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro ao cadastrar colaborador: ${errorMessage}`)
    }
  })
}

export function useUpdateColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, colaboradorData }: { id: string, colaboradorData: any }) => {
      logger.info('Atualizando colaborador...', { id, colaboradorData })
      const result = await rhService.updateColaborador(id, colaboradorData)
      logger.success('Colaborador atualizado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success('✅ Dados do colaborador atualizados com sucesso!')
    },
    onError: (error: any) => {
      logger.error('Erro ao atualizar colaborador:', error)
      logger.error('Detalhes:', error?.message, error?.details, error?.hint)
      supabaseAuditService.handleSchemaError(error, 'atualizar colaborador')
      const errorMessage = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro ao atualizar colaborador: ${errorMessage}`)
    }
  })
}

export function useDeleteColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (colaboradorId: string) => {
      logger.info('Excluindo colaborador...', colaboradorId)
      await rhService.deleteColaborador(colaboradorId)
      logger.success('Colaborador excluído:', colaboradorId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] })
      toast.success('🗑️ Colaborador excluído com sucesso.')
    },
    onError: (error: Error) => {
      logger.error('Erro ao excluir colaborador:', error)
      supabaseAuditService.handleSchemaError(error, 'excluir colaborador')
      toast.error('Erro ao excluir colaborador. Tente novamente.')
    }
  })
}

// ==================== AVALIAÇÕES ====================

export function useAvaliacoes(gestorId?: string) {
  return useQuery({
    queryKey: ['avaliacoes', gestorId],
    queryFn: async () => {
      logger.info('Carregando avaliações...')
      const data = await rhService.getAvaliacoes(gestorId)
      logger.success('Avaliações carregadas:', data?.length)
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateAvaliacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ avaliacaoData, avaliadorId }: { avaliacaoData: any, avaliadorId: string }) => {
      logger.info('Criando avaliação...', avaliacaoData)
      const result = await rhService.createAvaliacao(avaliacaoData, avaliadorId)
      logger.success('Avaliação criada:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success('✅ Avaliação criada com sucesso!')
    },
    onError: (error: any) => {
      logger.error('Erro completo ao criar avaliação:', error)
      logger.error('Mensagem do erro:', error?.message)
      logger.error('Detalhes do erro:', error?.details)
      logger.error('Hint do erro:', error?.hint)
      logger.error('Code do erro:', error?.code)

      supabaseAuditService.handleSchemaError(error, 'criar avaliação')

      const errorMessage = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro ao criar avaliação: ${errorMessage}`)
    }
  })
}

// ==================== FEEDBACKS ====================

export function useFeedbacks(gestorId?: string) {
  return useQuery({
    queryKey: ['feedbacks', gestorId],
    queryFn: async () => {
      logger.info('Carregando feedbacks...')
      const data = await rhService.getFeedbacks(gestorId)
      logger.success('Feedbacks carregados:', data?.length)
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ feedbackData, gestorId }: { feedbackData: any, gestorId: string }) => {
      logger.info('Criando feedback...', feedbackData)
      const result = await rhService.createFeedback(feedbackData, gestorId)
      logger.success('Feedback criado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success('✅ Feedback criado com sucesso!')
    },
    onError: (error: any) => {
      logger.error('Erro ao criar feedback:', error)
      logger.error('Mensagem:', error?.message)
      logger.error('Detalhes:', error?.details)
      logger.error('Hint:', error?.hint)
      logger.error('Code:', error?.code)
      supabaseAuditService.handleSchemaError(error, 'criar feedback')
      const errorMsg = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro: ${errorMsg}`)
    }
  })
}

// ==================== DASHBOARD ====================

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      logger.info('Carregando métricas do dashboard...')
      const metrics = await rhService.getDashboardMetrics()
      logger.success('Métricas carregadas:', metrics)
      return metrics
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}

// ==================== MOVIMENTAÇÕES ====================

export function useMovimentacoes() {
  return useQuery({
    queryKey: ['movimentacoes'],
    queryFn: async () => {
      logger.info('Carregando movimentações...')
      const data = await rhService.getMovimentacoes()
      logger.success('Movimentações carregadas:', data?.length)
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateMovimentacao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (movimentacaoData: any) => {
      logger.info('Criando movimentação...', movimentacaoData)
      const result = await rhService.createMovimentacao(movimentacaoData)
      logger.success('Movimentação criada:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      toast.success('✅ Movimentação registrada com sucesso!')
    },
    onError: (error: Error) => {
      logger.error('Erro ao criar movimentação:', error)
      supabaseAuditService.handleSchemaError(error, 'criar movimentação')
      toast.error('Erro ao registrar movimentação. Tente novamente.')
    }
  })
}

// ==================== CARGOS ====================

export function useCargos() {
  return useQuery({
    queryKey: ['cargos'],
    queryFn: async () => {
      logger.info('Carregando cargos...')
      const data = await rhService.getCargos()
      logger.success('Cargos carregados:', data?.length)
      return data
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 20 * 60 * 1000, // 20 minutos
  })
}

export function useCreateCargo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cargoData: any) => {
      logger.info('Criando cargo...', cargoData)
      const result = await rhService.createCargo(cargoData)
      logger.success('Cargo criado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cargos'] })
      toast.success('✅ Cargo cadastrado com sucesso!')
    },
    onError: (error: Error) => {
      logger.error('Erro ao criar cargo:', error)
      supabaseAuditService.handleSchemaError(error, 'criar cargo')
      toast.error('Erro ao cadastrar cargo. Tente novamente.')
    }
  })
}

// ==================== USUÁRIOS ====================

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      logger.info('Carregando usuários...')
      const data = await usuarioService.getUsuarios()
      logger.success('Usuários carregados:', data?.length)
      return data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (usuarioData: any) => {
      logger.info('Criando usuário...', usuarioData)
      const result = await usuarioService.createUsuario(usuarioData)
      logger.success('Usuário criado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('✅ Usuário criado com sucesso!')
    },
    onError: (error: any) => {
      logger.error('Erro ao criar usuário:', error)
      logger.error('Detalhes:', error?.message, error?.details, error?.hint)
      supabaseAuditService.handleSchemaError(error, 'criar usuário')
      const errorMessage = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro ao criar usuário: ${errorMessage}`)
    }
  })
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, usuarioData }: { id: string, usuarioData: any }) => {
      logger.info('Atualizando usuário...', { id, usuarioData })
      const result = await usuarioService.updateUsuario(id, usuarioData)
      logger.success('Usuário atualizado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('✅ Usuário atualizado com sucesso!')
    },
    onError: (error: any) => {
      logger.error('Erro ao atualizar usuário:', error)
      logger.error('Detalhes:', error?.message, error?.details, error?.hint)
      supabaseAuditService.handleSchemaError(error, 'atualizar usuário')
      const errorMessage = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro ao atualizar usuário: ${errorMessage}`)
    }
  })
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (usuarioId: string) => {
      logger.info('Excluindo usuário...', usuarioId)
      await usuarioService.deleteUsuario(usuarioId)
      logger.success('Usuário excluído:', usuarioId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('🗑️ Usuário excluído com sucesso.')
    },
    onError: (error: any) => {
      logger.error('Erro ao excluir usuário:', error)
      logger.error('Detalhes:', error?.message, error?.details, error?.hint)
      supabaseAuditService.handleSchemaError(error, 'excluir usuário')
      const errorMessage = error?.message || error?.details || 'Erro desconhecido'
      toast.error(`Erro ao excluir usuário: ${errorMessage}`)
    }
  })
}

export function useToggleUsuarioStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string, currentStatus: boolean }) => {
      logger.info('Alternando status do usuário...', { id, currentStatus })
      const result = await usuarioService.toggleStatus(id, currentStatus)
      logger.success('Status alternado:', result)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('✅ Status atualizado!')
    },
    onError: (error: Error) => {
      logger.error('Erro ao alternar status do usuário:', error)
      supabaseAuditService.handleSchemaError(error, 'alternar status do usuário')
      toast.error('Erro ao atualizar status. Tente novamente.')
    }
  })
}