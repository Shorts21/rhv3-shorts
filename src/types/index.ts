export interface User {
  id: string
  nome: string
  telefone: string
  perfil: 'rh' | 'supervisor' | 'colaborador' | 'bp_rh'
}

export type Unidade = 'Cristalina' | 'Correntina' | 'Corporativo' | 'Ibicoara' | 'Papanduva' | 'São Gabriel' | 'Uberlandia'

export interface Colaborador {
  id: string
  nome: string
  email?: string
  setor: string
  unidade?: Unidade
  data_admissao: string
  status: 'ativo' | 'experiencia' | 'desligado'
  gestor_id?: string
  gestor_nome?: string
  foto_url?: string
  created_at: string
  updated_at: string
}

export interface Avaliacao {
  id: string
  colaborador_id: string
  avaliador_id: string
  tipo_avaliacao: 'experiencia' | 'periodica' | 'desempenho'
  trabalho_equipe?: number
  comunicacao?: number
  responsabilidade?: number
  pontualidade?: number
  proatividade?: number
  qualidade_trabalho?: number
  media_geral?: number
  classificacao?: string
  comentarios?: string
  plano_acao?: string
  data_avaliacao: string
  created_at: string
  updated_at: string
  colaborador?: Colaborador
  avaliador?: Colaborador
}

export interface Feedback {
  id: string
  colaborador_id: string
  gestor_id: string
  pauta: string
  posicionamento_colaborador?: string
  observacoes?: string
  plano_acao?: string
  data_feedback: string
  created_at: string
  updated_at: string
  colaborador?: Colaborador
  gestor?: Colaborador
}

export interface MovimentacaoPessoal {
  id: string
  colaborador_id: string
  tipo_movimentacao: string
  cargo_anterior_id?: string
  cargo_novo_id?: string
  setor_anterior?: string
  setor_novo?: string
  data_movimentacao: string
  motivo?: string
  observacoes?: string
  created_at: string
  colaborador?: Colaborador
  requisitante?: string
  area_requisitante?: string
  data_requisicao?: string
  previsao_fechamento?: string
  unidade_origem?: Unidade
  unidade_destino?: Unidade
  sexo?: 'F' | 'M'
  area_setor?: string
  centro_custo?: string
  horario_trabalho?: string
  candidato_pcd?: boolean
  equipamentos_acessos?: string
  justificativa?: string
  tipo_rescisao?: 'Iniciativa da Empresa' | 'Pedido de Demissão' | 'Término de Contrato'
  aviso_tipo?: 'Indenizado' | 'Trabalhado' | 'Justa causa'
  aviso_prazo?: '45 dias' | '90 dias'
  pode_retornar?: boolean
  justificativa_desligamento?: string
  unidade_atual?: Unidade
  setor_atual?: string
  centro_custo_atual?: string
  cargo_atual?: string
  salario_base_atual?: number
  gratificacao_atual?: number
  total_mes_atual?: number
  unidade_proposta?: Unidade
  setor_proposto?: string
  centro_custo_proposto?: string
  cargo_proposto?: string
  salario_base_proposto?: number
  gratificacao_proposta?: number
  total_mes_proposto?: number
  reajuste?: number
  recursos_necessarios?: string[]
}

export interface Cargo {
  id: string
  codigo: string
  nome: string
  descricao?: string
  competencias_tecnicas: string[]
  competencias_comportamentais: string[]
  salario_base?: number
  created_at: string
  updated_at: string
}

export interface AudioDevolutiva {
  id: string
  colaborador_id: string
  tipo_avaliacao: 'experiencia' | 'periodica' | 'desempenho'
  referencia_id: string
  texto_devolutiva: string
  audio_url?: string
  elevenlabs_request_id?: string
  status: string
  created_at: string
  updated_at: string
}

export interface DashboardMetrics {
  total_colaboradores: number
  colaboradores_experiencia: number
  media_geral_mes: number
  taxa_retencao_12m: number
  acima_expectativa: number
  dentro_expectativa: number
  abaixo_expectativa: number
  avaliacoes_experiencia?: number
  avaliacoes_desempenho?: number
  requisicoes_pendentes?: number
}

