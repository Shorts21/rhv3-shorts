import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { LineChartTurnover } from './LineChartTurnover'
import {
  turnoverService,
  TurnoverIndicators,
  TurnoverHistorico,
  TurnoverFiltros,
  TurnoverUnidade,
  OpcoesSelect
} from '../services/turnoverService'
import { LoadingSpinner } from './LoadingSpinner'
import { TrendingUp, TrendingDown, Users, UserMinus, UserCheck, AlertCircle, Filter } from 'lucide-react'

interface CardProps {
  title: string
  value: string
  color: 'green' | 'yellow' | 'red'
  tooltip: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

const Card = ({ title, value, color, tooltip, icon, trend }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      'relative flex flex-col items-start justify-between p-6 rounded-2xl shadow-md transition-all hover:shadow-lg group cursor-pointer',
      color === 'green' && 'bg-green-50 border-l-4 border-green-500',
      color === 'yellow' && 'bg-yellow-50 border-l-4 border-yellow-500',
      color === 'red' && 'bg-red-50 border-l-4 border-red-500'
    )}
  >
    <div className="flex items-center justify-between w-full mb-3">
      <h2 className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{title}</h2>
      <div className={cn(
        'p-2 rounded-lg',
        color === 'green' && 'bg-green-100 text-green-600',
        color === 'yellow' && 'bg-yellow-100 text-yellow-600',
        color === 'red' && 'bg-red-100 text-red-600'
      )}>
        {icon}
      </div>
    </div>

    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-gray-800">{value}</span>
      {trend && (
        <span className={cn(
          'flex items-center text-sm font-medium',
          trend === 'up' && 'text-red-500',
          trend === 'down' && 'text-green-500',
          trend === 'neutral' && 'text-gray-500'
        )}>
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4" />}
        </span>
      )}
    </div>

    <div className="absolute bottom-full left-0 mb-2 w-full px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      <div className="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg">
        {tooltip}
      </div>
    </div>
  </motion.div>
)

