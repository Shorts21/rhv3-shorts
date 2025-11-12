import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RHIndicatorCard } from './RHIndicatorCard'
import { LoadingSpinner } from './LoadingSpinner'
import { supabase } from '../lib/supabase'

interface IndicadorData {
  month: string
  value: number
}

interface Indicadores {
  tempoMedioPermanencia: {
    valor: number
    trend: 'up' | 'down' | 'neutral'
    dados: IndicadorData[]
  }
  custoAdmissao: {
    valor: number
    trend: 'up' | 'down' | 'neutral'
    dados: IndicadorData[]
  }
  indiceTreinamento: {
    valor: number
    trend: 'up' | 'down' | 'neutral'
    dados: IndicadorData[]
  }
  satisfacaoFeedback: {
    valor: number
    trend: 'up' | 'down' | 'neutral'
    dados: IndicadorData[]
  }
  taxaEfetivacao: {
    valor: number
    trend: 'up' | 'down' | 'neutral'
    dados: IndicadorData[]
  }
}

export function DashboardIndicadoresRH() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIndicadores()
  }, [])

  const getMesesAnteriores = (quantidade: number): string[] => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const hoje = new Date()
    const resultado: string[] = []

    for (let i = quantidade - 1; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      resultado.push(meses[data.getMonth()])
    }

    return resultado
  }

  const calcularTrend = (dados: IndicadorData[]): 'up' | 'down' | 'neutral' => {
    if (dados.length < 2) return 'neutral'
    const ultimo = dados[dados.length - 1].value
    const penultimo = dados[dados.length - 2].value
    if (ultimo > penultimo) return 'up'
    if (ultimo < penultimo) return 'down'
    return 'neutral'
  }

  const loadIndicadores = async () => {
    setLoading(true)
    try {
      const meses = getMesesAnteriores(6)
      const dataInicio = new Date()
      dataInicio.setMonth(dataInicio.getMonth() - 6)

      const { data: colaboradores } = await supabase
        .from('colaboradores')
        .select('*')

      const { data: avaliacoesExp } = await supabase
        .from('avaliacoes_experiencia')
        .select('*')
        .gte('created_at', dataInicio.toISOString())

      const { data: avaliacoesDesemp } = await supabase
        .from('avaliacoes_desempenho_feedback')
        .select('*')
        .gte('created_at', dataInicio.toISOString())

      const { data: movimentacoes } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .select('*')
        .gte('created_at', dataInicio.toISOString())

      const tempoPermanencia = calcularTempoMedioPermanencia(colaboradores || [], movimentacoes || [], meses)
      const custoAdmissao = calcularCustoAdmissao(movimentacoes || [], meses)
      const indiceTreinamento = calcularIndiceTreinamento(avaliacoesExp || [], avaliacoesDesemp || [], meses)
      const satisfacaoFeedback = calcularSatisfacaoFeedback(avaliacoesDesemp || [], meses)
      const taxaEfetivacao = calcularTaxaEfetivacao(avaliacoesExp || [], meses)

      setIndicadores({
        tempoMedioPermanencia: tempoPermanencia,
        custoAdmissao: custoAdmissao,
        indiceTreinamento: indiceTreinamento,
        satisfacaoFeedback: satisfacaoFeedback,
        taxaEfetivacao: taxaEfetivacao
      })
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularTempoMedioPermanencia = (
    colaboradores: any[],
    movimentacoes: any[],
    meses: string[]
  ) => {
    const dadosPorMes: IndicadorData[] = []

    for (let i = 0; i < meses.length; i++) {
      const dataRef = new Date()
      dataRef.setMonth(dataRef.getMonth() - (meses.length - 1 - i))

      const desligamentosDoMes = movimentacoes.filter(m => {
        if (m.motivo !== 'Demissão' || !m.desligamento_nome_colaborador) return false
        const dataMovimentacao = new Date(m.created_at)
        return dataMovimentacao.getMonth() === dataRef.getMonth() &&
               dataMovimentacao.getFullYear() === dataRef.getFullYear()
      })

      let tempoTotal = 0
      let count = 0

      desligamentosDoMes.forEach(mov => {
        const colab = colaboradores.find(c => c.nome === mov.desligamento_nome_colaborador)
        if (colab && colab.data_admissao) {
          const admissao = new Date(colab.data_admissao)
          const desligamento = new Date(mov.created_at)
          const diasTrabalhados = Math.abs(desligamento.getTime() - admissao.getTime()) / (1000 * 60 * 60 * 24)
          tempoTotal += diasTrabalhados / 30
          count++
        }
      })

      dadosPorMes.push({
        month: meses[i],
        value: count > 0 ? tempoTotal / count : 0
      })
    }

    const valorAtual = dadosPorMes[dadosPorMes.length - 1]?.value || 0

    return {
      valor: valorAtual,
      trend: calcularTrend(dadosPorMes),
      dados: dadosPorMes
    }
  }

  const calcularCustoAdmissao = (movimentacoes: any[], meses: string[]) => {
    const custoPorAdmissao = 2500
    const dadosPorMes: IndicadorData[] = []

    for (let i = 0; i < meses.length; i++) {
      const dataRef = new Date()
      dataRef.setMonth(dataRef.getMonth() - (meses.length - 1 - i))

      const admisoesDoMes = movimentacoes.filter(m => {
        if (!['Aumento de Quadro', 'Substituição'].includes(m.motivo || '')) return false
        const dataMovimentacao = new Date(m.created_at)
        return dataMovimentacao.getMonth() === dataRef.getMonth() &&
               dataMovimentacao.getFullYear() === dataRef.getFullYear()
      })

      const custoMes = admisoesDoMes.length * custoPorAdmissao

      dadosPorMes.push({
        month: meses[i],
        value: admisoesDoMes.length > 0 ? custoMes / admisoesDoMes.length : 0
      })
    }

    const valorAtual = dadosPorMes[dadosPorMes.length - 1]?.value || 0

    return {
      valor: valorAtual,
      trend: calcularTrend(dadosPorMes) === 'up' ? 'down' : calcularTrend(dadosPorMes) === 'down' ? 'up' : 'neutral',
      dados: dadosPorMes
    }
  }

  const calcularIndiceTreinamento = (
    avaliacoesExp: any[],
    avaliacoesDesemp: any[],
    meses: string[]
  ) => {
    const dadosPorMes: IndicadorData[] = []

    for (let i = 0; i < meses.length; i++) {
      const dataRef = new Date()
      dataRef.setMonth(dataRef.getMonth() - (meses.length - 1 - i))

      const avaliacoesExpMes = avaliacoesExp.filter(a => {
        const dataAv = new Date(a.created_at)
        return dataAv.getMonth() === dataRef.getMonth() &&
               dataAv.getFullYear() === dataRef.getFullYear()
      })

      const avaliacoesDesempMes = avaliacoesDesemp.filter(a => {
        const dataAv = new Date(a.created_at)
        return dataAv.getMonth() === dataRef.getMonth() &&
               dataAv.getFullYear() === dataRef.getFullYear()
      })

      let somaNotas = 0
      let count = 0

      avaliacoesExpMes.forEach(a => {
        if (a.desenvolvimento_q22 && a.conhecimento_q5 && a.iniciativa_q12) {
          somaNotas += (a.desenvolvimento_q22 + a.conhecimento_q5 + a.iniciativa_q12) / 3
          count++
        }
      })

      avaliacoesDesempMes.forEach(a => {
        if (a.conhecimento_2b && a.conhecimento_2c) {
          somaNotas += ((a.conhecimento_2b + a.conhecimento_2c) / 2) * 2
          count++
        }
      })

      dadosPorMes.push({
        month: meses[i],
        value: count > 0 ? somaNotas / count : 0
      })
    }

    const valorAtual = dadosPorMes[dadosPorMes.length - 1]?.value || 0

    return {
      valor: valorAtual,
      trend: calcularTrend(dadosPorMes),
      dados: dadosPorMes
    }
  }

  const calcularSatisfacaoFeedback = (avaliacoesDesemp: any[], meses: string[]) => {
    const dadosPorMes: IndicadorData[] = []

    for (let i = 0; i < meses.length; i++) {
      const dataRef = new Date()
      dataRef.setMonth(dataRef.getMonth() - (meses.length - 1 - i))

      const avaliacoesMes = avaliacoesDesemp.filter(a => {
        const dataAv = new Date(a.created_at)
        return dataAv.getMonth() === dataRef.getMonth() &&
               dataAv.getFullYear() === dataRef.getFullYear()
      })

      let somaNotas = 0
      let count = 0

      avaliacoesMes.forEach(a => {
        if (a.comprometimento_4a && a.comprometimento_4b && a.comprometimento_4c) {
          somaNotas += (a.comprometimento_4a + a.comprometimento_4b + a.comprometimento_4c) / 3
          count++
        }
      })

      dadosPorMes.push({
        month: meses[i],
        value: count > 0 ? (somaNotas / count) * 2 : 0
      })
    }

    const valorAtual = dadosPorMes[dadosPorMes.length - 1]?.value || 0

    return {
      valor: valorAtual,
      trend: calcularTrend(dadosPorMes),
      dados: dadosPorMes
    }
  }

  const calcularTaxaEfetivacao = (avaliacoesExp: any[], meses: string[]) => {
    const dadosPorMes: IndicadorData[] = []

    for (let i = 0; i < meses.length; i++) {
      const dataRef = new Date()
      dataRef.setMonth(dataRef.getMonth() - (meses.length - 1 - i))

      const avaliacoesMes = avaliacoesExp.filter(a => {
        const dataAv = new Date(a.created_at)
        return dataAv.getMonth() === dataRef.getMonth() &&
               dataAv.getFullYear() === dataRef.getFullYear()
      })

      const totalAvaliacoes = avaliacoesMes.length
      const aprovados = avaliacoesMes.filter(a => a.resultado === 'Permanece na empresa').length

      dadosPorMes.push({
        month: meses[i],
        value: totalAvaliacoes > 0 ? (aprovados / totalAvaliacoes) * 100 : 0
      })
    }

    const valorAtual = dadosPorMes[dadosPorMes.length - 1]?.value || 0

    return {
      valor: valorAtual,
      trend: calcularTrend(dadosPorMes),
      dados: dadosPorMes
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando indicadores..." />
      </div>
    )
  }

  if (!indicadores) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Erro ao carregar indicadores</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Indicadores de RH</h1>
        <p className="text-gray-600">Acompanhamento dos principais indicadores com evolução dos últimos 6 meses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <RHIndicatorCard
            title="Tempo Médio de Permanência"
            value={indicadores.tempoMedioPermanencia.valor.toFixed(1)}
            unit=" meses"
            trend={indicadores.tempoMedioPermanencia.trend}
            tooltip={`Mede o tempo médio que os colaboradores permanecem na empresa antes do desligamento.

Um aumento indica melhor retenção.

Tendência: comparar média atual com mês anterior.

Gráfico: evolução dos últimos 6 meses do tempo médio de permanência.`}
            data={indicadores.tempoMedioPermanencia.dados}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <RHIndicatorCard
            title="Custo por Admissão"
            value={`R$ ${indicadores.custoAdmissao.valor.toFixed(0)}`}
            trend={indicadores.custoAdmissao.trend}
            tooltip={`Mostra o custo médio de cada contratação.

Inclui despesas com recrutamento, seleção e integração.

Gráfico: custo médio por mês (últimos 6 meses).`}
            data={indicadores.custoAdmissao.dados}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <RHIndicatorCard
            title="Índice de Treinamento e Desenvolvimento"
            value={indicadores.indiceTreinamento.valor.toFixed(1)}
            unit="/10"
            trend={indicadores.indiceTreinamento.trend}
            tooltip={`Representa o engajamento dos colaboradores com aprendizado e capacitação.

Baseado em notas de "Desenvolvimento Pessoal", "Atualização Técnica" e "Interesse em Aprender".

Gráfico: evolução mensal da nota média de T&D.`}
            data={indicadores.indiceTreinamento.dados}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <RHIndicatorCard
            title="Índice de Satisfação com Feedback"
            value={indicadores.satisfacaoFeedback.valor.toFixed(1)}
            unit="/10"
            trend={indicadores.satisfacaoFeedback.trend}
            tooltip={`Mede o quanto os colaboradores estão satisfeitos com os feedbacks recebidos.

Baseado em notas de "Qualidade do Feedback" e "Clareza das Metas".

Gráfico: evolução mensal do índice de satisfação.`}
            data={indicadores.satisfacaoFeedback.dados}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <RHIndicatorCard
            title="Taxa de Efetivação no Período de Experiência"
            value={indicadores.taxaEfetivacao.valor.toFixed(1)}
            unit="%"
            trend={indicadores.taxaEfetivacao.trend}
            tooltip={`Mostra a taxa de colaboradores efetivados após o período de experiência.

Altas taxas indicam contratações assertivas.

Cálculo: (Efetivados ÷ Total de Experiência) × 100

Gráfico: evolução mensal da taxa de efetivação.`}
            data={indicadores.taxaEfetivacao.dados}
          />
        </motion.div>
      </div>
    </div>
  )
}
