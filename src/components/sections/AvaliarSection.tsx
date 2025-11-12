import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MessageCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useColaboradores, useCreateAvaliacao } from '../../hooks/useSupabaseQuery'
import { AnimatedCard } from '../AnimatedCard'
import { LoadingSpinner } from '../LoadingSpinner'
import { PERGUNTAS_EXPERIENCIA } from '../../types'
import toast from 'react-hot-toast'

interface AvaliarSectionProps {
  supervisorId: string
  supervisorNome: string
  isRH?: boolean
}

export function AvaliarSection({ supervisorId, supervisorNome, isRH = false }: AvaliarSectionProps) {
  const [step, setStep] = useState(1)
  const [colaboradorId, setColaboradorId] = useState('')
  const [respostas, setRespostas] = useState<Record<string, number>>({})
  const [observacoes, setObservacoes] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // RH vê todos os colaboradores (supervisorId = undefined), supervisores veem apenas os seus
  const { data: colaboradores = [], isLoading: loadingColaboradores } = useColaboradores(isRH ? undefined : supervisorId)
  const createAvaliacao = useCreateAvaliacao()

  const selectedColaborador = colaboradores.find(c => c.id === colaboradorId)

  const handleSubmit = useCallback(async () => {
    const requiredFields = ['trabalho_equipe', 'comunicacao', 'responsabilidade', 'pontualidade', 'proatividade', 'qualidade_trabalho']
    const missingFields = requiredFields.filter(field => !respostas[field])

    if (missingFields.length > 0) {
      toast.error('Responda todas as perguntas antes de continuar')
      return
    }

    if (!colaboradorId) {
      toast.error('Selecione um colaborador')
      return
    }

    const avaliacaoData = {
      colaborador_id: colaboradorId,
      trabalho_equipe: respostas.trabalho_equipe,
      comunicacao: respostas.comunicacao,
      responsabilidade: respostas.responsabilidade,
      pontualidade: respostas.pontualidade,
      proatividade: respostas.proatividade,
      qualidade_trabalho: respostas.qualidade_trabalho,
      comentarios: observacoes || undefined
    }

    try {
      await createAvaliacao.mutateAsync({
        avaliacaoData,
        avaliadorId: supervisorId
      })
      setIsComplete(true)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }, [colaboradorId, respostas, observacoes, createAvaliacao, supervisorId])

  const resetForm = useCallback(() => {
    setIsComplete(false)
    setStep(1)
    setColaboradorId('')
    setRespostas({})
    setObservacoes('')
  }, [])

  if (loadingColaboradores) {
    return <LoadingSpinner size="lg" text="Carregando colaboradores..." />
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <AnimatedCard className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ✅ Avaliação Concluída!
            </h2>
            <p className="text-gray-600 mb-6">
              A avaliação de <strong>{selectedColaborador?.nome}</strong> foi processada com sucesso. 
              Os dados foram salvos no sistema.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetForm}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Nova Avaliação
            </button>
          </div>
        </AnimatedCard>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Avaliar Colaborador</h2>
        <p className="text-gray-600">Processo guiado de avaliação comportamental</p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Etapa {step} de 3 • Processo guiado pela Luiza</p>
        <div className="bg-white rounded-xl p-1">
          <div className="flex">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`flex-1 h-2 rounded-lg mx-1 ${
                  s <= step ? 'bg-green-600' : 'bg-gray-200'
                }`}
                initial={{ backgroundColor: '#e5e7eb' }}
                animate={{ 
                  backgroundColor: s <= step ? '#059669' : '#e5e7eb'
                }}
                transition={{ duration: 0.3, delay: s * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatedCard className="p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Seleção do colaborador */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Quem será avaliado hoje?
                </h3>
              </div>
              
              <div className="space-y-3 mb-8 max-h-64 overflow-y-auto">
                {colaboradores.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Você ainda não possui colaboradores cadastrados.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Cadastre colaboradores primeiro para poder avaliá-los.
                    </p>
                  </div>
                ) : (
                  colaboradores.map((colaborador) => (
                    <motion.button
                      key={colaborador.id}
                      onClick={() => setColaboradorId(colaborador.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                        colaboradorId === colaborador.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium text-gray-900">{colaborador.nome}</div>
                      <div className="text-sm text-gray-500">
                        {colaborador.cargo} • {colaborador.setor}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={!colaboradorId}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Perguntas da avaliação */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Avaliação de {selectedColaborador?.nome}
              </h3>
              <p className="text-gray-600 mb-8">
                Avalie cada aspecto de 1 a 10, onde 1 = Muito abaixo do esperado e 10 = Excelente desempenho
              </p>

              <div className="space-y-6 mb-8 max-h-96 overflow-y-auto">
                {PERGUNTAS_EXPERIENCIA.map((pergunta) => {
                  const fieldNameMap: Record<string, string> = {
                    'Trabalho em Equipe': 'trabalho_equipe',
                    'Comunicação': 'comunicacao',
                    'Responsabilidade': 'responsabilidade',
                    'Pontualidade': 'pontualidade',
                    'Proatividade': 'proatividade',
                    'Qualidade do Trabalho': 'qualidade_trabalho'
                  }
                  const fieldName = fieldNameMap[pergunta.categoria] || pergunta.categoria.toLowerCase().replace(/\s+/g, '_')

                  return (
                    <div key={pergunta.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800 mb-3">{pergunta.pergunta}</p>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nota) => (
                          <motion.button
                            key={nota}
                            onClick={() => setRespostas({ ...respostas, [fieldName]: nota })}
                            className={`w-10 h-10 rounded-full font-medium transition-colors ${
                              respostas[fieldName] === nota
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {nota}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={Object.keys(respostas).length < 6}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Comentários e finalização */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-6">
                <MessageCircle className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Quer adicionar um comentário?
                </h3>
              </div>

              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Comentários adicionais sobre o desempenho do colaborador..."
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-8"
              />

              <div className="bg-green-50 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-green-800 mb-3">Resumo da Avaliação</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Colaborador:</strong> {selectedColaborador?.nome}</div>
                  <div><strong>Perguntas respondidas:</strong> {Object.keys(respostas).length}</div>
                  <div><strong>Média geral:</strong> {
                    Object.keys(respostas).length > 0 
                      ? (Object.values(respostas).reduce((a, b) => a + b, 0) / Object.values(respostas).length).toFixed(1)
                      : '0.0'
                  }/10.0</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createAvaliacao.isPending}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {createAvaliacao.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Finalizar Avaliação'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedCard>
    </div>
  )
}