export function TurnoverDashboard() {
  const [filtros, setFiltros] = useState<TurnoverFiltros>({})
  const [opcoes, setOpcoes] = useState<OpcoesSelect>({ unidades: [], setores: [], cargos: [] })
  const [indicadores, setIndicadores] = useState<TurnoverIndicators | null>(null)
  const [historico, setHistorico] = useState<TurnoverHistorico[]>([])
  const [ranking, setRanking] = useState<TurnoverUnidade[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    carregarOpcoes()
  }, [])

  useEffect(() => {
    carregarDados()
  }, [filtros])

  const carregarOpcoes = async () => {
    const opcoesData = await turnoverService.obterOpcoesFiltros()
    setOpcoes(opcoesData)
  }

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [indicadoresData, historicoData, rankingData] = await Promise.all([
        turnoverService.calcularIndicadores(filtros),
        turnoverService.obterIndicadoresMensais(filtros),
        turnoverService.obterRankingUnidades()
      ])

      setIndicadores(indicadoresData)
      setHistorico(historicoData.length > 0 ? historicoData : [
        { mes: 'Mai', turnover: 0, admissoes: 0, desligamentos: 0 },
        { mes: 'Jun', turnover: 0, admissoes: 0, desligamentos: 0 },
        { mes: 'Jul', turnover: 0, admissoes: 0, desligamentos: 0 },
        { mes: 'Ago', turnover: 0, admissoes: 0, desligamentos: 0 },
        { mes: 'Set', turnover: 0, admissoes: 0, desligamentos: 0 },
        { mes: 'Out', turnover: 0, admissoes: 0, desligamentos: 0 }
      ])
      setRanking(rankingData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const limparFiltros = () => {
    setFiltros({})
  }

  const filtrosAtivos = Object.values(filtros).filter(Boolean).length

  if (loading || !indicadores) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const getColorByValue = (value: number, invertido: boolean = false): 'green' | 'yellow' | 'red' => {
    if (invertido) {
      if (value >= 90) return 'green'
      if (value >= 80) return 'yellow'
      return 'red'
    } else {
      if (value <= 5) return 'green'
      if (value <= 10) return 'yellow'
      return 'red'
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              Indicadores de Rotatividade e Retenção
            </h1>
            <p className="text-gray-600 mt-2">
              Analise a rotatividade por unidade, setor e cargo com seleção de período.
            </p>
          </div>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
              mostrarFiltros ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            )}
          >
            <Filter className="w-5 h-5" />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="ml-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filtrosAtivos}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {mostrarFiltros && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros Avançados</h3>
            {filtrosAtivos > 0 && (
              <button
                onClick={limparFiltros}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filtros.unidade || ''}
                onChange={(e) => setFiltros({ ...filtros, unidade: e.target.value || undefined })}
              >
                <option value="">Todas as Unidades</option>
                {opcoes.unidades.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Setor</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filtros.setor || ''}
                onChange={(e) => setFiltros({ ...filtros, setor: e.target.value || undefined })}
              >
                <option value="">Todos os Setores</option>
                {opcoes.setores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filtros.cargo || ''}
                onChange={(e) => setFiltros({ ...filtros, cargo: e.target.value || undefined })}
              >
                <option value="">Todos os Cargos</option>
                {opcoes.cargos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filtros.dataInicio || ''}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value || undefined })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filtros.dataFim || ''}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value || undefined })}
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Turnover Geral"
          value={`${indicadores.turnoverGeral}%`}
          color={getColorByValue(indicadores.turnoverGeral)}
          tooltip="Taxa total de rotatividade da empresa no período selecionado. Mede a proporção de colaboradores que saíram em relação ao total ativo."
          icon={<Users className="w-5 h-5" />}
          trend={indicadores.turnoverGeral > 10 ? 'up' : indicadores.turnoverGeral < 5 ? 'down' : 'neutral'}
        />

        <Card
          title="Turnover na Experiência"
          value={`${indicadores.turnoverExperiencia}%`}
          color={getColorByValue(indicadores.turnoverExperiencia)}
          tooltip="Percentual de desligamentos durante o período de experiência. Indica problemas na seleção ou integração de novos colaboradores."
          icon={<AlertCircle className="w-5 h-5" />}
          trend={indicadores.turnoverExperiencia > 20 ? 'up' : 'neutral'}
        />

        <Card
          title="Turnover Voluntário"
          value={`${indicadores.turnoverVoluntario}%`}
          color={getColorByValue(indicadores.turnoverVoluntario)}
          tooltip="Desligamentos por decisão do colaborador (pedido de demissão). Indica insatisfação ou melhores oportunidades no mercado."
          icon={<UserMinus className="w-5 h-5" />}
          trend={indicadores.turnoverVoluntario > 60 ? 'up' : 'neutral'}
        />

        <Card
          title="Turnover Involuntário"
          value={`${indicadores.turnoverInvoluntario}%`}
          color={getColorByValue(indicadores.turnoverInvoluntario)}
          tooltip="Desligamentos promovidos pela empresa (iniciativa da empresa ou justa causa). Indica necessidade de ajustes na gestão de pessoas."
          icon={<UserMinus className="w-5 h-5" />}
        />

        <Card
          title="Retenção"
          value={`${indicadores.retencao}%`}
          color={getColorByValue(indicadores.retencao, true)}
          tooltip="Percentual de colaboradores mantidos ativos no período. Alta retenção indica clima organizacional positivo e satisfação dos colaboradores."
          icon={<UserCheck className="w-5 h-5" />}
          trend={indicadores.retencao >= 90 ? 'down' : indicadores.retencao < 80 ? 'up' : 'neutral'}
        />
      </div>

      <div className="w-full mt-8">
        <LineChartTurnover
          data={historico}
          title="Evolução Mensal do Turnover (%)"
          subtitle="Variação da taxa de rotatividade conforme filtros aplicados"
        />
      </div>

      {ranking.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Ranking de Turnover por Unidade
          </h2>
          <div className="bg-gray-50 rounded-xl p-4">
            {ranking.map((u, i) => (
              <div
                key={u.unidade}
                className="flex justify-between items-center border-b py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    i === 0 && 'bg-red-100 text-red-700',
                    i === 1 && 'bg-yellow-100 text-yellow-700',
                    i === 2 && 'bg-orange-100 text-orange-700',
                    i > 2 && 'bg-gray-100 text-gray-700'
                  )}>
                    {i + 1}
                  </span>
                  <span className="text-gray-800 font-medium">{u.unidade}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-800 font-bold text-lg">{u.turnoverGeral}%</span>
                  <span className="text-gray-500 text-sm ml-2">({u.totalDesligamentos} desl.)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Análise Recomendada</h3>
            <p className="text-sm text-blue-800">
              {indicadores.turnoverGeral > 10 && 'Taxa de turnover acima do ideal. Recomenda-se investigar as causas dos desligamentos e implementar ações de retenção.'}
              {indicadores.turnoverGeral <= 10 && indicadores.turnoverGeral > 5 && 'Taxa de turnover dentro do esperado. Mantenha o acompanhamento das métricas e continue investindo no clima organizacional.'}
              {indicadores.turnoverGeral <= 5 && 'Excelente taxa de retenção! Continue investindo no clima organizacional e nas práticas de gestão de pessoas.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
