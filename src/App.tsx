import { useState, Suspense } from 'react'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Login } from './components/Login'
import { LoadingSpinner } from './components/LoadingSpinner'
import { UnifiedHRSystem } from './components/UnifiedHRSystem'
import { SupervisorFlow } from './components/SupervisorFlow'
import { authService, User } from './lib/auth'
import { supabaseAuditService } from './services/supabaseAuditService'
import { logger } from './lib/logger'

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const user = authService.getCurrentUser()
      if (user) {
        console.log('🔄 Carregando sessão do localStorage:', user)
      }
      return user
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      return null
    }
  })
  const [auditCompleted, setAuditCompleted] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Executar auditoria na inicialização
  useEffect(() => {
    const runInitialAudit = async () => {
      try {
        logger.info('🚀 Iniciando sistema Luiza HR...')
        await supabaseAuditService.runFullAudit()
        setAuditCompleted(true)
      } catch (error) {
        logger.error('Erro na auditoria inicial:', error)
        setError('Erro ao inicializar sistema. Por favor, recarregue a página.')
        setAuditCompleted(true) // Continuar mesmo com erro
      }
    }

    runInitialAudit()
  }, [])

  // Executar auditoria semanal
  useEffect(() => {
    const weeklyAudit = setInterval(async () => {
      try {
        logger.info('📅 Executando auditoria semanal...')
        await supabaseAuditService.runFullAudit()
      } catch (error) {
        logger.error('Erro na auditoria semanal:', error)
      }
    }, 7 * 24 * 60 * 60 * 1000) // 7 dias

    return () => clearInterval(weeklyAudit)
  }, [])

  const handleLogin = (user: User) => {
    console.log('🔐 Login realizado:', { nome: user.nome, perfil: user.perfil, id: user.id })
    setCurrentUser(user)
  }

  const handleLogout = () => {
    console.log('🚪 Fazendo logout e limpando cache...')
    authService.logout()
    setCurrentUser(null)
    // Forçar limpeza completa do cache e recarregar
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }

  // Mostrar loading durante auditoria inicial
  if (!auditCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <LoadingSpinner size="lg" text="Inicializando sistema Luiza HR..." />
      </div>
    )
  }

  // Debug: Log do usuário atual e qual componente será renderizado
  if (currentUser) {
    console.log('👤 Usuário atual:', currentUser.nome, '| Perfil:', currentUser.perfil)
    if (currentUser.perfil === 'supervisor') {
      console.log('🎯 Renderizando: SupervisorFlow')
    } else if (currentUser.perfil === 'rh' || currentUser.perfil === 'bp_rh') {
      console.log('🎯 Renderizando: UnifiedHRSystem (com sidebar)')
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-sans min-h-screen bg-gradient-to-br from-green-50 to-white">
        <AnimatePresence mode="wait">
          {!currentUser && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Login onLogin={handleLogin} />
            </motion.div>
          )}
          {currentUser?.perfil === 'supervisor' && (
            <motion.div
              key="supervisor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SupervisorFlow user={currentUser} onLogout={handleLogout} />
            </motion.div>
          )}
          {(currentUser?.perfil === 'rh' || currentUser?.perfil === 'bp_rh') && (
            <motion.div
              key="rh"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<LoadingSpinner size="lg" text="Carregando sistema..." />}>
                <UnifiedHRSystem user={currentUser} onLogout={handleLogout} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  )
}

export default App