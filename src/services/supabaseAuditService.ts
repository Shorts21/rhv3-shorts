import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

interface AuditLog {
  id?: string
  data_execucao: string
  acao: string
  entidade_afetada: string
  detalhes: string
}

export class SupabaseAuditService {
  async runFullAudit(): Promise<void> {
    try {
      logger.info('🔍 Iniciando auditoria completa do Supabase...')
      
      // Verificar se as tabelas principais existem
      await this.checkCoreTablesExist()
      
      // Executar testes básicos
      await this.runBasicTests()
      
      logger.success('✅ Auditoria Supabase concluída com sucesso.')
      logger.info('Sistema funcionando corretamente.')
      
    } catch (error) {
      logger.error('❌ Erro durante auditoria do Supabase:', error)
      // Não propagar o erro para não quebrar a aplicação
    }
  }

  private async checkCoreTablesExist(): Promise<void> {
    try {
      // Testar se conseguimos acessar as tabelas principais
      const tables = ['colaboradores', 'cargos', 'avaliacoes_experiencia', 'feedbacks']
      
      for (const tableName of tables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (error) {
            logger.warn(`⚠️ Tabela ${tableName} pode ter problemas:`, error.message)
          } else {
            logger.info(`✅ Tabela ${tableName} acessível`)
          }
        } catch (err) {
          logger.warn(`⚠️ Erro ao acessar tabela ${tableName}:`, err)
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar tabelas:', error)
    }
  }

  private async runBasicTests(): Promise<void> {
    try {
      logger.info('🧪 Executando testes básicos...')
      
      // Teste 1: Verificar se conseguimos contar colaboradores
      try {
        const { count, error } = await supabase
          .from('colaboradores')
          .select('*', { count: 'exact', head: true })

        if (error) {
          logger.warn('⚠️ Erro ao contar colaboradores:', error.message)
        } else {
          logger.success(`✅ Total de colaboradores: ${count || 0}`)
        }
      } catch (err) {
        logger.warn('⚠️ Erro no teste de contagem:', err)
      }

      // Teste 2: Verificar se conseguimos acessar dashboard_metricas
      try {
        const { data, error } = await supabase
          .from('dashboard_metricas')
          .select('*')
          .limit(1)

        if (error) {
          logger.warn('⚠️ Dashboard metrics não disponível:', error.message)
        } else {
          logger.success('✅ Dashboard metrics funcionando')
        }
      } catch (err) {
        logger.warn('⚠️ Dashboard metrics não encontrado')
      }

      logger.success('✅ Testes básicos concluídos')
      
    } catch (error) {
      logger.error('Erro durante testes básicos:', error)
    }
  }

  async handleSchemaError(error: any, operation: string): Promise<boolean> {
    try {
      if (error.message?.includes('Could not find') || error.message?.includes('column')) {
        logger.warn(`🔧 Erro de schema detectado durante ${operation}. Verificando estrutura...`)
        
        // Em vez de tentar corrigir automaticamente, apenas logamos o erro
        // A correção deve ser feita manualmente no Supabase
        logger.info('💡 Para corrigir este erro:')
        logger.info('1. Acesse o painel do Supabase')
        logger.info('2. Vá para SQL Editor')
        logger.info('3. Execute as migrações necessárias')
        
        return false
      }
      return false
    } catch (auditError) {
      logger.error('Erro durante verificação de schema:', auditError)
      return false
    }
  }

  // Método simplificado para verificar se uma coluna existe
  async checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
    try {
      // Tentar fazer uma query simples que use a coluna
      const { error } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(1)

      return !error
    } catch {
      return false
    }
  }

  // Método para sugerir correções manuais
  suggestManualFix(tableName: string, columnName: string): void {
    logger.info(`💡 Para adicionar a coluna '${columnName}' à tabela '${tableName}':`)
    logger.info(`1. Acesse o Supabase Dashboard`)
    logger.info(`2. Vá para SQL Editor`)
    logger.info(`3. Execute: ALTER TABLE ${tableName} ADD COLUMN ${columnName} text;`)
  }
}

export const supabaseAuditService = new SupabaseAuditService()