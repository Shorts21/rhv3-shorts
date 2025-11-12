import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Plus, Edit2, Trash2, Save, X, Briefcase, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../LoadingSpinner'

interface Setor {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  created_at: string
}

export function SetoresSection() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [novoSetor, setNovoSetor] = useState(false)
  const [setorSelecionado, setSetorSelecionada] = useState<Setor | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  })

  useEffect(() => {
    carregarSetores()
  }, [])

  const carregarSetores = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setSetores(data || [])
    } catch (error) {
      console.error('Erro ao carregar setores:', error)
      toast.error('Erro ao carregar setores')
    } finally {
      setLoading(false)
    }
  }

  const salvarSetor = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome do setor é obrigatório')
      return
    }

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('setores')
          .update({
            nome: formData.nome,
            descricao: formData.descricao
          })
          .eq('id', editandoId)

        if (error) {
          console.error('Erro ao atualizar setor:', error)
          throw error
        }
        toast.success('Setor atualizado com sucesso')
      } else {
        const { data, error } = await supabase
          .from('setores')
          .insert({
            nome: formData.nome,
            descricao: formData.descricao,
            ativo: true
          })
          .select()

        if (error) {
          console.error('Erro detalhado ao criar setor:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw error
        }
        console.log('Setor criado:', data)
        toast.success('Setor criado com sucesso')
      }

      setFormData({ nome: '', descricao: '' })
      setEditandoId(null)
      setNovoSetor(false)
      carregarSetores()
    } catch (error: any) {
      console.error('Erro ao salvar setor:', error)
      if (error.code === '23505') {
        toast.error('Já existe um setor com este nome')
      } else if (error.message) {
        toast.error(`Erro: ${error.message}`)
      } else {
        toast.error('Erro ao salvar setor. Verifique o console.')
      }
    }
  }

  const editarSetor = (setor: Setor) => {
    setFormData({
      nome: setor.nome,
      descricao: setor.descricao || ''
    })
    setEditandoId(setor.id)
    setNovoSetor(false)
    setSetorSelecionada(null)
  }

  const cancelarEdicao = () => {
    setFormData({ nome: '', descricao: '' })
    setEditandoId(null)
    setNovoSetor(false)
  }

  const alternarStatus = async (id: string, ativoAtual: boolean) => {
    try {
      const { error } = await supabase
        .from('setores')
        .update({ ativo: !ativoAtual })
        .eq('id', id)

      if (error) throw error
      toast.success(`Setor ${!ativoAtual ? 'ativado' : 'desativado'} com sucesso`)
      carregarSetores()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do setor')
    }
  }

  const excluirSetor = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este setor?')) return

    try {
      const { error } = await supabase
        .from('setores')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Setor excluído com sucesso')
      setSetorSelecionada(null)
      carregarSetores()
    } catch (error) {
      console.error('Erro ao excluir setor:', error)
      toast.error('Erro ao excluir setor')
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 via-white to-purple-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-lg border border-purple-100"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Gestão de Setores
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Gerencie os setores organizacionais da empresa
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => {
            setNovoSetor(true)
            setSetorSelecionada(null)
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Novo Setor
        </motion.button>
      </motion.div>

      {(novoSetor || editandoId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-purple-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {editandoId ? 'Editar Setor' : 'Novo Setor'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Setor *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Descrição do setor"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <motion.button
              onClick={salvarSetor}
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
          {setores.map((setor, index) => (
            <motion.div
              key={setor.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => setSetorSelecionada(setor)}
              className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-500 group-hover:to-purple-600 transition-all">
                    <Layers className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex items-center gap-2">
                    {setor.ativo ? (
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

                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {setor.nome}
                </h3>

                {setor.descricao && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {setor.descricao}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="w-3 h-3" />
                  Criado em {new Date(setor.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      editarSetor(setor)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      alternarStatus(setor.id, setor.ativo)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-yellow-600 hover:bg-yellow-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {setor.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {setor.ativo ? 'Desativar' : 'Ativar'}
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      excluirSetor(setor.id)
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

      {setores.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl shadow-lg"
        >
          <div className="p-6 bg-purple-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Layers className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum setor cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece criando o primeiro setor da empresa</p>
          <motion.button
            onClick={() => setNovoSetor(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Criar primeiro setor
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {setorSelecionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSetorSelecionada(null)}
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
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{setorSelecionado.nome}</h2>
                    {setorSelecionado.ativo ? (
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
                  onClick={() => setSetorSelecionada(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {setorSelecionado.descricao && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h3>
                    <p className="text-gray-600">{setorSelecionado.descricao}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Informações</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Criado em {new Date(setorSelecionado.created_at).toLocaleDateString('pt-BR', {
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
                    editarSetor(setorSelecionado)
                    setSetorSelecionada(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit2 className="w-5 h-5" />
                  Editar
                </motion.button>
                <motion.button
                  onClick={() => {
                    alternarStatus(setorSelecionado.id, setorSelecionado.ativo)
                    setSetorSelecionada(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-3 rounded-xl hover:bg-yellow-700 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {setorSelecionado.ativo ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  {setorSelecionado.ativo ? 'Desativar' : 'Ativar'}
                </motion.button>
                <motion.button
                  onClick={() => {
                    excluirSetor(setorSelecionado.id)
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