// Formulários
export interface ColaboradorForm {
  nome: string
  email?: string
  setor: string
  unidade?: string
  data_admissao: string
  status: 'ativo' | 'experiencia' | 'desligado'
}

export interface AvaliacaoForm {
  colaborador_id: string
  trabalho_equipe: number
  comunicacao: number
  responsabilidade: number
  pontualidade: number
  proatividade: number
  qualidade_trabalho: number
  comentarios?: string
  plano_acao?: string
}

export interface FeedbackForm {
  colaborador_id: string
  pauta: string
  posicionamento_colaborador?: string
  observacoes?: string
  plano_acao?: string
}

// Perguntas de Avaliação
export interface PerguntaAvaliacao {
  id: number
  categoria: string
  pergunta: string
  tipo: 'desempenho' | 'experiencia'
}

// Perguntas de Experiência (6 perguntas principais)
export const PERGUNTAS_EXPERIENCIA: PerguntaAvaliacao[] = [
  { id: 1, categoria: 'Trabalho em Equipe', pergunta: 'Como avalia o trabalho em equipe do colaborador?', tipo: 'experiencia' },
  { id: 2, categoria: 'Comunicação', pergunta: 'Como avalia a comunicação do colaborador?', tipo: 'experiencia' },
  { id: 3, categoria: 'Responsabilidade', pergunta: 'Como avalia a responsabilidade do colaborador?', tipo: 'experiencia' },
  { id: 4, categoria: 'Pontualidade', pergunta: 'Como avalia a pontualidade do colaborador?', tipo: 'experiencia' },
  { id: 5, categoria: 'Proatividade', pergunta: 'Como avalia a proatividade do colaborador?', tipo: 'experiencia' },
  { id: 6, categoria: 'Qualidade do Trabalho', pergunta: 'Como avalia a qualidade do trabalho do colaborador?', tipo: 'experiencia' }
]

// Perguntas de Desempenho (mesmas 6 perguntas)
export const PERGUNTAS_DESEMPENHO: PerguntaAvaliacao[] = PERGUNTAS_EXPERIENCIA.map(p => ({ ...p, tipo: 'desempenho' as const }))

export interface AvaliacaoDesempenhoFeedback {
  id: string
  colaborador_id: string
  avaliador_id: string
  trimestre: 1 | 2 | 3 | 4
  cargo_atual?: string
  email?: string
  data_avaliacao: string
  observacoes?: string
  produtividade_1a?: number
  produtividade_1b?: number
  produtividade_1c?: number
  produtividade_1d?: number
  produtividade_1e?: number
  conhecimento_2a?: number
  conhecimento_2b?: number
  conhecimento_2c?: number
  trabalho_equipe_3a?: number
  trabalho_equipe_3b?: number
  trabalho_equipe_3c?: number
  trabalho_equipe_3d?: number
  trabalho_equipe_3e?: number
  comprometimento_4a?: number
  comprometimento_4b?: number
  comprometimento_4c?: number
  cumprimento_normas_5a?: number
  cumprimento_normas_5b?: number
  cumprimento_normas_5c?: number
  cumprimento_normas_5d?: number
  total_pontos?: number
  percentual_idi?: number
  concordancia_colaborador?: boolean
  assinatura_lider?: string
  assinatura_colaborador?: string
  data_assinatura_lider?: string
  data_assinatura_colaborador?: string
  created_at: string
  updated_at: string
  colaborador?: Colaborador
}

export interface QuestaoFeedback {
  id: string
  fator: number
  letra: string
  texto: string
}

