import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, User, Phone } from 'lucide-react'
import { authService } from '../lib/auth'
import { LoadingSpinner } from './LoadingSpinner'
import { AnimatedCard } from './AnimatedCard'
import { useSystemSettings } from '../hooks/useSystemSettings'
import toast from 'react-hot-toast'

interface LoginProps {
  onLogin: (user: { id: string; nome: string; telefone: string; perfil: 'rh' | 'supervisor' | 'colaborador' | 'bp_rh' }) => void
}

export function Login({ onLogin }: LoginProps) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { settings } = useSystemSettings()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome.trim() || !telefone.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    setIsLoading(true)

    try {
      const { user, error } = await authService.login(nome.trim(), telefone.trim())
      
      if (error) {
        toast.error(error)
        return
      }

      if (user) {
        toast.success(`Bem-vindo(a), ${user.nome}!`)
        onLogin(user)
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-md w-full">
        {/* Logo e título */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg p-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={settings.logo_url}
              alt="Logo Igarashi"
              className="w-full h-full object-contain"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema <span className="text-green-600">Luiza</span>
          </h1>
          <p className="text-gray-600 mb-4">
            RH Inteligente da {settings.company_name}
          </p>
          
          {/* Mensagem de boas-vindas */}
          <div className="bg-green-50 rounded-xl p-4 text-left">
            <p className="text-sm text-green-800">
              👋 <strong>Olá!</strong><br/>
              Eu sou a <strong>Luiza</strong>, a assistente de RH da Igarashi.<br/>
              Faça login para começar.<br/>
              <span className="text-xs text-green-600 mt-2 block">
                • Gestor: cadastre e avalie colaboradores<br/>
                • RH: visualize indicadores e relatórios completos
              </span>
            </p>
          </div>
        </motion.div>

        {/* Formulário de login */}
        <AnimatedCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário (nome)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Digite seu nome"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone (Senha) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Digite seu telefone"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Botão de login */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center min-h-[48px]"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </motion.button>
          </form>

        </AnimatedCard>

        {/* Rodapé */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm text-gray-500">
            Desenvolvido pelo Departamento de Tecnologia de Ibicoara - BA
          </p>
        </motion.div>
      </div>
    </div>
  )
}