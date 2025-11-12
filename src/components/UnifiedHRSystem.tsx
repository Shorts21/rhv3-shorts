import { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from '../types'
import { Sidebar } from './Sidebar'
import { RHDashboard } from './RHDashboard'
import { ColaboradoresSection } from './sections/ColaboradoresSection'
import { CargosSection } from './sections/CargosSection'
import { MovimentacoesSection } from './sections/MovimentacoesSection'
import { UnidadesSection } from './sections/UnidadesSection'
import { SetoresSection } from './sections/SetoresSection'
import { UserManagement } from './UserManagement'
import { FeedbacksSection } from './sections/FeedbacksSection'
import { AvaliarSection } from './sections/AvaliarSection'
import { AvaliacaoExperienciaSection } from './sections/AvaliacaoExperienciaSection'
import { AvaliacaoFeedbackSection } from './sections/AvaliacaoFeedbackSection'
import { AvaliacaoDesempenhoSupervisorSection } from './sections/AvaliacaoDesempenhoSupervisorSection'
import { MovimentacaoRequisicaoSection } from './sections/MovimentacaoRequisicaoSection'
import { DashboardMetricasRH } from './DashboardMetricasRH'
import { DashboardIndicadoresRH } from './DashboardIndicadoresRH'
import { TurnoverDashboard } from './TurnoverDashboard'

interface UnifiedHRSystemProps {
  user: User
  onLogout: () => void
}

export function UnifiedHRSystem({ user, onLogout }: UnifiedHRSystemProps) {
  const [activeSection, setActiveSection] = useState('dashboard')

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <RHDashboard user={user} onLogout={onLogout} />

      case 'metricas':
        return <DashboardMetricasRH />

      case 'indicadores':
        return <DashboardIndicadoresRH />

      case 'turnover':
        return <TurnoverDashboard />

      case 'colaboradores':
        return (
          <ColaboradoresSection 
            isRH={true}
          />
        )
      
      case 'unidades':
        return <UnidadesSection />

      case 'setores':
        return <SetoresSection />

      case 'cargos':
        return <CargosSection />

      case 'movimentacoes':
        return <MovimentacoesSection />
      
      case 'usuarios':
        return <UserManagement />
      
      case 'feedbacks':
        return <FeedbacksSection supervisorId={user.id} supervisorNome={user.nome} />

      case 'avaliar':
        return <AvaliarSection supervisorId={user.id} supervisorNome={user.nome} isRH={user.perfil === 'rh'} />

      case 'avaliacao-experiencia':
        return <AvaliacaoExperienciaSection userId={user.id} isRH={user.perfil === 'rh'} />

      case 'avaliacao-feedback':
        return <AvaliacaoFeedbackSection userId={user.id} />

      case 'avaliacao-supervisor':
        return (
          <AvaliacaoDesempenhoSupervisorSection
            supervisorId={user.id}
            supervisorNome={user.nome}
            isBPRH={user.perfil === 'bp_rh' || user.perfil === 'rh'}
          />
        )

      case 'movimentacao-requisicao':
        return <MovimentacaoRequisicaoSection />

      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Seção não encontrada</h2>
            <p className="text-gray-600">A seção solicitada não foi encontrada.</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />
      
      <main className="flex-1 overflow-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}