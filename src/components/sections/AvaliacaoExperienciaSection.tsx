import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Save, X, FileText } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { AvaliacaoExperiencia, Colaborador, COMPETENCIAS_EXPERIENCIA } from '../../types'
import { logger } from '../../lib/logger'

interface AvaliacaoExperienciaSectionProps {
  userId: string
  isRH?: boolean
}

export function AvaliacaoExperienciaSection({ userId, isRH = false }: AvaliacaoExperienciaSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoExperiencia[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<AvaliacaoExperiencia>>({
    colaborador_id: '',
    periodo_avaliacao: '45 dias',
    data_avaliacao: new Date().toISOString().split('T')[0],
    resultado: 'Permanece na empresa'
  })

  useEffect(() => {
    loadColaboradores()
    loadAvaliacoes()
  }, [isRH])

  const loadColaboradores = async () => {
    try {
      let query = supabase
        .from('colaboradores')
        .select('*')
        .order('nome')

      // RH vê todos os colaboradores, independente do status
      // Outros usuários veem apenas colaboradores em experiência
      if (!isRH) {
        query = query.eq('status', 'experiencia')
      }

      const { data, error } = await query

      if (error) throw error
      setColaboradores(data || [])
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
    }
  }

  const loadAvaliacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes_experiencia')
        .select(`
          *,
          colaborador:colaboradores!avaliacoes_experiencia_colaborador_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAvaliacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    }
  }

  const calcularNotaFinal = (data: Partial<AvaliacaoExperiencia>): number => {
    const campos = [
      'adaptacao_q1', 'adaptacao_q2', 'adaptacao_q3',
      'conhecimento_q4', 'conhecimento_q5', 'conhecimento_q6', 'conhecimento_q7',
      'conhecimento_q8', 'conhecimento_q9', 'conhecimento_q10',
      'iniciativa_q11', 'iniciativa_q12', 'iniciativa_q13',
      'disciplina_q14', 'disciplina_q15', 'disciplina_q16', 'disciplina_q17',
      'assiduidade_q18', 'assiduidade_q19', 'assiduidade_q20',
      'desenvolvimento_q21', 'desenvolvimento_q22', 'desenvolvimento_q23', 'desenvolvimento_q24'
    ]

    const notas = campos
      .map(campo => data[campo as keyof AvaliacaoExperiencia] as number)
      .filter(nota => nota !== undefined && nota !== null)

    if (notas.length === 0) return 0

    const soma = notas.reduce((acc, nota) => acc + nota, 0)
    return parseFloat((soma / notas.length).toFixed(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.colaborador_id) {
      toast.error('Selecione um colaborador')
      return
    }

    const camposObrigatorios = [
      'adaptacao_q1', 'adaptacao_q2', 'adaptacao_q3',
      'conhecimento_q4', 'conhecimento_q5', 'conhecimento_q6', 'conhecimento_q7',
      'conhecimento_q8', 'conhecimento_q9', 'conhecimento_q10',
      'iniciativa_q11', 'iniciativa_q12', 'iniciativa_q13',
      'disciplina_q14', 'disciplina_q15', 'disciplina_q16', 'disciplina_q17',
      'assiduidade_q18', 'assiduidade_q19', 'assiduidade_q20',
      'desenvolvimento_q21', 'desenvolvimento_q22', 'desenvolvimento_q23', 'desenvolvimento_q24'
    ]

    const camposPreenchidos = camposObrigatorios.every(
      campo => formData[campo as keyof AvaliacaoExperiencia] !== undefined
    )

    if (!camposPreenchidos) {
      toast.error('Preencha todas as questões')
      return
    }

    setLoading(true)

    try {
      const nota_final = calcularNotaFinal(formData)

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
        .from('avaliacoes_experiencia')
        .insert({
          ...formData,
          avaliador_id: avaliadorColaboradorId,
          nota_final
        })

      if (error) throw error

      toast.success('Avaliação registrada com sucesso!')
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
      periodo_avaliacao: '45 dias',
      data_avaliacao: new Date().toISOString().split('T')[0],
      resultado: 'Permanece na empresa'
    })
    setShowForm(false)
  }

  const handleNotaChange = (campo: string, valor: number) => {
    if (valor >= 4.0 && valor <= 10.0) {
      setFormData(prev => ({ ...prev, [campo]: valor }))
    }
  }

  const getClassificacao = (nota: number): { texto: string; cor: string } => {
    if (nota >= 9.0) return { texto: 'Acima das expectativas', cor: 'text-green-600' }
    if (nota >= 8.0) return { texto: 'Satisfatório', cor: 'text-blue-600' }
    if (nota >= 7.0) return { texto: 'Potencial de desenvolvimento', cor: 'text-yellow-600' }
    return { texto: 'Não apresentou competências', cor: 'text-red-600' }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avaliação de Período de Experiência</h2>
          <p className="text-gray-600">Código: GRT-RG&G-00-202 | Avaliação de 45/90 dias</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Formulário de Avaliação</h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
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
                  Período de Avaliação *
                </label>
                <select
                  value={formData.periodo_avaliacao}
                  onChange={(e) => setFormData({ ...formData, periodo_avaliacao: e.target.value as '45 dias' | '90 dias' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="45 dias">45 dias</option>
                  <option value="90 dias">90 dias</option>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-red-100 p-2 rounded">4.0 - 6.9: Não apresentou</div>
                <div className="bg-yellow-100 p-2 rounded">7.0 - 7.9: Potencial</div>
                <div className="bg-blue-100 p-2 rounded">8.0 - 8.9: Satisfatório</div>
                <div className="bg-green-100 p-2 rounded">9.0 - 10.0: Acima</div>
              </div>
            </div>

            {COMPETENCIAS_EXPERIENCIA.map((competencia) => (
              <div key={competencia.numero} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {competencia.numero}. {competencia.titulo}
                </h4>
                <div className="space-y-3">
                  {competencia.questoes.map((questao) => (
                    <div key={questao.id} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex-1">
                        {questao.numero}. {questao.texto}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="4.0"
                        max="10.0"
                        value={formData[questao.id as keyof AvaliacaoExperiencia] as number || ''}
                        onChange={(e) => handleNotaChange(questao.id, parseFloat(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-center"
                        placeholder="4-10"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentários do Colaborador
                </label>
                <textarea
                  value={formData.comentarios_colaborador || ''}
                  onChange={(e) => setFormData({ ...formData, comentarios_colaborador: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Espaço livre para comentários do colaborador..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentários do Superior Imediato
                </label>
                <textarea
                  value={formData.comentarios_superior || ''}
                  onChange={(e) => setFormData({ ...formData, comentarios_superior: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Espaço livre para comentários do superior..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Gerais
                </label>
                <textarea
                  value={formData.observacoes_gerais || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes_gerais: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Anotações adicionais..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado Final *
                </label>
                <select
                  value={formData.resultado}
                  onChange={(e) => setFormData({ ...formData, resultado: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="Permanece na empresa">Permanece na empresa</option>
                  <option value="Desligado durante o período de experiência">Desligado durante o período de experiência</option>
                </select>
              </div>
            </div>

            {Object.keys(formData).length > 5 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  Nota Final Prevista: {calcularNotaFinal(formData).toFixed(2)}
                </div>
                <div className={`text-sm ${getClassificacao(calcularNotaFinal(formData)).cor}`}>
                  {getClassificacao(calcularNotaFinal(formData)).texto}
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
          const classificacao = getClassificacao(avaliacao.nota_final || 0)
          return (
            <AnimatedCard key={avaliacao.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {avaliacao.colaborador?.nome}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Período:</span> {avaliacao.periodo_avaliacao}
                      </div>
                      <div>
                        <span className="font-medium">Data:</span>{' '}
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Nota Final:</span>{' '}
                        <span className={`font-bold ${classificacao.cor}`}>
                          {avaliacao.nota_final?.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          avaliacao.resultado === 'Permanece na empresa'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {avaliacao.resultado}
                        </span>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${classificacao.cor}`}>
                      {classificacao.texto}
                    </div>
                    {avaliacao.comentarios_superior && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <span className="font-medium">Comentários do Superior:</span>{' '}
                        {avaliacao.comentarios_superior}
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
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma avaliação de experiência registrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
