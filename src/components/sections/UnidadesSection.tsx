import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Plus, Edit2, Trash2, Save, X, MapPin, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../LoadingSpinner'

interface Unidade {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  created_at: string
}

export function UnidadesSection() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novaUnidade, setNovaUnidade] = useState(false)
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<Unidade | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  })

  useEffect(() => {
    carregarUnidades()
  }, [])

  const carregarUnidades = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setUnidades(data || [])
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
      toast.error('Erro ao carregar unidades')
    } finally {
      setLoading(false)
    }
  }

  const salvarUnidade = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome da unidade é obrigatório')
      return
    }

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('unidades')
          .update({
            nome: formData.nome,
            descricao: formData.descricao
          })
          .eq('id', editandoId)

        if (error) {
          console.error('Erro ao atualizar unidade:', error)
          throw error
        }
        toast.success('Unidade atualizada com sucesso')
      } else {
        const { data, error } = await supabase
          .from('unidades')
          .insert({
            nome: formData.nome,
            descricao: formData.descricao,
            ativo: true
          })
          .select()

        if (error) {
          console.error('Erro detalhado ao criar unidade:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw error
        }
        console.log('Unidade criada:', data)
        toast.success('Unidade criada com sucesso')
      }

      setFormData({ nome: '', descricao: '' })
      setEditandoId(null)
      setNovaUnidade(false)
      carregarUnidades()
    } catch (error: any) {
      console.error('Erro ao salvar unidade:', error)
      if (error.code === '23505') {
        toast.error('Já existe uma unidade com este nome')
      } else if (error.message) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error('Erro ao salvar unidade. Verifique o console.')
      }
    }
  }

  const editarUnidade = (unidade: Unidade) => {
    setFormData({
      nome: unidade.nome,
      descricao: unidade.descricao || ''
    })
    setEditandoId(unidade.id)
    setNovaUnidade(false)
    setUnidadeSelecionada(null)
  }

  const cancelarEdicao = () => {
    setFormData({ nome: '', descricao: '' })
    setEditandoId(null)
    setNovaUnidade(false)
  }

  const alternarStatus = async (id: string, ativoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from('unidades')
        .update({ ativo: !ativoAtual })
        .eq('id', id)

      if (error) throw error
      toast.success(`Unidade ${!ativoAtual ? 'ativada' : 'desativada'} com sucesso`)
      carregarUnidades()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status da unidade')
    }
  }

  const excluirUnidade = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return

    try {
      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Unidade excluída com sucesso')
      setUnidadeSelecionada(null)
      carregarUnidades()
    } catch (error) {
      console.error('Erro ao excluir unidade:', error)
      toast.error('Erro ao excluir unidade')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-lg border border-blue-100"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Gestão de Unidades
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Gerencie as unidades organizacionais da empresa
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => {
            setNovaUnidade(true)
            setUnidadeSelecionada(null)
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Nova Unidade
        </motion.button>
      </motion.div>

      {(novaUnidade || editandoId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {editandoId ? 'Editar Unidade' : 'Nova Unidade'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome da Unidade *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Sede, Filial São Paulo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Descrição da unidade"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              onClick={salvarUnidade}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-5 h-5" />
              Salvar
            </motion.button>
            <motion.button
              onClick={cancelarEdicao}
              className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-5 h-5" />
              Cancelar
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {unidades.map((unidade, index) => (
            <motion.div
              key={unidade.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setUnidadeSelecionada(unidade)}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                    <Building2 className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    {unidade.ativo ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle className="w-3 h-3" />
                        Ativa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        <XCircle className="w-3 h-3" />
                        Inativa
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {unidade.nome}
                </h3>

                {unidade.descricao && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {unidade.descricao}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="w-3 h-3" />
                  Criado em {new Date(unidade.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      editarUnidade(unidade)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      alternarStatus(unidade.id, unidade.ativo)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-yellow-600 hover:bg-yellow-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {unidade.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {unidade.ativo ? 'Desativar' : 'Ativar'}
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      excluirUnidade(unidade.id)
                    }}
                    className="flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {unidades.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl shadow-lg"
        >
          <div className="p-6 bg-blue-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Building2 className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma unidade cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando a primeira unidade da empresa</p>
          <motion.button
            onClick={() => setNovaUnidade(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Criar primeira unidade
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {unidadeSelecionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUnidadeSelecionada(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{unidadeSelecionada.nome}</h2>
                    {unidadeSelecionada.ativo ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 mt-2">
                        <CheckCircle className="w-3 h-3" />
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 mt-2">
                        <XCircle className="w-3 h-3" />
                        Inativa
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setUnidadeSelecionada(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {unidadeSelecionada.descricao && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h3>
                    <p className="text-gray-600">{unidadeSelecionada.descricao}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Informações</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Criado em {new Date(unidadeSelecionada.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => {
                    editarUnidade(unidadeSelecionada)
                    setUnidadeSelecionada(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit2 className="w-5 h-5" />
                  Editar
                </motion.button>
                <motion.button
                  onClick={() => {
                    alternarStatus(unidadeSelecionada.id, unidadeSelecionada.ativo)
                    setUnidadeSelecionada(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-3 rounded-xl hover:bg-yellow-700 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {unidadeSelecionada.ativo ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  {unidadeSelecionada.ativo ? 'Desativar' : 'Ativar'}
                </motion.button>
                <motion.button
                  onClick={() => {
                    excluirUnidade(unidadeSelecionada.id)
                  }}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-5 h-5" />
                  Excluir
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
