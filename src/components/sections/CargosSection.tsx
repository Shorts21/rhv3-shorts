import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, CreditCard as Edit, Trash2, Briefcase } from 'lucide-react'
import { AnimatedCard } from '../AnimatedCard'
import { useCargos, useCreateCargo } from '../../hooks/useSupabaseQuery'
import { LoadingSpinner } from '../LoadingSpinner'
import toast from 'react-hot-toast'

interface Cargo {
  id: string
  codigo: string
  nome: string
  descricao?: string
  competencias_tecnicas: string[]
  competencias_comportamentais: string[]
  salario_base?: number
}

export function CargosSection() {
  const [showForm, setShowForm] = useState(false)
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    competencias_tecnicas: [] as string[],
    competencias_comportamentais: [] as string[],
    salario_base: ''
  })

  const { data: cargos = [], isLoading } = useCargos()
  const createCargo = useCreateCargo()

  const competenciasTecnicasDisponiveis = [
    'Operação de máquinas',
    'Controle de qualidade',
    'Segurança do trabalho',
    'Manutenção preventiva',
    'Análise de dados',
    'Gestão de equipes',
    'Planejamento estratégico',
    'Conhecimento em informática'
  ]

  const competenciasComportamentaisDisponiveis = [
    'Agressividade',
    'Desenvolvimento relacional',
    'Facilidade com mudanças',
    'Extroversão',
    'Dominância',
    'Desenvolvimento por trabalho',
    'Formalidade',
    'Condescendência',
    'Concentração',
    'Perfil técnico',
    'Exatidão',
    'Detalhismo',
    'Perfil artístico',
    'Paciência',
    'Empatia',
    'Sociabilidade',
    'Entusiasmo',
    'Capacidade de sonhar',
    'Automotivação',
    'Multitarefas',
    'Independência'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      toast.error('Preencha o nome do cargo')
      return
    }

    try {
      const cargoData = {
        codigo: formData.codigo || `CARGO_${Date.now()}`,
        nome: formData.nome,
        descricao: formData.descricao,
        competencias_tecnicas: formData.competencias_tecnicas,
        competencias_comportamentais: formData.competencias_comportamentais,
        salario_base: formData.salario_base ? parseFloat(formData.salario_base) : undefined
      }

      await createCargo.mutateAsync(cargoData)
      resetForm()
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const resetForm = () => {
    setFormData({
      codigo: '',
      nome: '',
      descricao: '',
      competencias_tecnicas: [],
      competencias_comportamentais: [],
      salario_base: ''
    })
    setEditingCargo(null)
    setShowForm(false)
  }

  const toggleCompetencia = (competencia: string, tipo: 'tecnicas' | 'comportamentais') => {
    const field = tipo === 'tecnicas' ? 'competencias_tecnicas' : 'competencias_comportamentais'
    const current = formData[field]
    
    if (current.includes(competencia)) {
      setFormData({
        ...formData,
        [field]: current.filter(c => c !== competencia)
      })
    } else {
      setFormData({
        ...formData,
        [field]: [...current, competencia]
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Carregando cargos..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cargos e Competências</h2>
          <p className="text-gray-600">Gerencie os cargos e suas competências técnicas e comportamentais</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Cargo
        </motion.button>
      </div>

      {/* Formulário */}
      {showForm && (
        <AnimatedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCargo ? 'Editar Cargo' : 'Novo Cargo'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Cargo
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: OP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cargo *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Operador de Produção"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descreva as principais responsabilidades do cargo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salário Base
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.salario_base}
                onChange={(e) => setFormData({ ...formData, salario_base: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Competências Técnicas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Competências Técnicas
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {competenciasTecnicasDisponiveis.map((competencia) => (
                  <label key={competencia} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.competencias_tecnicas.includes(competencia)}
                      onChange={() => toggleCompetencia(competencia, 'tecnicas')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{competencia}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Competências Comportamentais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Competências Comportamentais
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {competenciasComportamentaisDisponiveis.map((competencia) => (
                  <label key={competencia} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.competencias_comportamentais.includes(competencia)}
                      onChange={() => toggleCompetencia(competencia, 'comportamentais')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{competencia}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createCargo.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {createCargo.isPending ? 'Salvando...' : editingCargo ? 'Atualizar' : 'Cadastrar'} Cargo
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

      {/* Lista de cargos */}
      <div className="grid gap-4">
        {cargos.map((cargo) => (
          <AnimatedCard key={cargo.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{cargo.nome}</h3>
                    <span className="text-sm text-gray-500">({cargo.codigo})</span>
                  </div>
                  
                  {cargo.descricao && (
                    <p className="text-gray-600 mb-3">{cargo.descricao}</p>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {cargo.competencias_tecnicas.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Competências Técnicas:</h4>
                        <div className="flex flex-wrap gap-1">
                          {cargo.competencias_tecnicas.map((comp, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cargo.competencias_comportamentais.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Competências Comportamentais:</h4>
                        <div className="flex flex-wrap gap-1">
                          {cargo.competencias_comportamentais.map((comp, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {cargo.salario_base && (
                    <div className="mt-3 text-sm text-gray-600">
                      Salário Base: R$ {cargo.salario_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Editar cargo"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir cargo"
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