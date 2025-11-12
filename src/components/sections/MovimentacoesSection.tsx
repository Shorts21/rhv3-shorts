import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, RefreshCw, Calendar, User } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import toast from 'react-hot-toast'

interface Movimentacao {
  id: string
  colaborador_nome: string
  tipo: string
  motivo: string
  unidade: string
  data_movimentacao: string
  status: string
  justificativa: string
}

export function MovimentacoesSection() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    colaborador_id: '',
    tipo: '',
    motivo: '',
    unidade: '',
    justificativa: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    status: 'pendente'
  })

  // Mock data - substituir por dados do Supabase
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([
    {
      id: '1',
      colaborador_nome: 'Rafael Oliveira',
      tipo: 'promocao',
      motivo: 'Excelente desempenho',
      unidade: 'Cristalina',
      data_movimentacao: '2024-01-15',
      status: 'aprovada',
      justificativa: 'Colaborador demonstrou crescimento técnico e liderança'
    }
  ])

  const tiposMovimentacao = [
    { value: 'admissao', label: 'Admissão' },
    { value: 'desligamento', label: 'Desligamento' },
    { value: 'promocao', label: 'Promoção' },
    { value: 'transferencia', label: 'Transferência' },
    { value: 'estagio', label: 'Estágio' },
    { value: 'aprendiz', label: 'Aprendiz' }
  ]

  const unidades = [
    'Cristalina',
    'Correntina',
    'Corporativo',
    'Ibicoara',
    'Papanduva',
    'São Gabriel',
    'Uberlandia'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.colaborador_id || !formData.tipo || !formData.motivo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const newMovimentacao: Movimentacao = {
      id: Date.now().toString(),
      colaborador_nome: 'Colaborador Selecionado', // TODO: buscar nome real
      tipo: formData.tipo,
      motivo: formData.motivo,
      unidade: formData.unidade,
      data_movimentacao: formData.data_movimentacao,
      status: formData.status,
      justificativa: formData.justificativa
    }

    setMovimentacoes(prev => [newMovimentacao, ...prev])
    toast.success('Movimentação registrada com sucesso!')
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      colaborador_id: '',
      tipo: '',
      motivo: '',
      unidade: '',
      justificativa: '',
      data_movimentacao: new Date().toISOString().split('T')[0],
      status: 'pendente'
    })
    setShowForm(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'bg-green-100 text-green-800'
      case 'rejeitada': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admissao': return '👋'
      case 'desligamento': return '👋'
      case 'promocao': return '⬆️'
      case 'transferencia': return '🔄'
      case 'estagio': return '🎓'
      case 'aprendiz': return '📚'
      default: return '📋'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Movimentações de Pessoal</h2>
          <p className="text-gray-600">Gerencie admissões, desligamentos, promoções e transferências</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Movimentação
        </motion.button>
      </div>

      {/* Formulário */}
      {showForm && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Movimentação</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colaborador *
                </label>
                <select
                  value={formData.colaborador_id}
                  onChange={(e) => setFormData({ ...formData, colaborador_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione o colaborador</option>
                  <option value="1">Rafael Oliveira</option>
                  <option value="2">Camila Santos</option>
                  <option value="3">Lucas Ferreira</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimentação *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione o tipo</option>
                  {tiposMovimentacao.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade
                </label>
                <select
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione a unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Movimentação
                </label>
                <input
                  type="date"
                  value={formData.data_movimentacao}
                  onChange={(e) => setFormData({ ...formData, data_movimentacao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="rejeitada">Rejeitada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo *
              </label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descreva o motivo da movimentação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificativa
              </label>
              <textarea
                value={formData.justificativa}
                onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Justificativa detalhada da movimentação..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Registrar Movimentação
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </AnimatedCard>
      )}

      {/* Lista de movimentações */}
      <div className="grid gap-4">
        {movimentacoes.map((movimentacao) => (
          <AnimatedCard key={movimentacao.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">{getTipoIcon(movimentacao.tipo)}</span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{movimentacao.colaborador_nome}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(movimentacao.status)}`}>
                      {movimentacao.status.charAt(0).toUpperCase() + movimentacao.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {tiposMovimentacao.find(t => t.value === movimentacao.tipo)?.label}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(movimentacao.data_movimentacao).toLocaleDateString('pt-BR')}
                    </div>
                    {movimentacao.unidade && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {movimentacao.unidade}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{movimentacao.motivo}</p>
                  {movimentacao.justificativa && (
                    <p className="text-xs text-gray-500 mt-1">{movimentacao.justificativa}</p>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}