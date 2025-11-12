import { motion } from 'framer-motion'
import {
  Users,
  Briefcase,
  RefreshCw,
  MessageCircle,
  BarChart3,
  UserPlus,
  FileText,
  LogOut,
  Building2,
  Award,
  TrendingUp,
  ClipboardList,
  UserCheck,
  Layers,
  ChevronDown,
  Home,
  Settings,
  Target
} from 'lucide-react'
import { User } from '../lib/auth'
import { useSystemSettings } from '../hooks/useSystemSettings'
import { useState } from 'react'

interface SidebarProps {
  user: User
  activeSection: string
  onSectionChange: (section: string) => void
  onLogout: () => void
}

interface MenuGroup {
  title: string
  icon: any
  items: MenuItem[]
}

interface MenuItem {
  id: string
  label: string
  icon: any
}

export function Sidebar({ user, activeSection, onSectionChange, onLogout }: SidebarProps) {
  const { settings } = useSystemSettings()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['dashboards', 'pessoas', 'estrutura'])

  const rhMenuGroups: MenuGroup[] = [
    {
      title: 'Dashboards',
      icon: BarChart3,
      items: [
        { id: 'dashboard', label: 'Visão Geral', icon: Home },
        { id: 'metricas', label: 'Métricas RH', icon: TrendingUp },
        { id: 'indicadores', label: 'Indicadores', icon: Award },
        { id: 'turnover', label: 'Turnover e Retenção', icon: UserCheck },
      ]
    },
    {
      title: 'Gestão de Pessoas',
      icon: Users,
      items: [
        { id: 'colaboradores', label: 'Colaboradores', icon: Users },
        { id: 'avaliar', label: 'Avaliar Colaborador', icon: FileText },
        { id: 'avaliacao-experiencia', label: 'Avaliação Experiência', icon: Award },
        { id: 'avaliacao-feedback', label: 'Avaliação Desempenho', icon: TrendingUp },
        { id: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
        { id: 'avaliacao-supervisor', label: 'Avaliação Supervisor', icon: Target },
      ]
    },
    {
      title: 'Estrutura Organizacional',
      icon: Building2,
      items: [
        { id: 'unidades', label: 'Unidades', icon: Building2 },
        { id: 'setores', label: 'Setores', icon: Layers },
        { id: 'cargos', label: 'Cargos', icon: Briefcase },
      ]
    },
    {
      title: 'Movimentações',
      icon: RefreshCw,
      items: [
        { id: 'movimentacao-requisicao', label: 'Requisições', icon: ClipboardList },
        { id: 'movimentacoes', label: 'Histórico', icon: RefreshCw },
      ]
    },
    {
      title: 'Administração',
      icon: Settings,
      items: [
        { id: 'usuarios', label: 'Usuários', icon: UserPlus },
      ]
    }
  ]

  const supervisorMenuGroups: MenuGroup[] = [
    {
      title: 'Minha Equipe',
      icon: Users,
      items: [
        { id: 'meus-colaboradores', label: 'Meus Colaboradores', icon: Users },
        { id: 'avaliar', label: 'Avaliar Colaborador', icon: FileText },
        { id: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
      ]
    }
  ]

  const menuGroups = user.perfil === 'rh' ? rhMenuGroups : supervisorMenuGroups

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  return (
    <motion.div
      className="w-72 bg-gradient-to-b from-gray-50 to-white shadow-2xl h-screen flex flex-col border-r border-gray-200"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className="p-6 bg-gradient-to-r from-green-600 to-green-700">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg p-1.5">
            <img
              src={settings.logo_url}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Luiza</h1>
            <p className="text-sm text-green-100">RH {settings.company_name}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium">Bem-vindo(a)</p>
            <p className="font-bold text-gray-900 text-sm">{user.nome}</p>
            <span className="inline-block px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full mt-1">
              {user.perfil === 'rh' ? 'RH' : user.perfil === 'bp_rh' ? 'BP RH' : 'Supervisor'}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="space-y-2">
          {menuGroups.map((group) => {
            const GroupIcon = group.icon
            const isExpanded = expandedGroups.includes(group.title)

            return (
              <div key={group.title} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-green-600 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="w-4 h-4" />
                    <span>{group.title}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.id

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => onSectionChange(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                          }`}
                          whileHover={{ x: isActive ? 0 : 4, scale: isActive ? 1 : 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-1.5 rounded-lg ${
                            isActive
                              ? 'bg-white bg-opacity-20'
                              : 'bg-gray-100 group-hover:bg-green-100'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-left">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="w-1.5 h-1.5 bg-white rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium text-sm border border-red-200 hover:border-red-300 hover:shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-1.5 bg-red-100 rounded-lg">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="flex-1 text-left">Sair do Sistema</span>
        </motion.button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </motion.div>
  )
}