export const QUESTOES_FEEDBACK: QuestaoFeedback[] = [
  { id: '1a', fator: 1, letra: 'a', texto: 'Executa as suas atividades de acordo com os padrões de qualidade exigidos pela Igarashi?' },
  { id: '1b', fator: 1, letra: 'b', texto: 'Realiza suas atividades dentro dos prazos solicitados pela liderança?' },
  { id: '1c', fator: 1, letra: 'c', texto: 'Realiza volume de trabalho condizente com a demanda, considerando os recursos disponibilizados?' },
  { id: '1d', fator: 1, letra: 'd', texto: 'Realiza efetivamente as atribuições do cargo que ocupa na Igarashi?' },
  { id: '1e', fator: 1, letra: 'e', texto: 'Utiliza com consciência os materiais e equipamentos da Igarashi?' },
  { id: '2a', fator: 2, letra: 'a', texto: 'Diante das atividades do dia dá prioridade as mais importantes?' },
  { id: '2b', fator: 2, letra: 'b', texto: 'Executa regularmente seu trabalho, sem necessidade de orientação?' },
  { id: '2c', fator: 2, letra: 'c', texto: 'Busca atualizar-se e compreender tudo que diz respeito ao trabalho da Igarashi?' },
  { id: '3a', fator: 3, letra: 'a', texto: 'Tem um bom relacionamento com seus pares?' },
  { id: '3b', fator: 3, letra: 'b', texto: 'Mostra-se colaborativo com seus pares, ajudando o grupo sempre que possível?' },
  { id: '3c', fator: 3, letra: 'c', texto: 'Estimula e reforça ações que favoreçam a união do grupo inibindo aquelas que prejudiquem a coletividade?' },
  { id: '3d', fator: 3, letra: 'd', texto: 'É aberto (a) ao debate, respeitando a opinião dos outros e revendo sua opinião, sempre que necessário?' },
  { id: '3e', fator: 3, letra: 'e', texto: 'É visto como alguém que traz boas contribuições ao grupo, sendo agregador?' },
  { id: '4a', fator: 4, letra: 'a', texto: 'Reconhece o seu papel para o cumprimento da missão da Igarashi?' },
  { id: '4b', fator: 4, letra: 'b', texto: 'Apresenta disponibilidade mesmo fora das suas atribuições com intuito de ajudar, fortalecer e agregar?' },
  { id: '4c', fator: 4, letra: 'c', texto: 'Demonstra persistência diante de dificuldades inerentes aos processos de trabalho?' },
  { id: '5a', fator: 5, letra: 'a', texto: 'Conhece e cumpre as normas e regras da Igarashi?' },
  { id: '5b', fator: 5, letra: 'b', texto: 'Trata com profissionalismo as pessoas no ambiente de trabalho?' },
  { id: '5c', fator: 5, letra: 'c', texto: 'Encaminha corretamente os assuntos que fogem do seu poder de decisão?' },
  { id: '5d', fator: 5, letra: 'd', texto: 'Mantém a apresentação pessoal de acordo com os padrões estabelecidos pela Igarashi?' }
]

export const FATORES_COMPETENCIA = [
  {
    numero: 1,
    titulo: 'Produtividade',
    descricao: 'É a capacidade de atender às demandas do setor agrícola com qualidade e em quantidade apropriada, considerando-se os fatores tempo, uso eficiente de recursos naturais, materiais e financeiros, além de planejamento e organização das atividades rurais.'
  },
  {
    numero: 2,
    titulo: 'Conhecimento e Habilidades Técnicas',
    descricao: 'Conhecimento, aprofundamento, atualização, senso crítico e proposição de mudanças dos métodos, técnicas e processos inerentes ao seu trabalho.'
  },
  {
    numero: 3,
    titulo: 'Trabalho em equipe',
    descricao: 'Capacidade de trabalhar levando-se em conta a preservação dos relacionamentos, a colaboração com seus pares, a disseminação do senso de coletividade, a abertura aos debates e a capacidade de agregação.'
  },
  {
    numero: 4,
    titulo: 'Comprometimento com o trabalho',
    descricao: 'Envolvimento com as atividades pelas quais é responsável no sentido de facilitar e contribuir efetivamente para a resolução de problemas e para o alcance das metas institucionais.'
  },
  {
    numero: 5,
    titulo: 'Cumprimento das normas de procedimento e de conduta',
    descricao: 'Capacidade para observar e cumprir normas e regulamentos, bem como de manter um padrão de comportamento adequado às práticas da empresa.'
  }
]

