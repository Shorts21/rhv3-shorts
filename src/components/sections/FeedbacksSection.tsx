import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MessageCircle, Calendar, User } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import { useFeedbacks, useCreateFeedback, useColaboradores } from '../../hooks/useSupabaseQuery'
import { LoadingSpinner } from '../LoadingSpinner'
import toast from 'react-hot-toast'

interface FeedbacksSectionProps {
  supervisorId: string
  supervisorNome: string
}

export function FeedbacksSection({ supervisorId, supervisorNome }: FeedbacksSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    colaborador_id: '',
    pauta: '',
    posicionamento_colaborador: '',
    observacoes: '',
    plano_acao: ''
  })

  const { data: feedbacks = [], isLoading: loadingFeedbacks } = useFeedbacks(supervisorId)
  const { data: colaboradores = [] } = useColaboradores(supervisorId)
  const createFeedback = useCreateFeedback()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.colaborador_id || !formData.pauta.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    console.log('📝 Dados do feedback:', formData)
    console.log('👤 Supervisor ID:', supervisorId)

    try {
      await createFeedback.mutateAsync({
        feedbackData: formData,
        gestorId: supervisorId
      })
      resetForm()
    } catch (error: any) {
      console.error('❌ Erro ao salvar feedback:', error)
      console.error('Detalhes do erro:', error?.message, error?.details)
      toast.error(`Erro ao criar feedback: ${error?.message || 'Erro desconhecido'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      colaborador_id: '',
      pauta: '',
      posicionamento_colaborador: '',
      observacoes: '',
      plano_acao: ''
    })
    setShowForm(false)
  }

  if (loadingFeedbacks) {
    return <LoadingSpinner size="lg" text="Carregando feedbacks..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedbacks</h2>
          <p className="text-gray-600">Gerencie os feedbacks dos seus colaboradores</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Feedback
        </motion.button>
      </div>

      {/* Formulário */}
      {showForm && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Novo Feedback</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colaborador *
              </label>
              <select
                value={formData.colaborador_id}
                onChange={(e) => setFormData({ ...formData, colaborador_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map((colaborador) => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome} - {colaborador.cargo} ({colaborador.setor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pauta *
              </label>
              <input
                type="text"
                value={formData.pauta}
                onChange={(e) => setFormData({ ...formData, pauta: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Assunto principal do feedback"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posicionamento do Colaborador
              </label>
              <textarea
                value={formData.posicionamento_colaborador}
                onChange={(e) => setFormData({ ...formData, posicionamento_colaborador: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Como o colaborador se posicionou sobre o assunto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Observações adicionais sobre o feedback..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plano de Ação
              </label>
              <textarea
                value={formData.plano_acao}
                onChange={(e) => setFormData({ ...formData, plano_acao: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ações acordadas para melhoria..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createFeedback.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {createFeedback.isPending ? 'Salvando...' : 'Salvar Feedback'}
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

      {/* Lista de feedbacks */}
      <div className="grid gap-4">
        {feedbacks.length === 0 ? (
          <AnimatedCard className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum feedback registrado</h3>
            <p className="text-gray-600 mb-4">
              Você ainda não registrou feedbacks para seus colaboradores.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Registrar Primeiro Feedback
            </button>
          </AnimatedCard>
        ) : (
          feedbacks.map((feedback) => (
            <AnimatedCard key={feedback.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feedback.colaborador?.nome}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {feedback.gestor?.nome || supervisorNome}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(feedback.data_feedback).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Pauta: </span>
                        <span className="text-gray-600">{feedback.pauta}</span>
                      </div>
                      
                      {feedback.posicionamento_colaborador && (
                        <div>
                          <span className="font-medium text-gray-700">Posicionamento: </span>
                          <span className="text-gray-600">{feedback.posicionamento_colaborador}</span>
                        </div>
                      )}
                      
                      {feedback.observacoes && (
                        <div>
                          <span className="font-medium text-gray-700">Observações: </span>
                          <span className="text-gray-600">{feedback.observacoes}</span>
                        </div>
                      )}
                      
                      {feedback.plano_acao && (
                        <div>
                          <span className="font-medium text-gray-700">Plano de Ação: </span>
                          <span className="text-gray-600">{feedback.plano_acao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))
        )}
      </div>
    </div>
  )
}