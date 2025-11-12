import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Calendar, Building2 } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import { LoadingSpinner } from '../LoadingSpinner'
import { useColaboradores } from '../../hooks/useSupabaseQuery'
import { useUnidades } from '../../hooks/useOrganizationalData'
import { CRITERIOS_AVALIACAO_SUPERVISOR, calcularClassificacaoSupervisor, AvaliacaoDesempenhoSupervisorForm, UNIDADES } from '../../types'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface AvaliacaoDesempenhoSupervisorSectionProps {
  supervisorId: string
  supervisorNome: string
  isBPRH?: boolean
}

export function AvaliacaoDesempenhoSupervisorSection({ supervisorId, supervisorNome, isBPRH = false }: AvaliacaoDesempenhoSupervisorSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [isLoadingAvaliacoes, setIsLoadingAvaliacoes] = useState(true)

  const [formData, setFormData] = useState<AvaliacaoDesempenhoSupervisorForm>({
    colaborador_id: '',
    unidade: '',
    periodo_avaliacao: new Date().toLocaleDateString('pt-BR'),
    assiduidade_faltas_injustificadas: 0,
    assiduidade_atestados_medicos: 0,
    assiduidade_obs: '',
    disciplina_advertencias_pontos: 0,
    disciplina_suspensoes: 0,
    disciplina_obs: '',
    saude_restricoes_sesmt: 0,
    saude_obs: '',
    resultados_desempenho_tecnico: 0,
    resultados_obs: '',
    desenvolvimento_treinamentos: 0,
    desenvolvimento_obs: ''
  })

  const { data: colaboradores = [], isLoading: loadingColaboradores } = useColaboradores(isBPRH ? undefined : supervisorId)
  const { data: unidades = [] } = useUnidades()

  useEffect(() => {
    carregarAvaliacoes()
  }, [])

  const carregarAvaliacoes = async () => {
    try {
      const query = supabase
        .from('avaliacao_desempenho_supervisor')
        .select(`
          *,
          colaborador:colaboradores!avaliacao_desempenho_supervisor_colaborador_id_fkey(*),
          supervisor:colaboradores!avaliacao_desempenho_supervisor_supervisor_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (!isBPRH) {
        query.eq('supervisor_id', supervisorId)
      }

      const { data, error } = await query

      if (error) throw error
      setAvaliacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      toast.error('Erro ao carregar avaliações')
    } finally {
      setIsLoadingAvaliacoes(false)
    }
  }

  const calcularTotalPontos = (form: AvaliacaoDesempenhoSupervisorForm): number => {
    return (
      form.assiduidade_faltas_injustificadas +
      form.assiduidade_atestados_medicos +
      form.disciplina_advertencias_pontos +
      form.disciplina_suspensoes +
      form.saude_restricoes_sesmt +
      form.resultados_desempenho_tecnico +
      form.desenvolvimento_treinamentos
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.colaborador_id || !formData.unidade) {
      toast.error('Selecione um colaborador e uma unidade')
      return
    }

    if (!supervisorId || supervisorId === '') {
      toast.error('ID do supervisor inválido')
      console.error('supervisorId está vazio ou inválido:', supervisorId)
      return
    }

    try {
      const totalPontos = calcularTotalPontos(formData)
      const percentualFinal = (totalPontos / 100) * 100
      const classificacao = calcularClassificacaoSupervisor(percentualFinal)

      const colaborador = colaboradores.find(c => c.id === formData.colaborador_id)

      console.log('Tentando salvar avaliação com:', {
        colaborador_id: formData.colaborador_id,
        supervisor_id: supervisorId,
        supervisor_nome: supervisorNome
      })

      const { data: supervisorExists } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('id', supervisorId)
        .single()

      const dadosInsert: any = {
        colaborador_id: formData.colaborador_id,
        unidade: formData.unidade,
        periodo_avaliacao: formData.periodo_avaliacao,
        assiduidade_faltas_injustificadas: formData.assiduidade_faltas_injustificadas,
        assiduidade_atestados_medicos: formData.assiduidade_atestados_medicos,
        assiduidade_obs: formData.assiduidade_obs || null,
        disciplina_advertencias_pontos: formData.disciplina_advertencias_pontos,
        disciplina_suspensoes: formData.disciplina_suspensoes,
        disciplina_obs: formData.disciplina_obs || null,
        saude_restricoes_sesmt: formData.saude_restricoes_sesmt,
        saude_obs: formData.saude_obs || null,
        resultados_desempenho_tecnico: formData.resultados_desempenho_tecnico,
        resultados_obs: formData.resultados_obs || null,
        desenvolvimento_treinamentos: formData.desenvolvimento_treinamentos,
        desenvolvimento_obs: formData.desenvolvimento_obs || null,
        assiduidade_faltas: 0,
        assiduidade_atestados: 0,
        disciplina_advertencias: 0,
        disciplina_comportamento: 0,
        produtividade_qualidade: 0,
        produtividade_quantidade: 0,
        produtividade_prazos: 0,
        relacionamento_equipe: 0,
        relacionamento_clientes: 0,
        postura_apresentacao: 0,
        postura_comunicacao: 0,
        engajamento_iniciativa: 0,
        engajamento_comprometimento: 0,
        total_pontos: totalPontos,
        percentual_final: percentualFinal,
        classificacao: classificacao,
        nome_supervisor: supervisorNome,
        nome_colaborador_avaliado: colaborador?.nome,
        confirmacao_supervisor: true,
        data_confirmacao_supervisor: new Date().toISOString()
      }

      if (supervisorExists) {
        dadosInsert.supervisor_id = supervisorId
      }

      const { error } = await supabase
        .from('avaliacao_desempenho_supervisor')
        .insert(dadosInsert)

      if (error) {
        console.error('Erro detalhado:', error)
        console.error('Dados enviados:', {
          colaborador_id: formData.colaborador_id,
          supervisor_id: supervisorId,
          unidade: formData.unidade
        })
        throw error
      }

      toast.success('✅ Avaliação criada com sucesso!')
      resetForm()
      carregarAvaliacoes()
    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error)
      toast.error(`Erro: ${error.message || 'Não foi possível salvar a avaliação'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      colaborador_id: '',
      unidade: '',
      periodo_avaliacao: new Date().toLocaleDateString('pt-BR'),
      assiduidade_faltas_injustificadas: 0,
      assiduidade_atestados_medicos: 0,
      assiduidade_obs: '',
      disciplina_advertencias_pontos: 0,
      disciplina_suspensoes: 0,
      disciplina_obs: '',
      saude_restricoes_sesmt: 0,
      saude_obs: '',
      resultados_desempenho_tecnico: 0,
      resultados_obs: '',
      desenvolvimento_treinamentos: 0,
      desenvolvimento_obs: ''
    })
    setShowForm(false)
  }

  if (loadingColaboradores || isLoadingAvaliacoes) {
    return <LoadingSpinner size="lg" text="Carregando..." />
  }

  const totalAtual = calcularTotalPontos(formData)
  const percentualAtual = (totalAtual / 100) * 100
  const classificacaoAtual = calcularClassificacaoSupervisor(percentualAtual)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Programa de Avaliação RH Unidade</h2>
          <p className="text-gray-600">Promoções Internas - Tabela de Avaliação</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Avaliação de Promoção</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colaborador *
                </label>
                <select
                  value={formData.colaborador_id}
                  onChange={(e) => setFormData({ ...formData, colaborador_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {colaboradores.map((colaborador) => (
                    <option key={colaborador.id} value={colaborador.id}>
                      {colaborador.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade *
                </label>
                <select
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {UNIDADES.map((unidade) => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período *
                </label>
                <input
                  type="text"
                  value={formData.periodo_avaliacao}
                  onChange={(e) => setFormData({ ...formData, periodo_avaliacao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 1º Trimestre 2024"
                  required
                />
              </div>
            </div>

            {CRITERIOS_AVALIACAO_SUPERVISOR.map((criterio, idx) => (
              <div key={idx} className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-green-100 text-green-700 rounded-full w-10 h-10 flex items-center justify-center mr-2 text-sm font-bold">
                    {criterio.pontos_max}
                  </span>
                  {criterio.categoria}
                </h4>

                <div className="space-y-3">
                  {criterio.itens.map((item: any) => (
                    <div key={item.campo}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {item.label} <span className="text-xs text-gray-500">(máx: {item.pontos_max} pts)</span>
                      </label>
                      <p className="text-xs text-gray-500 mb-2">{item.descricao}</p>
                      <input
                        type="number"
                        min="0"
                        max={item.pontos_max}
                        value={(formData as any)[item.campo]}
                        onChange={(e) => setFormData({ ...formData, [item.campo]: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={(formData as any)[`${criterio.categoria.toLowerCase().split(' ')[1]}_obs`] || ''}
                    onChange={(e) => setFormData({ ...formData, [`${criterio.categoria.toLowerCase().split(' ')[1]}_obs`]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="Observações opcionais sobre este critério..."
                  />
                </div>
              </div>
            ))}

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total de Pontos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAtual}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentual Final</p>
                  <p className="text-2xl font-bold text-gray-900">{percentualAtual.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Classificação</p>
                  <p className="text-2xl font-bold text-green-600">{classificacaoAtual}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Salvar Avaliação
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </AnimatedCard>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Avaliações Realizadas</h3>
        {avaliacoes.length === 0 ? (
          <AnimatedCard className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma avaliação realizada ainda</p>
          </AnimatedCard>
        ) : (
          avaliacoes.map((avaliacao) => (
            <AnimatedCard key={avaliacao.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{avaliacao.colaborador?.nome}</h4>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 inline" />
                    {avaliacao.unidade || 'Não informado'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {avaliacao.periodo_avaliacao} • {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">Supervisor: {avaliacao.supervisor?.nome || avaliacao.nome_supervisor}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{avaliacao.percentual_final?.toFixed(1) || '0.0'}%</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    avaliacao.classificacao === 'Excelente' ? 'bg-green-100 text-green-700' :
                    avaliacao.classificacao === 'Muito Bom' ? 'bg-blue-100 text-blue-700' :
                    avaliacao.classificacao === 'Satisfatório' ? 'bg-teal-100 text-teal-700' :
                    avaliacao.classificacao === 'Regular' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {avaliacao.classificacao || 'Não classificado'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{avaliacao.total_pontos || 0}/100 pontos</p>
                </div>
              </div>
            </AnimatedCard>
          ))
        )}
      </div>
    </div>
  )
}