export interface AvaliacaoExperiencia {
  id: string
  colaborador_id: string
  avaliador_id: string
  matricula?: string
  area_setor?: string
  data_admissao?: string
  periodo_avaliacao: '45 dias' | '90 dias'
  data_avaliacao: string
  adaptacao_q1?: number
  adaptacao_q2?: number
  adaptacao_q3?: number
  conhecimento_q4?: number
  conhecimento_q5?: number
  conhecimento_q6?: number
  conhecimento_q7?: number
  conhecimento_q8?: number
  conhecimento_q9?: number
  conhecimento_q10?: number
  iniciativa_q11?: number
  iniciativa_q12?: number
  iniciativa_q13?: number
  disciplina_q14?: number
  disciplina_q15?: number
  disciplina_q16?: number
  disciplina_q17?: number
  assiduidade_q18?: number
  assiduidade_q19?: number
  assiduidade_q20?: number
  desenvolvimento_q21?: number
  desenvolvimento_q22?: number
  desenvolvimento_q23?: number
  desenvolvimento_q24?: number
  nota_final?: number
  comentarios_colaborador?: string
  comentarios_superior?: string
  observacoes_gerais?: string
  resultado?: 'Permanece na empresa' | 'Desligado durante o período de experiência'
  created_at: string
  updated_at: string
  colaborador?: Colaborador
}

export interface CompetenciaExperiencia {
  numero: number
  titulo: string
  questoes: QuestaoExperiencia[]
}

export interface QuestaoExperiencia {
  id: string
  numero: number
  texto: string
}

export interface MovimentacaoRequisicaoPessoal {
  id: string
  requisitante_id: string
  requisitante_nome?: string
  area_requisitante?: string
  data_requisicao: string
  previsao_fechamento?: string
  unidade?: Unidade
  motivo?: MotivoMovimentacao
  cargo?: string
  sexo?: 'Feminino' | 'Masculino'
  area_setor?: string
  centro_custo?: string
  horario_trabalho?: string
  candidato_pcd?: boolean
  nome_colaborador?: string
  equipamentos_acessos?: string
  justificativa?: string
  desligamento_nome_colaborador?: string
  desligamento_tipo_rescisao?: 'Iniciativa da Empresa' | 'Pedido de Demissão' | 'Término de Contrato'
  desligamento_aviso?: 'Indenizado' | 'Trabalhado' | 'Justa Causa'
  desligamento_periodo_experiencia?: '45 dias' | '90 dias'
  desligamento_recontratacao?: 'Poderá retornar' | 'Não poderá retornar'
  desligamento_justificativa?: string
  promocao_unidade_atual?: string
  promocao_unidade_proposta?: string
  promocao_setor_atual?: string
  promocao_setor_proposto?: string
  promocao_centro_custo_atual?: string
  promocao_centro_custo_proposto?: string
  promocao_cargo_atual?: string
  promocao_cargo_proposto?: string
  promocao_salario_base_atual?: number
  promocao_salario_base_proposto?: number
  promocao_gratificacao_atual?: number
  promocao_gratificacao_proposta?: number
  promocao_total_mes_atual?: number
  promocao_total_mes_proposto?: number
  promocao_reajuste_valor?: number
  promocao_reajuste_percentual?: number
  recurso_mesa?: boolean
  recurso_cadeira?: boolean
  recurso_apoio_pes?: boolean
  recurso_epi_bota?: boolean
  status: 'pendente' | 'aprovada' | 'rejeitada'
  created_at: string
  updated_at: string
}

export type MotivoMovimentacao =
  | 'Aumento de Quadro'
  | 'Substituição'
  | 'Transferência - Área'
  | 'Promoção'
  | 'Demissão'
  | 'Estágio'
  | 'Prestador de Serviço'
  | 'Transferência - Unidade'
  | 'Aprendiz'

export const MOTIVOS_MOVIMENTACAO: MotivoMovimentacao[] = [
  'Aumento de Quadro',
  'Substituição',
  'Transferência - Área',
  'Promoção',
  'Demissão',
  'Estágio',
  'Prestador de Serviço',
  'Transferência - Unidade',
  'Aprendiz'
]

export const UNIDADES: Unidade[] = [
  'Cristalina',
  'Correntina',
  'Corporativo',
  'Ibicoara',
  'Papanduva',
  'São Gabriel',
  'Uberlandia'
]

