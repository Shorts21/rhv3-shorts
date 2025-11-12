import { memo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, BarChart3 } from 'lucide-react'
import { useDashboardMetrics } from '../hooks/useSupabaseQuery'
import { LoadingSpinner } from './LoadingSpinner'
import { AnimatedCard } from './AnimatedCard'
import { MetricCard } from './MetricCard'
import { AvaliacoesCard } from './AvaliacoesCard'
import { User } from '../types'

interface RHDashboardProps {
  user: User
  onLogout: () => void
}

export const RHDashboard = memo(function RHDashboard({ user }: RHDashboardProps) {
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando dashboard..." />
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedCard className="text-center p-8">
          <p className="text-gray-600">Erro ao carregar dados.</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 text-green-600 hover:text-green-700 px-4 py-2 rounded-lg border border-green-300 hover:bg-green-50 transition-colors"
          >
            Tentar novamente
          </button>
        </AnimatedCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📊 Dashboard RH Igarashi
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Bem-vindo(a), {user.nome} • Indicadores e métricas em tempo real
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-left sm:text-right">
            <div className="text-sm text-gray-500">Última atualização</div>
            <div className="text-sm sm:text-base text-gray-700">{new Date().toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Média Geral"
          value={metrics.media_geral_mes.toFixed(1)}
          subtitle="Desempenho dos colaboradores"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          delay={0.1}
          tooltip={`Média geral de desempenho dos colaboradores no mês atual.

Baseada nas avaliações de experiência e desempenho.

Valores próximos a 10 indicam excelente desempenho geral da equipe.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Esta métrica consolida todas as avaliações do mês, incluindo avaliações de experiência e ciclo de feedback.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Classificação</h4>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  <li>9.0-10.0: Excepcional</li>
                  <li>8.0-8.9: Ótimo</li>
                  <li>7.0-7.9: Bom</li>
                  <li>6.0-6.9: Satisfatório</li>
                  <li>Abaixo de 6.0: Necessita atenção</li>
                </ul>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${(metrics.media_geral_mes / 10) * 100}%` }}
                />
              </div>
            </div>
          }
        />

        <MetricCard
          title="Total Colaboradores"
          value={metrics.total_colaboradores}
          subtitle="Colaboradores cadastrados"
          icon={<Users className="w-6 h-6 text-blue-600" />}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          delay={0.2}
          tooltip={`Número total de colaboradores ativos cadastrados no sistema.

Inclui todos os colaboradores ativos e em período de experiência.

Base para cálculo de outras métricas de RH.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Total de colaboradores registrados e ativos no sistema.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {metrics.colaboradores_experiencia}
                  </div>
                  <div className="text-sm text-blue-700">Em Experiência</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {metrics.total_colaboradores - metrics.colaboradores_experiencia}
                  </div>
                  <div className="text-sm text-green-700">Efetivados</div>
                </div>
              </div>
            </div>
          }
        />

        <MetricCard
          title="Em Experiência"
          value={metrics.colaboradores_experiencia}
          subtitle="Colaboradores em período de experiência"
          icon={<Award className="w-6 h-6 text-purple-600" />}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          delay={0.3}
          tooltip={`Número de colaboradores atualmente em período de experiência (45 ou 90 dias).

Monitoramento essencial para acompanhamento de novas contratações.

Requer avaliações específicas ao final do período.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Colaboradores que estão sendo avaliados durante o período de experiência.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Período de Experiência</h4>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  <li>Primeira avaliação: 45 dias</li>
                  <li>Segunda avaliação: 90 dias</li>
                  <li>Total do período: 3 meses</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Acompanhamento próximo destes colaboradores é fundamental para garantir boa integração e desempenho.
              </p>
            </div>
          }
        />

        <MetricCard
          title="Taxa de Retenção"
          value={`${metrics.taxa_retencao_12m.toFixed(1)}%`}
          subtitle="Colaboradores retidos"
          icon={<BarChart3 className="w-6 h-6 text-orange-600" />}
          bgColor="bg-orange-100"
          iconColor="text-orange-600"
          delay={0.4}
          tooltip={`Percentual de colaboradores que permanecem na empresa nos últimos 12 meses.

Cálculo: (Colaboradores que permaneceram ÷ Total de colaboradores) × 100

Alta retenção indica satisfação e engajamento da equipe.`}
          detailedInfo={
            <div className="space-y-4">
              <p className="text-gray-700">
                Mede a capacidade da empresa em reter talentos ao longo do tempo.
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">Referências</h4>
                <ul className="list-disc list-inside text-orange-800 space-y-1">
                  <li>Acima de 90%: Excelente retenção</li>
                  <li>80-90%: Boa retenção</li>
                  <li>70-80%: Retenção moderada</li>
                  <li>Abaixo de 70%: Necessita atenção urgente</li>
                </ul>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all"
                  style={{ width: `${metrics.taxa_retencao_12m}%` }}
                />
              </div>
            </div>
          }
        />
      </div>

      {/* Métricas de Movimentações e Avaliações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard className="p-4 sm:p-6" delay={0.5}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            📈 Distribuição de Avaliações
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.acima_expectativa}</div>
              <div className="text-sm text-gray-600">Acima da Expectativa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.dentro_expectativa}</div>
              <div className="text-sm text-gray-600">Dentro da Expectativa</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.abaixo_expectativa}</div>
              <div className="text-sm text-gray-600">Abaixo da Expectativa</div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 sm:p-6" delay={0.6}>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            🔄 Movimentações de Pessoal
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avaliações de Experiência</span>
              <span className="font-semibold text-gray-900">{metrics.avaliacoes_experiencia || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avaliações de Desempenho</span>
              <span className="font-semibold text-gray-900">{metrics.avaliacoes_desempenho || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-gray-600">Requisições Pendentes</span>
              <span className="font-semibold text-yellow-600">{metrics.requisicoes_pendentes || 0}</span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Card de Avaliações Completo */}
      <AvaliacoesCard />
    </div>
  )
})