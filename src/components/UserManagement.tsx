import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CreditCard as Edit, Trash2, User, Phone, Shield } from 'lucide-react'
import { AnimatedCard } from './AnimatedCard'
import { LoadingSpinner } from './LoadingSpinner'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario, useToggleUsuarioStatus } from '../hooks/useSupabaseQuery'
import { Usuario } from '../services/usuarioService'
import toast from 'react-hot-toast'

export function UserManagement() {
  const { data: usuarios = [], isLoading } = useUsuarios()
  const createUsuario = useCreateUsuario()
  const updateUsuario = useUpdateUsuario()
  const deleteUsuario = useDeleteUsuario()
  const toggleStatus = useToggleUsuarioStatus()

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    perfil: 'supervisor' as 'rh' | 'supervisor' | 'colaborador' | 'bp_rh',
    ativo: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.telefone.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      if (editingUser) {
        await updateUsuario.mutateAsync({
          id: editingUser.id,
          usuarioData: formData
        })
      } else {
        await createUsuario.mutateAsync(formData)
      }
      resetForm()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      perfil: 'supervisor',
      ativo: true
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const handleEdit = (user: Usuario) => {
    setFormData({
      nome: user.nome,
      telefone: user.telefone,
      perfil: user.perfil,
      ativo: user.ativo
    })
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (usuario: Usuario) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUsuario.mutateAsync(usuario.id)
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  }

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      await toggleStatus.mutateAsync({
        id: usuario.id,
        currentStatus: usuario.ativo
      })
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Carregando usuários..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-gray-600">Cadastre e gerencie usuários do sistema</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </motion.button>
      </div>

      {/* Formulário */}
      {showForm && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do usuário"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone (Senha) *
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Número do telefone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perfil *
                </label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({ ...formData, perfil: e.target.value as 'rh' | 'supervisor' | 'colaborador' | 'bp_rh' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="supervisor">Supervisor</option>
                  <option value="bp_rh">Business Partner RH</option>
                  <option value="rh">RH</option>
                  <option value="colaborador">Colaborador</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="ativo" className="ml-2 text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createUsuario.isPending || updateUsuario.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {createUsuario.isPending || updateUsuario.isPending
                  ? 'Salvando...'
                  : editingUser ? 'Atualizar Usuário' : 'Criar Usuário'
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

      {/* Lista de usuários */}
      <div className="grid gap-4">
        {usuarios.map((usuario) => (
          <AnimatedCard key={usuario.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  usuario.ativo ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <User className={`w-6 h-6 ${
                    usuario.ativo ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">{usuario.nome}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {usuario.telefone}
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      {usuario.perfil.toUpperCase()}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      usuario.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(usuario)}
                  disabled={toggleStatus.isPending}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    usuario.ativo
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {usuario.ativo ? 'Desativar' : 'Ativar'}
                </button>

                <button
                  onClick={() => handleEdit(usuario)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Editar usuário"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(usuario)}
                  disabled={deleteUsuario.isPending}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir usuário"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  )
}