export const COMPETENCIAS_EXPERIENCIA: CompetenciaExperiencia[] = [
  {
    numero: 1,
    titulo: 'Adaptação / Sociabilidade e Trabalho em Equipe',
    questoes: [
      { id: 'adaptacao_q1', numero: 1, texto: 'Demonstra facilidade para interagir com os colegas.' },
      { id: 'adaptacao_q2', numero: 2, texto: 'Adapta-se facilmente ao ambiente de trabalho.' },
      { id: 'adaptacao_q3', numero: 3, texto: 'Coopera com os colegas nas atividades.' }
    ]
  },
  {
    numero: 2,
    titulo: 'Conhecimento Técnico e Cumprimento das Tarefas',
    questoes: [
      { id: 'conhecimento_q4', numero: 4, texto: 'Aplica conhecimentos práticos de experiências anteriores.' },
      { id: 'conhecimento_q5', numero: 5, texto: 'Busca atualização por meio de cursos, palestras, leitura ou pesquisa.' },
      { id: 'conhecimento_q6', numero: 6, texto: 'Executa as atividades conforme solicitado.' },
      { id: 'conhecimento_q7', numero: 7, texto: 'Atende prontamente às solicitações que lhe são feitas.' },
      { id: 'conhecimento_q8', numero: 8, texto: 'Cumpre prazos no desempenho das tarefas.' },
      { id: 'conhecimento_q9', numero: 9, texto: 'Mantém a qualidade do trabalho mesmo sob pressão.' },
      { id: 'conhecimento_q10', numero: 10, texto: 'Demonstra segurança e responsabilidade nas entregas.' }
    ]
  },
  {
    numero: 3,
    titulo: 'Iniciativa e Criatividade',
    questoes: [
      { id: 'iniciativa_q11', numero: 11, texto: 'Propõe ideias e alternativas para solucionar problemas.' },
      { id: 'iniciativa_q12', numero: 12, texto: 'Demonstra interesse em aprender continuamente.' },
      { id: 'iniciativa_q13', numero: 13, texto: 'Mostra iniciativa para realizar tarefas sem necessidade de solicitação.' }
    ]
  },
  {
    numero: 4,
    titulo: 'Disciplina e Responsabilidade',
    questoes: [
      { id: 'disciplina_q14', numero: 14, texto: 'Respeita normas e regulamentos internos.' },
      { id: 'disciplina_q15', numero: 15, texto: 'Mantém ética e sigilo em assuntos do setor.' },
      { id: 'disciplina_q16', numero: 16, texto: 'Zela pelos equipamentos e bens da organização.' },
      { id: 'disciplina_q17', numero: 17, texto: 'Participa de eventos e ações voltadas à segurança e melhoria no trabalho.' }
    ]
  },
  {
    numero: 5,
    titulo: 'Assiduidade e Apresentação Pessoal',
    questoes: [
      { id: 'assiduidade_q18', numero: 18, texto: 'É pontual e raramente falta ao trabalho.' },
      { id: 'assiduidade_q19', numero: 19, texto: 'Mantém boa higiene e apresenta-se adequadamente.' },
      { id: 'assiduidade_q20', numero: 20, texto: 'Demonstra comprometimento com horários de entrada e saída.' }
    ]
  },
  {
    numero: 6,
    titulo: 'Desenvolvimento Pessoal',
    questoes: [
      { id: 'desenvolvimento_q21', numero: 21, texto: 'Mantém autocontrole diante de situações-problema.' },
      { id: 'desenvolvimento_q22', numero: 22, texto: 'Compromete-se com o alcance das metas propostas.' },
      { id: 'desenvolvimento_q23', numero: 23, texto: 'Atua de forma proativa, planejada e organizada, contribuindo para melhorias.' },
      { id: 'desenvolvimento_q24', numero: 24, texto: 'Demonstra persistência e determinação na execução das tarefas.' }
    ]
  }
]

