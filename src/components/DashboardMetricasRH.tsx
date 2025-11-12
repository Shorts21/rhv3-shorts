import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AnimatedCard } from './AnimatedCard'
import { LoadingSpinner } from './LoadingSpinner'
import { MetricCard } from './MetricCard'
import { supabase } from '../lib/supabase'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Award,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Building2
} from 'lucide-react'

interface MetricasCompletas {
  taxaAprovadosExperiencia: number
  taxaDesligamentoExperiencia: number
  tempoMedioFechamentoVaga: number
  motivosMovimentacao: { [key: string]: number }
  indiceDesempenhoMedio: number
  distribuicaoNotas: { [key: string]: number }
  taxaPromocaoInterna: number
  tempoMedioFeedback: number
  performancePorUnidade: { [key: string]: number }
  evolucaoDesempenho: Array<{ periodo: string; media: number }>
}

export function DashboardMetricasRH() {
  const [metricas, setMetricas] = useState<MetricasCompletas | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')

  useEffect(() => {
    loadMetricas()
  }, [periodo])

  const loadMetricas = async () => {
    setLoading(true)
    try {
      const dataLimite = new Date()
      dataLimite.setDate(dataLimite.getDate() - parseInt(periodo))

      const { data: avaliacoesExp } = await supabase
        .from('avaliacoes_experiencia')
        .select('*')
        .gte('created_at', dataLimite.toISOString())

      const { data: avaliacoesDesemp } = await supabase
        .from('avaliacoes_desempenho_feedback')
        .select('*')
        .gte('created_at', dataLimite.toISOString())

      const { data: movimentacoes } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .select('*')
        .gte('created_at', dataLimite.toISOString())

      const { data: colaboradores } = await supabase
        .from('colaboradores')
        .select('*')

      const taxaAprovados = calcularTaxaAprovados(avaliacoesExp || [])
      const taxaDesligamento = calcularTaxaDesligamento(avaliacoesExp || [])
      const tempoMedioVaga = calcularTempoMedioVaga(movimentacoes || [])
      const motivos = calcularMotivosMovimentacao(movimentacoes || [])
      const idi = calcularIDIMedio(avaliacoesDesemp || [])
      const distribuicao = calcularDistribuicaoNotas(avaliacoesExp || [])
      const taxaPromocao = calcularTaxaPromocao(movimentacoes || [])
      const tempoFeedback = calcularTempoMedioFeedback(avaliacoesExp || [], colaboradores || [])
      const performance = calcularPerformancePorUnidade(avaliacoesExp || [], avaliacoesDesemp || [])
      const evolucao = calcularEvolucaoDesempenho(avaliacoesDesemp || [])

      setMetricas({
        taxaAprovadosExperiencia: taxaAprovados,
        taxaDesligamentoExperiencia: taxaDesligamento,
        tempoMedioFechamentoVaga: tempoMedioVaga,
        motivosMovimentacao: motivos,
        indiceDesempenhoMedio: idi,
        distribuicaoNotas: distribuicao,
        taxaPromocaoInterna: taxaPromocao,
        tempoMedioFeedback: tempoFeedback,
        performancePorUnidade: performance,
        evolucaoDesempenho: evolucao
      })
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularTaxaAprovados = (avaliacoes: any[]): number => {
    if (avaliacoes.length === 0) return 0
    const aprovados = avaliacoes.filter(a => a.resultado === 'Permanece na empresa').length
    return (aprovados / avaliacoes.length) * 100
  }

  const calcularTaxaDesligamento = (avaliacoes: any[]): number => {
    if (avaliacoes.length === 0) return 0
    const desligados = avaliacoes.filter(a => a.resultado === 'Desligado durante o período de experiência').length
    return (desligados / avaliacoes.length) * 100
  }

  const calcularTempoMedioVaga = (movimentacoes: any[]): number => {
    const vagas = movimentacoes.filter(m => m.previsao_fechamento && m.data_requisicao)
    if (vagas.length === 0) return 0

    const tempos = vagas.map(v => {
      const inicio = new Date(v.data_requisicao)
      const fim = new Date(v.previsao_fechamento)
      return Math.abs(fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
    })

    return tempos.reduce((acc, t) => acc + t, 0) / tempos.length
  }

  const calcularMotivosMovimentacao = (movimentacoes: any[]): { [key: string]: number } => {
    const motivos: { [key: string]: number } = {}
    movimentacoes.forEach(m => {
      if (m.motivo) {
        motivos[m.motivo] = (motivos[m.motivo] || 0) + 1
      }
    })
    return motivos
  }

  const calcularIDIMedio = (avaliacoes: any[]): number => {
    if (avaliacoes.length === 0) return 0
    const soma = avaliacoes.reduce((acc, a) => acc + (a.percentual_idi || 0), 0)
    return soma / avaliacoes.length
  }

  const calcularDistribuicaoNotas = (avaliacoes: any[]): { [key: string]: number } => {
    const competencias = {
      'Adaptação': [] as number[],
      'Conhecimento Técnico': [] as number[],
      'Iniciativa': [] as number[],
      'Disciplina': [] as number[],
      'Assiduidade': [] as number[],
      'Desenvolvimento': [] as number[]
    }

    avaliacoes.forEach(a => {
      if (a.adaptacao_q1) competencias['Adaptação'].push((a.adaptacao_q1 + a.adaptacao_q2 + a.adaptacao_q3) / 3)
      if (a.conhecimento_q4) competencias['Conhecimento Técnico'].push((a.conhecimento_q4 + a.conhecimento_q5 + a.conhecimento_q6 + a.conhecimento_q7 + a.conhecimento_q8 + a.conhecimento_q9 + a.conhecimento_q10) / 7)
      if (a.iniciativa_q11) competencias['Iniciativa'].push((a.iniciativa_q11 + a.iniciativa_q12 + a.iniciativa_q13) / 3)
      if (a.disciplina_q14) competencias['Disciplina'].push((a.disciplina_q14 + a.disciplina_q15 + a.disciplina_q16 + a.disciplina_q17) / 4)
      if (a.assiduidade_q18) competencias['Assiduidade'].push((a.assiduidade_q18 + a.assiduidade_q19 + a.assiduidade_q20) / 3)
      if (a.desenvolvimento_q21) competencias['Desenvolvimento'].push((a.desenvolvimento_q21 + a.desenvolvimento_q22 + a.desenvolvimento_q23 + a.desenvolvimento_q24) / 4)
    })

    const medias: { [key: string]: number } = {}
    Object.keys(competencias).forEach(key => {
      const notas = competencias[key as keyof typeof competencias]
      medias[key] = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
    })

    return medias
  }

  const calcularTaxaPromocao = (movimentacoes: any[]): number => {
    if (movimentacoes.length === 0) return 0
    const promocoes = movimentacoes.filter(m => m.motivo === 'Promoção').length
    return (promocoes / movimentacoes.length) * 100
  }

  const calcularTempoMedioFeedback = (avaliacoes: any[], colaboradores: any[]): number => {
    let totalDias = 0
    let count = 0

    avaliacoes.forEach(av => {
      const colab = colaboradores.find(c => c.id === av.colaborador_id)
      if (colab && colab.data_admissao && av.data_avaliacao) {
        const admissao = new Date(colab.data_admissao)
        const avaliacao = new Date(av.data_avaliacao)
        const dias = Math.abs(avaliacao.getTime() - admissao.getTime()) / (1000 * 60 * 60 * 24)
        totalDias += dias
        count++
      }
    })

    return count > 0 ? totalDias / count : 0
  }

  const calcularPerformancePorUnidade = (avaliacoesExp: any[], avaliacoesDesemp: any[]): { [key: string]: number } => {
    const performance: { [key: string]: { soma: number; count: number } } = {}

    avaliacoesExp.forEach(a => {
      if (a.colaborador?.unidade && a.nota_final) {
        const unidade = a.colaborador.unidade
        if (!performance[unidade]) performance[unidade] = { soma: 0, count: 0 }
        performance[unidade].soma += a.nota_final
        performance[unidade].count++
      }
    })

    avaliacoesDesemp.forEach(a => {
      if (a.colaborador?.unidade && a.percentual_idi) {
        const unidade = a.colaborador.unidade
        if (!performance[unidade]) performance[unidade] = { soma: 0, count: 0 }
        performance[unidade].soma += a.percentual_idi / 10
        performance[unidade].count++
      }
    })

    const medias: { [key: string]: number } = {}
    Object.keys(performance).forEach(unidade => {
      medias[unidade] = performance[unidade].count > 0
        ? performance[unidade].soma / performance[unidade].count
        : 0
    })

    return medias
  }

  const calcularEvolucaoDesempenho = (avaliacoes: any[]): Array<{ periodo: string; media: number }> => {
    const porTrimestre: { [key: string]: { soma: number; count: number } } = {}

    avaliacoes.forEach(a => {
      if (a.trimestre && a.percentual_idi) {
        const key = `Q${a.trimestre}`
        if (!porTrimestre[key]) porTrimestre[key] = { soma: 0, count: 0 }
        porTrimestre[key].soma += a.percentual_idi
        porTrimestre[key].count++
      }
    })

    return Object.keys(porTrimestre).map(periodo => ({
      periodo,
      media: porTrimestre[periodo].count > 0
        ? porTrimestre[periodo].soma / porTrimestre[periodo].count
        : 0
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando métricas..." />
      </div>
    )
  }

  if (!metricas) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Erro ao carregar métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Métricas de RH</h1>
          <p className="text-gray-600">Análise completa de desempenho, movimentação e período de experiência</p>
        </div>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="15">Últimos 15 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="45">Últimos 45 dias</option>
          <option value="60">Últimos 60 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="180">Últimos 180 dias</option>
          <option value="365">Último ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taxa de Aprovados"
          value={`${metricas.taxaAprovadosExperiencia.toFixed(1)}%`}
          subtitle="Período de experiência"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          delay={0.1}
          tooltip={`Percentual de colaboradores aprovados nas avaliações de período de experiência (45 e 90 dias).

Cálculo: (Aprovados ÷ Total Avaliado) × 100

Uma taxa alta indica que as contratações estão alinhadas com as expectativas da empresa.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Esta métrica mostra o percentual de colaboradores que foram aprovados após o período de experiência.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Interpretação</h4>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  <li>Acima de 85%: Excelente processo seletivo</li>
                  <li>70-85%: Bom processo seletivo</li>
                  <li>Abaixo de 70%: Revisar critérios de seleção</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Período analisado: {periodo} dias
              </p>
            </div>
          }
        />

        <MetricCard
          title="Taxa de Desligamento"
          value={`${metricas.taxaDesligamentoExperiencia.toFixed(1)}%`}
          subtitle="Período de experiência"
          icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          bgColor="bg-red-100"
          iconColor="text-red-600"
          delay={0.2}
          tooltip={`Percentual de colaboradores desligados antes do término da experiência.

Cálculo: (Desligados ÷ Total Admitido) × 100

Uma taxa baixa indica boa adequação entre colaborador e empresa.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Indica quantos colaboradores não completaram o período de experiência.
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Atenção</h4>
                <ul className="list-disc list-inside text-red-800 space-y-1">
                  <li>Abaixo de 15%: Taxa saudável</li>
                  <li>15-30%: Necessita atenção</li>
                  <li>Acima de 30%: Revisar processo urgentemente</li>
                </ul>
              </div>
            </div>
          }
        />

        <MetricCard
          title="Tempo Médio Vaga"
          value={metricas.tempoMedioFechamentoVaga.toFixed(0)}
          subtitle="Dias para fechamento"
          icon={<Clock className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          delay={0.3}
          tooltip={`Número médio de dias entre a data da requisição e o preenchimento da vaga.

Cálculo: (Data fechamento - Data requisição)

Tempo menor indica maior eficiência no recrutamento.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Mede a eficiência do processo de recrutamento e seleção.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Benchmarks</h4>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Até 30 dias: Excelente</li>
                  <li>30-45 dias: Bom</li>
                  <li>45-60 dias: Aceitável</li>
                  <li>Acima de 60 dias: Necessita otimização</li>
                </ul>
              </div>
            </div>
          }
        />

        <MetricCard
          title="IDI Médio"
          value={metricas.indiceDesempenhoMedio.toFixed(1)}
          subtitle="Índice de Desempenho Individual"
          icon={<Target className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          delay={0.4}
          tooltip={`Média geral das notas atribuídas aos colaboradores nas avaliações de desempenho.

Cálculo: (Soma das notas ÷ total de competências) × 100

Reflete o desempenho geral da equipe.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Índice consolidado do desempenho de todos os colaboradores avaliados.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Classificação</h4>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  <li>90-100: Excepcional</li>
                  <li>80-89: Ótimo</li>
                  <li>70-79: Bom</li>
                  <li>60-69: Regular</li>
                  <li>Abaixo de 60: Necessita desenvolvimento</li>
                </ul>
              </div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-6" delay={0.5}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Motivos de Movimentação
          </h3>
          <div className="space-y-3">
            {Object.entries(metricas.motivosMovimentacao).map(([motivo, count]) => {
              const total = Object.values(metricas.motivosMovimentacao).reduce((a, b) => a + b, 0)
              const percent = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={motivo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{motivo}</span>
                    <span className="font-semibold text-gray-900">{percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6" delay={0.6}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Distribuição por Competência
          </h3>
          <div className="space-y-3">
            {Object.entries(metricas.distribuicaoNotas).map(([competencia, nota]) => (
              <div key={competencia}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{competencia}</span>
                  <span className="font-semibold text-gray-900">{nota.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(nota / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedCard className="p-6" delay={0.7}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {metricas.taxaPromocaoInterna.toFixed(1)}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Taxa de Promoção</h3>
          <p className="text-sm text-gray-600">Movimentações internas</p>
        </AnimatedCard>

        <AnimatedCard className="p-6" delay={0.8}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-2xl font-bold text-teal-600">
              {metricas.tempoMedioFeedback.toFixed(0)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Tempo Médio Feedback</h3>
          <p className="text-sm text-gray-600">Dias após admissão</p>
        </AnimatedCard>

        <AnimatedCard className="p-6" delay={0.9}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {Object.keys(metricas.performancePorUnidade).length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Unidades Ativas</h3>
          <p className="text-sm text-gray-600">Com avaliações registradas</p>
        </AnimatedCard>
      </div>

      <AnimatedCard className="p-6" delay={1.0}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-purple-600" />
          Performance Média por Unidade
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metricas.performancePorUnidade).map(([unidade, media]) => (
            <div key={unidade} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{media.toFixed(1)}</div>
              <div className="text-sm text-gray-600">{unidade}</div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      {metricas.evolucaoDesempenho.length > 0 && (
        <AnimatedCard className="p-6" delay={1.1}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Evolução de Desempenho por Trimestre
          </h3>
          <div className="flex items-end justify-between space-x-4 h-64">
            {metricas.evolucaoDesempenho.map((item, index) => {
              const maxHeight = 100
              const height = (item.media / maxHeight) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    {item.media.toFixed(1)}
                  </div>
                  <motion.div
                    className="w-full bg-green-600 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <div className="text-xs text-gray-600 mt-2">{item.periodo}</div>
                </div>
              )
            })}
          </div>
        </AnimatedCard>
      )}
    </div>
  )
}
