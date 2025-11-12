import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CreditCard as Edit, Trash2, FileText, User } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import { useColaboradores, useCreateColaborador, useUpdateColaborador, useDeleteColaborador } from '../../hooks/useSupabaseQuery'
import { useUnidades, useSetores } from '../../hooks/useOrganizationalData'
import { LoadingSpinner } from '../LoadingSpinner'
import { ColaboradorForm, Colaborador } from '../../types'
import toast from 'react-hot-toast'

interface ColaboradoresProps {
  isRH: boolean
  supervisorId?: string
  supervisorName?: string
  onAvaliar?: (colaboradorId: string) => void
}

export function ColaboradoresSection({ isRH, supervisorId, supervisorName, onAvaliar }: ColaboradoresProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null)
  const [formData, setFormData] = useState<ColaboradorForm>({
    nome: '',
    email: '',
    setor: '',
    data_admissao: new Date().toISOString().split('T')[0],
    status: 'ativo'
  })

  const { data: colaboradores = [], isLoading } = useColaboradores(isRH ? undefined : supervisorId)
  const { data: unidades = [] } = useUnidades()
  const { data: setores = [] } = useSetores()
  const createColaborador = useCreateColaborador()
  const updateColaborador = useUpdateColaborador()
  const deleteColaborador = useDeleteColaborador()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim() || !formData.setor.trim()) {
      toast.error('Preencha todos os campos obrigatórios (nome, setor)')
      return
    }

    try {
      if (editingColaborador) {
        await updateColaborador.mutateAsync({
          id: editingColaborador.id,
          colaboradorData: formData
        })
      } else {
        // RH pode criar colaboradores sem gestor_id (perfil administrador)
        // Gestores precisam ter gestorId definido
        if (!isRH && !gestorId) {
          toast.error('Erro: gestor não identificado')
          return
        }
        await createColaborador.mutateAsync({
          colaboradorData: formData,
          gestorId: supervisorId || null
        })
      }
      resetForm()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      setor: '',
      data_admissao: new Date().toISOString().split('T')[0],
      status: 'ativo'
    })
    setEditingColaborador(null)
    setShowForm(false)
  }

  const handleEdit = (colaborador: Colaborador) => {
    setFormData({
      nome: colaborador.nome,
      email: colaborador.email || '',
      setor: colaborador.setor,
      unidade: colaborador.unidade || '',
      data_admissao: colaborador.data_admissao,
      status: colaborador.status
    })
    setEditingColaborador(colaborador)
    setShowForm(true)
  }

  const handleDelete = async (colaborador: Colaborador) => {
    const confirmMessage = 'Deseja realmente excluir este colaborador? Esta ação é irreversível.'
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteColaborador.mutateAsync(colaborador.id)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800'
      case 'experiencia': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'experiencia': return 'Em Experiência'
      default: return 'Desligado'
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Carregando colaboradores..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRH ? 'Todos os Colaboradores' : 'Meus Colaboradores'}
          </h2>
          <p className="text-gray-600">
            {isRH ? 'Gerencie todos os colaboradores da empresa' : 'Gerencie sua equipe'}
          </p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Colaborador
        </motion.button>
      </div>

      {/* Formulário */}
      {showForm && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome completo do colaborador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade *
                </label>
                <select
                  value={formData.unidade || ''}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione uma unidade</option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={unidade.nome}>
                      {unidade.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor *
                </label>
                <select
                  value={formData.setor}
                  onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione um setor</option>
                  {setores.map((setor) => (
                    <option key={setor.id} value={setor.nome}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Admissão
                </label>
                <input
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ativo">Ativo</option>
                  <option value="experiencia">Em Experiência</option>
                  <option value="desligado">Desligado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createColaborador.isPending || updateColaborador.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {createColaborador.isPending || updateColaborador.isPending 
                  ? 'Salvando...' 
                  : editingColaborador ? 'Atualizar Colaborador' : 'Salvar Colaborador'
                }
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

      {/* Lista de colaboradores */}
      <div className="grid gap-4">
        {colaboradores.length === 0 ? (
          <AnimatedCard className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador cadastrado</h3>
            <p className="text-gray-600 mb-4">
              {isRH ? 'Não há colaboradores cadastrados no sistema.' : 'Você ainda não possui colaboradores cadastrados.'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Cadastrar Primeiro Colaborador
            </button>
          </AnimatedCard>
        ) : (
          colaboradores.map((colaborador) => (
            <AnimatedCard key={colaborador.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    colaborador.status === 'ativo' ? 'bg-green-100' : 
                    colaborador.status === 'experiencia' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <span className="text-lg font-semibold text-gray-700">
                      {colaborador.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">{colaborador.nome}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{colaborador.setor}</span>
                      <span>•</span>
                      <span>Admissão: {new Date(colaborador.data_admissao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(colaborador.status)}`}>
                        {getStatusLabel(colaborador.status)}
                      </span>
                      {!isRH && supervisorName && (
                        <span className="ml-2 text-xs text-gray-500">
                          Gestor: {supervisorName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onAvaliar && (
                    <button
                      onClick={() => onAvaliar(colaborador.id)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Avaliar colaborador"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(colaborador)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar colaborador"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(colaborador)}
                    disabled={deleteColaborador.isPending}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir colaborador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))
        )}
      </div>
    </div>
  )
}