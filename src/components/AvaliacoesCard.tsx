import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, Filter, User, Award, TrendingUp, FileText } from 'lucide-react'
import { AnimatedCard } from './AnimatedCard'
import { LoadingSpinner } from './LoadingSpinner'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AvaliacaoCompleta {
  id: string
  tipo: 'desempenho' | 'experiencia'
  colaborador_nome: string
  avaliador_nome: string
  data_avaliacao: string
  nota_final: number
  created_at: string
}

type FiltroTempo = '7dias' | '15dias' | '30dias' | 'ano' | 'todos'

export function AvaliacoesCard() {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTempo, setFiltroTempo] = useState<FiltroTempo>('30dias')
  const [filtroColaborador, setFiltroColaborador] = useState<string>('todos')
  const [filtroAvaliador, setFiltroAvaliador] = useState<string>('todos')
  const [colaboradores, setColaboradores] = useState<Array<{ id: string, nome: string }>>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<AvaliacaoCompleta | null>(null)

  useEffect(() => {
    loadColaboradores()
    loadAvaliacoes()
  }, [filtroTempo, filtroColaborador, filtroAvaliador])

  const loadColaboradores = async () => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('id, nome')
        .order('nome')

      if (error) throw error
      setColaboradores(data || [])
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
    }
  }

  const getDataInicio = (): string => {
    const hoje = new Date()
    switch (filtroTempo) {
      case '7dias':
        hoje.setDate(hoje.getDate() - 7)
        break
      case '15dias':
        hoje.setDate(hoje.getDate() - 15)
        break
      case '30dias':
        hoje.setDate(hoje.getDate() - 30)
        break
      case 'ano':
        hoje.setFullYear(hoje.getFullYear() - 1)
        break
      case 'todos':
        return '1900-01-01'
    }
    return hoje.toISOString().split('T')[0]
  }

  const loadAvaliacoes = async () => {
    setLoading(true)
    try {
      const dataInicio = getDataInicio()
      const avaliacoesCompletas: AvaliacaoCompleta[] = []

      // Buscar todos os colaboradores primeiro para fazer o mapeamento manualmente
      const { data: todosColaboradores } = await supabase
        .from('colaboradores')
        .select('id, nome')

      const colaboradoresMap = new Map(todosColaboradores?.map(c => [c.id, c.nome]) || [])

      // Buscar avaliações de desempenho
      let queryDesempenho = supabase
        .from('avaliacoes_desempenho')
        .select('*')
        .gte('data_avaliacao', dataInicio)
        .order('data_avaliacao', { ascending: false })

      if (filtroColaborador !== 'todos') {
        queryDesempenho = queryDesempenho.eq('colaborador_id', filtroColaborador)
      }
      if (filtroAvaliador !== 'todos') {
        queryDesempenho = queryDesempenho.eq('avaliador_id', filtroAvaliador)
      }

      const { data: desempenho, error: errorDesempenho } = await queryDesempenho

      if (errorDesempenho) {
        console.error('Erro ao buscar avaliações de desempenho:', errorDesempenho)
        throw errorDesempenho
      }

      if (desempenho && desempenho.length > 0) {
        desempenho.forEach((avaliacao: any) => {
          avaliacoesCompletas.push({
            id: avaliacao.id,
            tipo: 'desempenho',
            colaborador_nome: colaboradoresMap.get(avaliacao.colaborador_id) || 'N/A',
            avaliador_nome: colaboradoresMap.get(avaliacao.avaliador_id) || 'N/A',
            data_avaliacao: avaliacao.data_avaliacao,
            nota_final: parseFloat(avaliacao.media_geral) || 0,
            created_at: avaliacao.created_at
          })
        })
      }

      // Buscar avaliações de experiência
      let queryExperiencia = supabase
        .from('avaliacoes_experiencia')
        .select('*')
        .gte('data_avaliacao', dataInicio)
        .order('data_avaliacao', { ascending: false })

      if (filtroColaborador !== 'todos') {
        queryExperiencia = queryExperiencia.eq('colaborador_id', filtroColaborador)
      }
      if (filtroAvaliador !== 'todos') {
        queryExperiencia = queryExperiencia.eq('avaliador_id', filtroAvaliador)
      }

      const { data: experiencia, error: errorExperiencia } = await queryExperiencia

      if (errorExperiencia) {
        console.error('Erro ao buscar avaliações de experiência:', errorExperiencia)
        throw errorExperiencia
      }

      if (experiencia && experiencia.length > 0) {
        experiencia.forEach((avaliacao: any) => {
          avaliacoesCompletas.push({
            id: avaliacao.id,
            tipo: 'experiencia',
            colaborador_nome: colaboradoresMap.get(avaliacao.colaborador_id) || 'N/A',
            avaliador_nome: colaboradoresMap.get(avaliacao.avaliador_id) || 'N/A',
            data_avaliacao: avaliacao.data_avaliacao,
            nota_final: parseFloat(avaliacao.media_geral) || 0,
            created_at: avaliacao.created_at
          })
        })
      }

      // Ordenar por data
      avaliacoesCompletas.sort((a, b) =>
        new Date(b.data_avaliacao).getTime() - new Date(a.data_avaliacao).getTime()
      )

      setAvaliacoes(avaliacoesCompletas)
    } catch (error: any) {
      console.error('Erro ao carregar avaliações:', error)
      const errorMessage = error?.message || 'Erro desconhecido ao carregar avaliações'
      toast.error(`Erro ao carregar avaliações: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 9) return 'text-green-600 bg-green-100'
    if (nota >= 7) return 'text-blue-600 bg-blue-100'
    if (nota >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getNotaLabel = (nota: number) => {
    if (nota >= 9) return 'Excepcional'
    if (nota >= 7) return 'Bom'
    if (nota >= 6) return 'Satisfatório'
    return 'Necessita Atenção'
  }

  const estatisticas = {
    total: avaliacoes.length,
    mediaGeral: avaliacoes.length > 0
      ? (avaliacoes.reduce((acc, av) => acc + av.nota_final, 0) / avaliacoes.length).toFixed(1)
      : '0.0',
    acima9: avaliacoes.filter(av => av.nota_final >= 9).length,
    entre7e9: avaliacoes.filter(av => av.nota_final >= 7 && av.nota_final < 9).length,
    abaixo7: avaliacoes.filter(av => av.nota_final < 7).length,
  }

  return (
    <AnimatedCard className="p-6" delay={0.7}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              📋 Histórico de Avaliações
            </h3>
            <p className="text-sm text-gray-600">
              {avaliacoes.length} avaliações registradas
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
          <div className="text-sm text-blue-700">Total de Avaliações</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{estatisticas.mediaGeral}</div>
          <div className="text-sm text-green-700">Média Geral</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{estatisticas.acima9}</div>
          <div className="text-sm text-emerald-700">Excepcional (&gt;9)</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{estatisticas.abaixo7}</div>
          <div className="text-sm text-yellow-700">Necessita Atenção (&lt;7)</div>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro de Tempo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Período
                  </label>
                  <select
                    value={filtroTempo}
                    onChange={(e) => setFiltroTempo(e.target.value as FiltroTempo)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7dias">Últimos 7 dias</option>
                    <option value="15dias">Últimos 15 dias</option>
                    <option value="30dias">Últimos 30 dias (Mês)</option>
                    <option value="ano">Último ano</option>
                    <option value="todos">Todas</option>
                  </select>
                </div>

                {/* Filtro de Colaborador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Colaborador Avaliado
                  </label>
                  <select
                    value={filtroColaborador}
                    onChange={(e) => setFiltroColaborador(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos os colaboradores</option>
                    {colaboradores.map((colaborador) => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Avaliador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Avaliador
                  </label>
                  <select
                    value={filtroAvaliador}
                    onChange={(e) => setFiltroAvaliador(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos os avaliadores</option>
                    {colaboradores.map((colaborador) => (
                      <option key={colaborador.id} value={colaborador.id}>
                        {colaborador.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Avaliações */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-8">
            <LoadingSpinner size="md" text="Carregando avaliações..." />
          </div>
        ) : avaliacoes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma avaliação encontrada com os filtros selecionados</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {avaliacoes.map((avaliacao, index) => (
              <motion.div
                key={avaliacao.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAvaliacao(avaliacao)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        avaliacao.tipo === 'desempenho'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {avaliacao.tipo === 'desempenho' ? 'Desempenho' : 'Experiência'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900">{avaliacao.colaborador_nome}</div>
                    <div className="text-sm text-gray-600">
                      Avaliado por: {avaliacao.avaliador_nome}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getNotaColor(avaliacao.nota_final).split(' ')[0]}`}>
                      {avaliacao.nota_final.toFixed(1)}
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${getNotaColor(avaliacao.nota_final)}`}>
                      {getNotaLabel(avaliacao.nota_final)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedAvaliacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAvaliacao(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Detalhes da Avaliação</h3>
                <button
                  onClick={() => setSelectedAvaliacao(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Tipo de Avaliação</div>
                  <div className="font-medium text-gray-900 capitalize">
                    {selectedAvaliacao.tipo === 'desempenho' ? 'Avaliação de Desempenho' : 'Avaliação de Experiência'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Colaborador Avaliado</div>
                  <div className="font-medium text-gray-900">{selectedAvaliacao.colaborador_nome}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Avaliador</div>
                  <div className="font-medium text-gray-900">{selectedAvaliacao.avaliador_nome}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Data da Avaliação</div>
                  <div className="font-medium text-gray-900">
                    {new Date(selectedAvaliacao.data_avaliacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Nota Final</div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-bold text-gray-900">
                      {selectedAvaliacao.nota_final.toFixed(1)}
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-medium ${getNotaColor(selectedAvaliacao.nota_final)}`}>
                      {getNotaLabel(selectedAvaliacao.nota_final)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(selectedAvaliacao.nota_final / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}
