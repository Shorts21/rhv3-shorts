import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Save, X, FileText, ChevronDown, ChevronUp, Check, XCircle, Edit2, Trash2, AlertCircle, MessageSquare, Printer } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import { PrintRequisicaoA4 } from '../PrintRequisicaoA4'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { MovimentacaoRequisicaoPessoal, MOTIVOS_MOVIMENTACAO, UNIDADES } from '../../types'
import { authService } from '../../lib/auth'

export function MovimentacaoRequisicaoSection() {
  const [showForm, setShowForm] = useState(false)
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoRequisicaoPessoal[]>([])
  const [loading, setLoading] = useState(false)
  const [showDesligamento, setShowDesligamento] = useState(false)
  const [showPromocao, setShowPromocao] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Modals de aprovação
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<MovimentacaoRequisicaoPessoal | null>(null)
  const [comentario, setComentario] = useState('')
  const [solicitacaoCorrecao, setSolicitacaoCorrecao] = useState('')

  const currentUser = authService.getCurrentUser()
  const isBPRH = authService.isAdmin()

  const [formData, setFormData] = useState<Partial<MovimentacaoRequisicaoPessoal>>({
    data_requisicao: new Date().toISOString().split('T')[0],
    status: 'pendente',
    candidato_pcd: false,
    recurso_mesa: false,
    recurso_cadeira: false,
    recurso_apoio_pes: false,
    recurso_epi_bota: false
  })

  useEffect(() => {
    loadMovimentacoes()
  }, [])

  useEffect(() => {
    if (formData.motivo === 'Demissão') {
      setShowDesligamento(true)
      setShowPromocao(false)
    } else if (formData.motivo === 'Promoção') {
      setShowPromocao(true)
      setShowDesligamento(false)
    } else {
      setShowDesligamento(false)
      setShowPromocao(false)
    }
  }, [formData.motivo])

  const loadMovimentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMovimentacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.unidade || !formData.motivo) {
      toast.error('Preencha os campos obrigatórios: Unidade e Motivo')
      return
    }

    setLoading(true)

    try {
      const userSession = localStorage.getItem('luiza_user_session')
      if (!userSession) {
        toast.error('Sessão não encontrada. Faça login novamente.')
        return
      }

      const user = JSON.parse(userSession)

      if (editingId) {
        // Atualização
        const updateData: any = { ...formData }

        // Se for correção do supervisor, atualizar status e data_correcao
        if (formData.status === 'em_correcao') {
          updateData.status = 'corrigida'
          updateData.data_correcao = new Date().toISOString()
        }

        const { error } = await supabase
          .from('movimentacao_requisicao_pessoal')
          .update(updateData)
          .eq('id', editingId)

        if (error) {
          console.error('Erro do Supabase:', error)
          toast.error(`Erro ao atualizar: ${error.message}`)
          throw error
        }

        toast.success('Requisição atualizada com sucesso!')
      } else {
        // Criação
        const { error } = await supabase
          .from('movimentacao_requisicao_pessoal')
          .insert({
            ...formData,
            requisitante_id: user.id,
            requisitante_nome: user.nome
          })

        if (error) {
          console.error('Erro do Supabase:', error)
          toast.error(`Erro ao salvar: ${error.message}`)
          throw error
        }

        toast.success('Movimentação/Requisição registrada com sucesso!')
      }

      resetForm()
      loadMovimentacoes()
    } catch (error: any) {
      console.error('Erro ao salvar movimentação:', error)
      if (!error.message?.includes('Erro ao salvar:') && !error.message?.includes('Erro ao atualizar:')) {
        toast.error('Erro ao processar requisição. Verifique os campos.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (mov: MovimentacaoRequisicaoPessoal) => {
    setFormData(mov)
    setEditingId(mov.id)
    setShowForm(true)

    if (mov.motivo === 'Demissão') setShowDesligamento(true)
    if (mov.motivo === 'Promoção') setShowPromocao(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta requisição?')) return

    try {
      const { error } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Requisição excluída com sucesso!')
      loadMovimentacoes()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir requisição')
    }
  }

  const handleApprove = async () => {
    if (!selectedMovimentacao || !currentUser) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .update({
          status: 'aprovada',
          aprovador_id: currentUser.id,
          aprovador_nome: currentUser.nome,
          data_aprovacao: new Date().toISOString(),
          comentario_aprovacao: comentario
        })
        .eq('id', selectedMovimentacao.id)

      if (error) throw error

      toast.success('Requisição aprovada com sucesso!')
      setShowApprovalModal(false)
      setComentario('')
      setSelectedMovimentacao(null)
      loadMovimentacoes()
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      toast.error('Erro ao aprovar requisição')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedMovimentacao || !currentUser) return

    if (!comentario.trim()) {
      toast.error('Por favor, informe o motivo da rejeição')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .update({
          status: 'rejeitada',
          aprovador_id: currentUser.id,
          aprovador_nome: currentUser.nome,
          data_aprovacao: new Date().toISOString(),
          comentario_aprovacao: comentario
        })
        .eq('id', selectedMovimentacao.id)

      if (error) throw error

      toast.success('Requisição rejeitada')
      setShowRejectionModal(false)
      setComentario('')
      setSelectedMovimentacao(null)
      loadMovimentacoes()
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      toast.error('Erro ao rejeitar requisição')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestCorrection = async () => {
    if (!selectedMovimentacao || !currentUser) return

    if (!solicitacaoCorrecao.trim()) {
      toast.error('Por favor, descreva as correções necessárias')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('movimentacao_requisicao_pessoal')
        .update({
          status: 'em_correcao',
          solicitacao_correcao: solicitacaoCorrecao,
          aprovador_id: currentUser.id,
          aprovador_nome: currentUser.nome
        })
        .eq('id', selectedMovimentacao.id)

      if (error) throw error

      toast.success('Solicitação de correção enviada ao supervisor')
      setShowCorrectionModal(false)
      setSolicitacaoCorrecao('')
      setSelectedMovimentacao(null)
      loadMovimentacoes()
    } catch (error) {
      console.error('Erro ao solicitar correção:', error)
      toast.error('Erro ao solicitar correção')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      data_requisicao: new Date().toISOString().split('T')[0],
      status: 'pendente',
      candidato_pcd: false,
      recurso_mesa: false,
      recurso_cadeira: false,
      recurso_apoio_pes: false,
      recurso_epi_bota: false
    })
    setShowForm(false)
    setShowDesligamento(false)
    setShowPromocao(false)
    setEditingId(null)
  }

  const calcularPromocao = () => {
    if (formData.promocao_salario_base_atual && formData.promocao_salario_base_proposto) {
      const totalAtual = (formData.promocao_salario_base_atual || 0) + (formData.promocao_gratificacao_atual || 0)
      const totalProposto = (formData.promocao_salario_base_proposto || 0) + (formData.promocao_gratificacao_proposta || 0)
      const reajuste = totalProposto - totalAtual
      const percentual = totalAtual > 0 ? (reajuste / totalAtual) * 100 : 0

      setFormData(prev => ({
        ...prev,
        promocao_total_mes_atual: totalAtual,
        promocao_total_mes_proposto: totalProposto,
        promocao_reajuste_valor: reajuste,
        promocao_reajuste_percentual: parseFloat(percentual.toFixed(2))
      }))
    }
  }

  useEffect(() => {
    if (showPromocao) {
      calcularPromocao()
    }
  }, [
    formData.promocao_salario_base_atual,
    formData.promocao_salario_base_proposto,
    formData.promocao_gratificacao_atual,
    formData.promocao_gratificacao_proposta
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejeitada': return 'bg-red-100 text-red-800 border-red-200'
      case 'em_correcao': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'corrigida': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovada': return 'Aprovada'
      case 'rejeitada': return 'Rejeitada'
      case 'em_correcao': return 'Em Correção'
      case 'corrigida': return 'Corrigida'
      default: return 'Pendente'
    }
  }

  const getMotivoIcon = (motivo: string) => {
    switch (motivo) {
      case 'Aumento de Quadro': return '➕'
      case 'Substituição': return '🔄'
      case 'Transferência - Área': return '↔️'
      case 'Promoção': return '⬆️'
      case 'Demissão': return '👋'
      case 'Estágio': return '🎓'
      case 'Prestador de Serviço': return '🤝'
      case 'Transferência - Unidade': return '🏢'
      case 'Aprendiz': return '📚'
      default: return '📋'
    }
  }

  const canEditOrDelete = (mov: MovimentacaoRequisicaoPessoal) => {
    if (isBPRH) return true
    return mov.requisitante_id === currentUser?.id && mov.status === 'em_correcao'
  }

  const handlePrint = (mov: MovimentacaoRequisicaoPessoal) => {
    setSelectedMovimentacao(mov)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="space-y-6">
      {selectedMovimentacao && (
        <PrintRequisicaoA4 data={selectedMovimentacao} />
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Movimentação / Requisição de Pessoal</h2>
          <p className="text-gray-600">Código: GPFR-G&G-MP01-2025 | Sistema de Gestão de Processo</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Requisição
        </motion.button>
      </div>

{showForm && (
        <AnimatedCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Editar Requisição' : 'Nova Requisição'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área do Requisitante
                </label>
                <input
                  type="text"
                  value={formData.area_requisitante || ''}
                  onChange={(e) => setFormData({ ...formData, area_requisitante: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Área"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Requisição
                </label>
                <input
                  type="date"
                  value={formData.data_requisicao}
                  onChange={(e) => setFormData({ ...formData, data_requisicao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previsão de Fechamento
                </label>
                <input
                  type="date"
                  value={formData.previsao_fechamento || ''}
                  onChange={(e) => setFormData({ ...formData, previsao_fechamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade da Movimentação *
                </label>
                <select
                  value={formData.unidade || ''}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Selecione a unidade</option>
                  {UNIDADES.map((unidade) => (
                    <option key={unidade} value={unidade}>{unidade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da Movimentação/Requisição *
                </label>
                <select
                  value={formData.motivo || ''}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Selecione o motivo</option>
                  {MOTIVOS_MOVIMENTACAO.map((motivo) => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-4">Informações da Vaga / Colaborador</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                  <input
                    type="text"
                    value={formData.cargo || ''}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
                  <select
                    value={formData.sexo || ''}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área / Setor</label>
                  <input
                    type="text"
                    value={formData.area_setor || ''}
                    onChange={(e) => setFormData({ ...formData, area_setor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Centro de Custo</label>
                  <input
                    type="text"
                    value={formData.centro_custo || ''}
                    onChange={(e) => setFormData({ ...formData, centro_custo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Trabalho</label>
                  <input
                    type="text"
                    value={formData.horario_trabalho || ''}
                    onChange={(e) => setFormData({ ...formData, horario_trabalho: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 08:00 - 17:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Colaborador</label>
                  <input
                    type="text"
                    value={formData.nome_colaborador || ''}
                    onChange={(e) => setFormData({ ...formData, nome_colaborador: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.candidato_pcd || false}
                    onChange={(e) => setFormData({ ...formData, candidato_pcd: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Candidato P.C.D.</label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipamentos e Acessos
              </label>
              <textarea
                value={formData.equipamentos_acessos || ''}
                onChange={(e) => setFormData({ ...formData, equipamentos_acessos: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Descreva: carro, celular, notebook, senhas de acesso, e-mail, local de trabalho, sistemas específicos etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa</label>
              <textarea
                value={formData.justificativa || ''}
                onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Descreva o motivo da solicitação, necessidade de movimentação ou contexto da vaga"
              />
            </div>

            {showDesligamento && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-red-900">Para Casos de Desligamento</h4>
                  <button
                    type="button"
                    onClick={() => setShowDesligamento(false)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Colaborador</label>
                    <input
                      type="text"
                      value={formData.desligamento_nome_colaborador || ''}
                      onChange={(e) => setFormData({ ...formData, desligamento_nome_colaborador: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Rescisão</label>
                      <select
                        value={formData.desligamento_tipo_rescisao || ''}
                        onChange={(e) => setFormData({ ...formData, desligamento_tipo_rescisao: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Iniciativa da Empresa">Iniciativa da Empresa</option>
                        <option value="Pedido de Demissão">Pedido de Demissão</option>
                        <option value="Término de Contrato">Término de Contrato</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aviso</label>
                      <select
                        value={formData.desligamento_aviso || ''}
                        onChange={(e) => setFormData({ ...formData, desligamento_aviso: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Indenizado">Indenizado</option>
                        <option value="Trabalhado">Trabalhado</option>
                        <option value="Justa Causa">Justa Causa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Período de Experiência</label>
                      <select
                        value={formData.desligamento_periodo_experiencia || ''}
                        onChange={(e) => setFormData({ ...formData, desligamento_periodo_experiencia: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Selecione</option>
                        <option value="45 dias">45 dias</option>
                        <option value="90 dias">90 dias</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recontratação</label>
                      <select
                        value={formData.desligamento_recontratacao || ''}
                        onChange={(e) => setFormData({ ...formData, desligamento_recontratacao: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Selecione</option>
                        <option value="Poderá retornar">Poderá retornar</option>
                        <option value="Não poderá retornar">Não poderá retornar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Justificativa do Desligamento</label>
                    <textarea
                      value={formData.desligamento_justificativa || ''}
                      onChange={(e) => setFormData({ ...formData, desligamento_justificativa: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {showPromocao && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-blue-900">Promoção com Alteração de Cargo / Salário</h4>
                  <button
                    type="button"
                    onClick={() => setShowPromocao(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900 text-sm">Situação Atual</h5>
                    <input
                      type="text"
                      placeholder="Unidade"
                      value={formData.promocao_unidade_atual || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_unidade_atual: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Setor"
                      value={formData.promocao_setor_atual || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_setor_atual: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Centro de Custo"
                      value={formData.promocao_centro_custo_atual || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_centro_custo_atual: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Cargo"
                      value={formData.promocao_cargo_atual || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_cargo_atual: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Salário Base"
                      value={formData.promocao_salario_base_atual || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_salario_base_atual: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Gratificação"
                      value={formData.promocao_gratificacao_atual || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_gratificacao_atual: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <div className="bg-gray-100 p-2 rounded">
                      <div className="text-xs text-gray-600">Total Mês</div>
                      <div className="font-semibold text-gray-900">
                        R$ {(formData.promocao_total_mes_atual || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900 text-sm">Situação Proposta</h5>
                    <input
                      type="text"
                      placeholder="Unidade"
                      value={formData.promocao_unidade_proposta || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_unidade_proposta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Setor"
                      value={formData.promocao_setor_proposto || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_setor_proposto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Centro de Custo"
                      value={formData.promocao_centro_custo_proposto || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_centro_custo_proposto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Cargo"
                      value={formData.promocao_cargo_proposto || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_cargo_proposto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Salário Base"
                      value={formData.promocao_salario_base_proposto || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_salario_base_proposto: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Gratificação"
                      value={formData.promocao_gratificacao_proposta || ''}
                      onChange={(e) => setFormData({ ...formData, promocao_gratificacao_proposta: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <div className="bg-green-100 p-2 rounded">
                      <div className="text-xs text-gray-600">Total Mês</div>
                      <div className="font-semibold text-green-900">
                        R$ {(formData.promocao_total_mes_proposto || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Reajuste (R$):</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        R$ {(formData.promocao_reajuste_valor || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reajuste (%):</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {(formData.promocao_reajuste_percentual || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Recursos Necessários</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recurso_mesa || false}
                    onChange={(e) => setFormData({ ...formData, recurso_mesa: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mesa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recurso_cadeira || false}
                    onChange={(e) => setFormData({ ...formData, recurso_cadeira: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cadeira</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recurso_apoio_pes || false}
                    onChange={(e) => setFormData({ ...formData, recurso_apoio_pes: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Apoio para os pés</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recurso_epi_bota || false}
                    onChange={(e) => setFormData({ ...formData, recurso_epi_bota: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">EPI - Bota de Segurança</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Salvando...' : editingId ? 'Atualizar Requisição' : 'Salvar Requisição'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </AnimatedCard>
      )}

      {/* Lista de Movimentações */}
      <div className="grid gap-4">
        {movimentacoes.map((mov) => (
          <AnimatedCard key={mov.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{getMotivoIcon(mov.motivo || '')}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{mov.motivo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mov.status)}`}>
                      {getStatusText(mov.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-2">
                    <div><span className="font-medium">Unidade:</span> {mov.unidade}</div>
                    <div><span className="font-medium">Requisitante:</span> {mov.requisitante_nome}</div>
                    <div><span className="font-medium">Data:</span> {new Date(mov.data_requisicao).toLocaleDateString('pt-BR')}</div>
                    {mov.cargo && <div><span className="font-medium">Cargo:</span> {mov.cargo}</div>}
                  </div>

                  {mov.nome_colaborador && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Colaborador:</span> {mov.nome_colaborador}
                    </div>
                  )}

                  {mov.solicitacao_correcao && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-orange-900">Correção Solicitada:</span>
                          <p className="text-orange-800 mt-1">{mov.solicitacao_correcao}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mov.comentario_aprovacao && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-blue-900">Comentário do Aprovador:</span>
                          <p className="text-blue-800 mt-1">{mov.comentario_aprovacao}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            Por {mov.aprovador_nome} em {mov.data_aprovacao && new Date(mov.data_aprovacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {mov.justificativa && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <span className="font-medium">Justificativa:</span> {mov.justificativa}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 ml-4">
                {isBPRH && (mov.status === 'pendente' || mov.status === 'corrigida') && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedMovimentacao(mov)
                        setShowApprovalModal(true)
                      }}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Aprovar"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMovimentacao(mov)
                        setShowCorrectionModal(true)
                      }}
                      className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                      title="Solicitar Correção"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMovimentacao(mov)
                        setShowRejectionModal(true)
                      }}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Rejeitar"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}

                {mov.status === 'aprovada' && (
                  <button
                    onClick={() => handlePrint(mov)}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Imprimir / Exportar PDF"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                )}

                {canEditOrDelete(mov) && (
                  <>
                    <button
                      onClick={() => handleEdit(mov)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {isBPRH && (
                      <button
                        onClick={() => handleDelete(mov.id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </AnimatedCard>
        ))}

        {movimentacoes.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma movimentação/requisição registrada</p>
          </div>
        )}
      </div>

      {/* Modal de Aprovação */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Aprovar Requisição</h3>
              <p className="text-gray-600 mb-4">
                Deseja aprovar a requisição <strong>{selectedMovimentacao?.motivo}</strong>?
              </p>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Comentário (opcional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Aprovando...' : 'Aprovar'}
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setComentario('')
                    setSelectedMovimentacao(null)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Rejeição */}
      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeitar Requisição</h3>
              <p className="text-gray-600 mb-4">
                Informe o motivo da rejeição da requisição <strong>{selectedMovimentacao?.motivo}</strong>:
              </p>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Motivo da rejeição *"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={loading || !comentario.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Rejeitando...' : 'Rejeitar'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectionModal(false)
                    setComentario('')
                    setSelectedMovimentacao(null)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Solicitação de Correção */}
      <AnimatePresence>
        {showCorrectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Solicitar Correção</h3>
              <p className="text-gray-600 mb-4">
                Descreva as correções necessárias para a requisição <strong>{selectedMovimentacao?.motivo}</strong>:
              </p>
              <textarea
                value={solicitacaoCorrecao}
                onChange={(e) => setSolicitacaoCorrecao(e.target.value)}
                placeholder="Descreva as correções necessárias *"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={handleRequestCorrection}
                  disabled={loading || !solicitacaoCorrecao.trim()}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
                <button
                  onClick={() => {
                    setShowCorrectionModal(false)
                    setSolicitacaoCorrecao('')
                    setSelectedMovimentacao(null)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