export interface AvaliacaoDesempenhoSupervisor {
  id: string
  colaborador_id: string
  supervisor_id: string
  periodo_avaliacao: string
  data_avaliacao: string
  assiduidade_faltas: number
  assiduidade_atestados: number
  assiduidade_obs?: string
  disciplina_advertencias: number
  disciplina_comportamento: number
  disciplina_obs?: string
  produtividade_qualidade: number
  produtividade_quantidade: number
  produtividade_prazos: number
  produtividade_obs?: string
  relacionamento_equipe: number
  relacionamento_clientes: number
  relacionamento_obs?: string
  postura_apresentacao: number
  postura_comunicacao: number
  postura_obs?: string
  engajamento_iniciativa: number
  engajamento_comprometimento: number
  engajamento_obs?: string
  total_pontos: number
  percentual_final: number
  classificacao: string
  nome_supervisor?: string
  nome_bp_rh?: string
  nome_colaborador_avaliado?: string
  confirmacao_supervisor: boolean
  confirmacao_bp_rh: boolean
  confirmacao_colaborador: boolean
  data_confirmacao_supervisor?: string
  data_confirmacao_bp_rh?: string
  data_confirmacao_colaborador?: string
  created_at: string
  updated_at: string
  colaborador?: Colaborador
  supervisor?: Colaborador
}

export interface AvaliacaoDesempenhoSupervisorForm {
  colaborador_id: string
  unidade: string
  periodo_avaliacao: string
  assiduidade_faltas_injustificadas: number
  assiduidade_atestados_medicos: number
  assiduidade_obs?: string
  disciplina_advertencias_pontos: number
  disciplina_suspensoes: number
  disciplina_obs?: string
  saude_restricoes_sesmt: number
  saude_obs?: string
  resultados_desempenho_tecnico: number
  resultados_obs?: string
  desenvolvimento_treinamentos: number
  desenvolvimento_obs?: string
}

export const CRITERIOS_AVALIACAO_SUPERVISOR = [
  {
    categoria: '1. Assiduidade',
    pontos_max: 25,
    itens: [
      {
        campo: 'assiduidade_faltas_injustificadas',
        label: 'Faltas injustificadas',
        pontos_max: 20,
        descricao: '0 faltas = 20 pts | Cada falta injustificada reduz 3 pts'
      },
      {
        campo: 'assiduidade_atestados_medicos',
        label: 'Atestados médicos',
        pontos_max: 5,
        descricao: 'Até 1 atestado = 5 pts | Acima disso reduz 2 pts por atestado adicional'
      }
    ]
  },
  {
    categoria: '2. Disciplina',
    pontos_max: 25,
    itens: [
      {
        campo: 'disciplina_advertencias_pontos',
        label: 'Advertências',
        pontos_max: 15,
        descricao: 'Sem advertência = 15 pts | Cada advertência reduz 5 pts'
      },
      {
        campo: 'disciplina_suspensoes',
        label: 'Suspensões',
        pontos_max: 10,
        descricao: 'Sem suspensão = 10 pts | Cada suspensão reduz 10 pts'
      }
    ]
  },
  {
    categoria: '3. Saúde e Segurança',
    pontos_max: 10,
    itens: [
      {
        campo: 'saude_restricoes_sesmt',
        label: 'Restrições SESMT',
        pontos_max: 10,
        descricao: 'Sem restrição = 10 pts | Com restrição = 5 pts (se não comprometer função)'
      }
    ]
  },
  {
    categoria: '4. Resultados na Área',
    pontos_max: 25,
    itens: [
      {
        campo: 'resultados_desempenho_tecnico',
        label: 'Desempenho técnico',
        pontos_max: 25,
        descricao: 'Avaliação do RH com base em metas, produtividade e relatórios'
      }
    ]
  },
  {
    categoria: '5. Desenvolvimento',
    pontos_max: 15,
    itens: [
      {
        campo: 'desenvolvimento_treinamentos',
        label: 'Participação em treinamentos',
        pontos_max: 15,
        descricao: 'Participou de todos = 15 pts | Cada ausência sem justificativa reduz 5 pts'
      }
    ]
  }
]

export function calcularClassificacaoSupervisor(percentual: number): string {
  if (percentual >= 90) return 'Excelente'
  if (percentual >= 80) return 'Muito Bom'
  if (percentual >= 70) return 'Satisfatório'
  if (percentual >= 60) return 'Regular'
  return 'Insatisfatório'
}