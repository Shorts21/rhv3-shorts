import { supabase } from '../lib/supabase'

export interface TurnoverIndicators {
  turnoverGeral: number
  turnoverExperiencia: number
  turnoverVoluntario: number
  turnoverInvoluntario: number
  retencao: number
}

export interface TurnoverHistorico {
  mes: string
  turnover: number
  admissoes: number
  desligamentos: number
}

export interface TurnoverFiltros {
  unidade?: string
  setor?: string
  cargo?: string
  dataInicio?: string
  dataFim?: string
}

export interface TurnoverUnidade {
  unidade: string
  totalDesligamentos: number
  turnoverGeral: number
  turnoverVoluntario: number
  turnoverInvoluntario: number
}

export interface OpcoesSelect {
  unidades: string[]
  setores: string[]
  cargos: string[]
}

export const turnoverService = {
  async obterOpcoesFiltros(): Promise<OpcoesSelect> {
    try {
      const { data: unidadesData } = await supabase
        .from('unidades')
        .select('nome')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      const { data: setoresData } = await supabase
        .from('setores')
        .select('nome')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      const { data: cargosData } = await supabase
        .from('cargos')
        .select('titulo')
        .order('titulo', { ascending: true })

      const unidades = unidadesData?.map(u => u.nome) || []
      const setores = setoresData?.map(s => s.nome) || []
      const cargos = cargosData?.map(c => c.titulo) || []

      return {
        unidades,
        setores,
        cargos
      }
    } catch (error) {
      console.error('Erro ao obter opções de filtros:', error)
      return { unidades: [], setores: [], cargos: [] }
    }
  },

  async obterIndicadoresMensais(filtros?: TurnoverFiltros): Promise<TurnoverHistorico[]> {
    try {
      let query = supabase
        .from('indicadores_turnover_mensal')
        .select('*')

      if (filtros?.dataInicio && filtros?.dataFim) {
        query = query
          .gte('mes_referencia', filtros.dataInicio)
          .lte('mes_referencia', filtros.dataFim)
      }

      const { data } = await query.order('mes_referencia', { ascending: true })

      if (!data || data.length === 0) return []

      return data.map(d => ({
        mes: new Date(d.mes_referencia).toLocaleDateString('pt-BR', { month: 'short' }),
        turnover: d.turnover_geral || 0,
        admissoes: 0,
        desligamentos: d.total_desligamentos || 0
      }))
    } catch (error) {
      console.error('Erro ao obter indicadores mensais:', error)
      return []
    }
  },

  async obterRankingUnidades(): Promise<TurnoverUnidade[]> {
    try {
      const { data } = await supabase
        .from('indicadores_turnover_unidade')
        .select('*')
        .order('turnover_geral', { ascending: false })

      if (!data) return []

      return data.map(d => ({
        unidade: d.unidade || 'Não informado',
        totalDesligamentos: d.total_desligamentos || 0,
        turnoverGeral: d.turnover_geral || 0,
        turnoverVoluntario: d.turnover_voluntario || 0,
        turnoverInvoluntario: d.turnover_involuntario || 0
      }))
    } catch (error) {
      console.error('Erro ao obter ranking de unidades:', error)
      return []
    }
  },
  async calcularIndicadores(filtros?: TurnoverFiltros): Promise<TurnoverIndicators> {
    try {
      let queryAtivos = supabase
        .from('colaboradores')
        .select('id')
        .eq('status', 'ativo')

      if (filtros?.unidade) {
        queryAtivos = queryAtivos.eq('unidade', filtros.unidade)
      }
      if (filtros?.setor) {
        queryAtivos = queryAtivos.eq('setor', filtros.setor)
      }

      const colaboradoresAtivos = await queryAtivos
      const totalAtivos = colaboradoresAtivos.data?.length || 1

      let queryDesligamentos = supabase
        .from('movimentacoes_pessoal')
        .select('*')
        .not('data_desligamento', 'is', null)

      if (filtros?.dataInicio && filtros?.dataFim) {
        queryDesligamentos = queryDesligamentos
          .gte('data_desligamento', filtros.dataInicio)
          .lte('data_desligamento', filtros.dataFim)
      }

      if (filtros?.unidade) {
        queryDesligamentos = queryDesligamentos.eq('unidade_atual', filtros.unidade)
      }
      if (filtros?.setor) {
        queryDesligamentos = queryDesligamentos.eq('setor_atual', filtros.setor)
      }
      if (filtros?.cargo) {
        queryDesligamentos = queryDesligamentos.eq('cargo_atual', filtros.cargo)
      }

      const { data: desligamentos } = await queryDesligamentos

      const totalDesligamentos = desligamentos?.length || 0

      const desligamentosVoluntarios = desligamentos?.filter(
        (d) => d.tipo_rescisao === 'Pedido de Demissão'
      ).length || 0

      const desligamentosInvoluntarios = desligamentos?.filter(
        (d) => d.tipo_rescisao === 'Iniciativa da Empresa' || d.tipo_rescisao === 'Justa Causa'
      ).length || 0

      const { data: desligamentosExperiencia } = await supabase
        .from('avaliacoes_experiencia')
        .select(`
          colaborador_id,
          movimentacoes_pessoal!inner(data_desligamento, tipo_rescisao)
        `)
        .not('movimentacoes_pessoal.data_desligamento', 'is', null)

      const totalDesligamentosExperiencia = desligamentosExperiencia?.length || 0

      const turnoverGeral = (totalDesligamentos / totalAtivos) * 100
      const turnoverExperiencia = totalDesligamentos > 0
        ? (totalDesligamentosExperiencia / totalDesligamentos) * 100
        : 0
      const turnoverVoluntario = totalDesligamentos > 0
        ? (desligamentosVoluntarios / totalDesligamentos) * 100
        : 0
      const turnoverInvoluntario = totalDesligamentos > 0
        ? (desligamentosInvoluntarios / totalDesligamentos) * 100
        : 0
      const retencao = 100 - turnoverGeral

      return {
        turnoverGeral: Number(turnoverGeral.toFixed(1)),
        turnoverExperiencia: Number(turnoverExperiencia.toFixed(1)),
        turnoverVoluntario: Number(turnoverVoluntario.toFixed(1)),
        turnoverInvoluntario: Number(turnoverInvoluntario.toFixed(1)),
        retencao: Number(retencao.toFixed(1))
      }
    } catch (error) {
      console.error('Erro ao calcular indicadores de turnover:', error)
      return {
        turnoverGeral: 0,
        turnoverExperiencia: 0,
        turnoverVoluntario: 0,
        turnoverInvoluntario: 0,
        retencao: 100
      }
    }
  },

  async obterHistoricoMensal(meses: number = 6): Promise<TurnoverHistorico[]> {
    try {
      const hoje = new Date()
      const historico: TurnoverHistorico[] = []

      for (let i = meses - 1; i >= 0; i--) {
        const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
        const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1)

        const { data: desligamentos } = await supabase
          .from('movimentacoes_pessoal')
          .select('*')
          .not('data_desligamento', 'is', null)
          .gte('data_desligamento', mesAtual.toISOString())
          .lt('data_desligamento', proximoMes.toISOString())

        const { data: admissoes } = await supabase
          .from('movimentacoes_pessoal')
          .select('*')
          .gte('data_admissao', mesAtual.toISOString())
          .lt('data_admissao', proximoMes.toISOString())

        const { data: ativos } = await supabase
          .from('colaboradores')
          .select('id')
          .eq('status', 'ativo')

        const totalAtivos = ativos?.length || 1
        const totalDesligamentos = desligamentos?.length || 0
        const totalAdmissoes = admissoes?.length || 0

        const turnover = (totalDesligamentos / totalAtivos) * 100

        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const mesNome = mesesNomes[mesAtual.getMonth()]

        historico.push({
          mes: mesNome,
          turnover: Number(turnover.toFixed(1)),
          admissoes: totalAdmissoes,
          desligamentos: totalDesligamentos
        })
      }

      return historico
    } catch (error) {
      console.error('Erro ao obter histórico mensal:', error)
      return []
    }
  }
}
