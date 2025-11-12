import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, X, FileCheck } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { AvaliacaoDesempenhoFeedback, Colaborador, QUESTOES_FEEDBACK, FATORES_COMPETENCIA } from '../../types'
import { logger } from '../../lib/logger'

interface AvaliacaoFeedbackSectionProps {
  userId: string
}

export function AvaliacaoFeedbackSection({ userId }: AvaliacaoFeedbackSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDesempenhoFeedback[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<AvaliacaoDesempenhoFeedback>>({
    colaborador_id: '',
    trimestre: 1,
    data_avaliacao: new Date().toISOString().split('T')[0],
    concordancia_colaborador: true
  })

  useEffect(() => {
    loadColaboradores()
    loadAvaliacoes()
  }, [])

  const loadColaboradores = async () => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('status', 'ativo')
        .order('nome')

      if (error) throw error
      setColaboradores(data || [])
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
    }
  }

  const loadAvaliacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes_desempenho_feedback')
        .select(`
          *,
          colaborador:colaboradores(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAvaliacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    }
  }

  const calcularTotalPontos = (data: Partial<AvaliacaoDesempenhoFeedback>): number => {
    const campos = [
      'produtividade_1a', 'produtividade_1b', 'produtividade_1c', 'produtividade_1d', 'produtividade_1e',
      'conhecimento_2a', 'conhecimento_2b', 'conhecimento_2c',
      'trabalho_equipe_3a', 'trabalho_equipe_3b', 'trabalho_equipe_3c', 'trabalho_equipe_3d', 'trabalho_equipe_3e',
      'comprometimento_4a', 'comprometimento_4b', 'comprometimento_4c',
      'cumprimento_normas_5a', 'cumprimento_normas_5b', 'cumprimento_normas_5c', 'cumprimento_normas_5d'
    ]

    const notas = campos
      .map(campo => data[campo as keyof AvaliacaoDesempenhoFeedback] as number)
      .filter(nota => nota !== undefined && nota !== null)

    return notas.reduce((acc, nota) => acc + nota, 0)
  }

  const calcularPercentualIDI = (totalPontos: number): number => {
    return parseFloat(((totalPontos / 100) * 100).toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.colaborador_id) {
      toast.error('Selecione um colaborador')
      return
    }

    const camposObrigatorios = [
      'produtividade_1a', 'produtividade_1b', 'produtividade_1c', 'produtividade_1d', 'produtividade_1e',
      'conhecimento_2a', 'conhecimento_2b', 'conhecimento_2c',
      'trabalho_equipe_3a', 'trabalho_equipe_3b', 'trabalho_equipe_3c', 'trabalho_equipe_3d', 'trabalho_equipe_3e',
      'comprometimento_4a', 'comprometimento_4b', 'comprometimento_4c',
      'cumprimento_normas_5a', 'cumprimento_normas_5b', 'cumprimento_normas_5c', 'cumprimento_normas_5d'
    ]

    const camposPreenchidos = camposObrigatorios.every(
      campo => formData[campo as keyof AvaliacaoDesempenhoFeedback] !== undefined
    )

    if (!camposPreenchidos) {
      toast.error('Preencha todas as questões')
      return
    }

    setLoading(true)

    try {
      const total_pontos = calcularTotalPontos(formData)
      const percentual_idi = calcularPercentualIDI(total_pontos)

      // Buscar colaborador correspondente ao usuário
      let avaliadorColaboradorId = userId

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('id', userId)
        .maybeSingle()

      if (usuario) {
        logger.info('🔍 Buscando colaborador para usuário:', usuario.nome)

        const nomePartes = usuario.nome.trim().split(' ')
        const primeiroNome = nomePartes[0]
        const ultimoNome = nomePartes[nomePartes.length - 1]

        const { data: colaboradores } = await supabase
          .from('colaboradores')
          .select('id, nome')
          .or(`nome.ilike.%${primeiroNome}%${ultimoNome}%,nome.ilike.%${usuario.nome}%`)
          .limit(10)

        if (colaboradores && colaboradores.length > 0) {
          avaliadorColaboradorId = colaboradores[0].id
          logger.info('✅ Colaborador encontrado:', colaboradores[0].nome)
        } else {
          logger.error('❌ Nenhum colaborador encontrado para:', usuario.nome)
          toast.error(`Colaborador não encontrado para "${usuario.nome}". Cadastre um colaborador com nome similar primeiro.`)
          setLoading(false)
          return
        }
      }

      const { error } = await supabase
        .from('avaliacoes_desempenho_feedback')
        .insert({
          ...formData,
          avaliador_id: avaliadorColaboradorId,
          total_pontos,
          percentual_idi
        })

      if (error) throw error

      toast.success('Avaliação de desempenho registrada com sucesso!')
      resetForm()
      loadAvaliacoes()
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      toast.error('Erro ao salvar avaliação')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      colaborador_id: '',
      trimestre: 1,
      data_avaliacao: new Date().toISOString().split('T')[0],
      concordancia_colaborador: true
    })
    setShowForm(false)
  }

  const handleNotaChange = (campo: string, valor: number) => {
    if (valor >= 1 && valor <= 5) {
      setFormData(prev => ({ ...prev, [campo]: valor }))
    }
  }

  const getQuestoesPorFator = (fator: number) => {
    return QUESTOES_FEEDBACK.filter(q => q.fator === fator)
  }

  const getClassificacao = (percentual: number): { texto: string; cor: string } => {
    if (percentual >= 80) return { texto: 'Excelente desempenho', cor: 'text-green-600' }
    if (percentual >= 60) return { texto: 'Acima do esperado', cor: 'text-blue-600' }
    if (percentual >= 40) return { texto: 'Dentro do esperado', cor: 'text-yellow-600' }
    if (percentual >= 20) return { texto: 'Abaixo do esperado', cor: 'text-orange-600' }
    return { texto: 'Muito abaixo do esperado', cor: 'text-red-600' }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avaliação de Desempenho - Ciclo de Feedback</h2>
          <p className="text-gray-600">IGARASHI LAVOURA E AGROPECUÁRIA | Avaliação Trimestral</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Avaliação
        </motion.button>
      </div>

      {showForm && (
        <AnimatedCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ficha de Avaliação de Desempenho</h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colaborador *
                </label>
                <select
                  value={formData.colaborador_id}
                  onChange={(e) => setFormData({ ...formData, colaborador_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Selecione o colaborador</option>
                  {colaboradores.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trimestre *
                </label>
                <select
                  value={formData.trimestre}
                  onChange={(e) => setFormData({ ...formData, trimestre: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value={1}>1º Trimestre</option>
                  <option value={2}>2º Trimestre</option>
                  <option value={3}>3º Trimestre</option>
                  <option value={4}>4º Trimestre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Avaliação
                </label>
                <input
                  type="date"
                  value={formData.data_avaliacao}
                  onChange={(e) => setFormData({ ...formData, data_avaliacao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Escala de Avaliação</h4>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="bg-red-100 p-2 rounded text-center">1 - Muito abaixo</div>
                <div className="bg-orange-100 p-2 rounded text-center">2 - Abaixo</div>
                <div className="bg-yellow-100 p-2 rounded text-center">3 - Esperado</div>
                <div className="bg-blue-100 p-2 rounded text-center">4 - Acima</div>
                <div className="bg-green-100 p-2 rounded text-center">5 - Excelente</div>
              </div>
            </div>

            {FATORES_COMPETENCIA.map((fator) => {
              const questoes = getQuestoesPorFator(fator.numero)
              return (
                <div key={fator.numero} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {fator.numero}. {fator.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">{fator.descricao}</p>
                  <div className="space-y-3">
                    {questoes.map((questao) => {
                      const fieldId = `${['produtividade', 'conhecimento', 'trabalho_equipe', 'comprometimento', 'cumprimento_normas'][fator.numero - 1]}_${fator.numero}${questao.letra}`
                      return (
                        <div key={questao.id} className="flex items-start justify-between gap-4">
                          <label className="text-sm text-gray-700 flex-1">
                            {questao.letra}) {questao.texto}
                          </label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((nota) => (
                              <button
                                key={nota}
                                type="button"
                                onClick={() => handleNotaChange(fieldId, nota)}
                                className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all ${
                                  formData[fieldId as keyof AvaliacaoDesempenhoFeedback] === nota
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {nota}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Finais
              </label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Espaço para anotações adicionais, feedbacks e recomendações..."
              />
            </div>

            {Object.keys(formData).length > 5 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total de Pontos</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calcularTotalPontos(formData)} / 100
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Percentual IDI</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {calcularPercentualIDI(calcularTotalPontos(formData))}%
                    </div>
                  </div>
                </div>
                <div className={`mt-2 text-sm font-medium ${getClassificacao(calcularPercentualIDI(calcularTotalPontos(formData))).cor}`}>
                  {getClassificacao(calcularPercentualIDI(calcularTotalPontos(formData))).texto}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Avaliação'}
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

      <div className="grid gap-4">
        {avaliacoes.map((avaliacao) => {
          const classificacao = getClassificacao(avaliacao.percentual_idi || 0)
          return (
            <AnimatedCard key={avaliacao.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {avaliacao.colaborador?.nome}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Trimestre:</span> {avaliacao.trimestre}º
                      </div>
                      <div>
                        <span className="font-medium">Data:</span>{' '}
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Pontos:</span>{' '}
                        <span className="font-bold">{avaliacao.total_pontos}/100</span>
                      </div>
                      <div>
                        <span className="font-medium">IDI:</span>{' '}
                        <span className={`font-bold ${classificacao.cor}`}>
                          {avaliacao.percentual_idi}%
                        </span>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${classificacao.cor}`}>
                      {classificacao.texto}
                    </div>
                    {avaliacao.observacoes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <span className="font-medium">Observações:</span> {avaliacao.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )
        })}

        {avaliacoes.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-500">
            <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma avaliação de feedback registrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
