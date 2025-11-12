import { MovimentacaoRequisicaoPessoal } from '../types'

interface MovimentacaoRequisicaoPrintProps {
  data: MovimentacaoRequisicaoPessoal
}

export function MovimentacaoRequisicaoPrint({ data }: MovimentacaoRequisicaoPrintProps) {
  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '0,00'
    return value.toFixed(2).replace('.', ',')
  }

  return (
    <div className="print-container" style={{ display: 'none' }}>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body * {
            visibility: hidden;
          }

          .print-container,
          .print-container * {
            visibility: visible;
          }

          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            background: white;
            padding: 0;
            margin: 0;
          }
        }

        .print-document {
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          background: white;
          font-family: Arial, sans-serif;
          font-size: 9pt;
          color: #000;
          line-height: 1.2;
        }

        .print-header {
          display: grid;
          grid-template-columns: 80px 1fr 200px;
          border: 2px solid #000;
          margin-bottom: 2px;
        }

        .print-logo {
          background: #1a5f3f;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 2px solid #000;
        }

        .print-logo-text {
          color: white;
          font-size: 18pt;
          font-weight: bold;
          text-align: center;
        }

        .print-header-center {
          display: flex;
          flex-direction: column;
          border-right: 2px solid #000;
        }

        .print-header-item {
          padding: 4px 8px;
          text-align: center;
          border-bottom: 1px solid #000;
        }

        .print-header-item:last-child {
          border-bottom: none;
        }

        .print-header-right {
          display: flex;
          flex-direction: column;
        }

        .print-section-title {
          background: #4a7c59;
          color: white;
          padding: 4px 8px;
          font-weight: bold;
          text-align: center;
          border: 2px solid #000;
          border-top: none;
          margin-top: -2px;
        }

        .print-row {
          display: grid;
          border: 1px solid #000;
          border-top: none;
        }

        .print-cell {
          padding: 4px 8px;
          border-right: 1px solid #000;
        }

        .print-cell:last-child {
          border-right: none;
        }

        .print-label {
          font-weight: bold;
        }

        .print-checkbox {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 1px solid #000;
          margin: 0 4px;
          vertical-align: middle;
          position: relative;
        }

        .print-checkbox.checked::after {
          content: 'X';
          position: absolute;
          top: -3px;
          left: 2px;
          font-weight: bold;
        }

        .print-grid-2 {
          grid-template-columns: 1fr 1fr;
        }

        .print-grid-3 {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .print-grid-4 {
          grid-template-columns: 1fr 1fr 1fr 1fr;
        }

        .print-full-width {
          grid-column: 1 / -1;
        }

        .print-signature-section {
          margin-top: 8px;
        }

        .print-signature-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 4px;
        }

        .print-signature-box {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
          min-height: 40px;
        }
      `}</style>

      <div className="print-document">
        {/* Header */}
        <div className="print-header">
          <div className="print-logo">
            <div className="print-logo-text">IGARASHI</div>
          </div>
          <div className="print-header-center">
            <div className="print-header-item">Sistema de Gestão de Processo</div>
            <div className="print-header-item">Registro de Gestão</div>
            <div className="print-header-item" style={{ background: '#4a7c59', color: 'white', fontWeight: 'bold' }}>
              MOVIMENTAÇÃO / REQUISIÇÃO DE PESSOAL
            </div>
          </div>
          <div className="print-header-right">
            <div className="print-header-item">Código: GPFR-G&G-MP01-2025</div>
            <div className="print-header-item">Aprovação: 01/09/205</div>
            <div className="print-header-item">Nº de Páginas: 1 de 1</div>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="print-section-title" style={{ marginTop: '2px' }}>PREVISÃO DE FECHAMENTO:</div>

        <div className="print-row print-grid-2">
          <div className="print-cell">
            <span className="print-label">Requisitante:</span> {data.requisitante_nome}
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-label">Área:</span> {data.area_requisitante}
          </div>
        </div>

        <div className="print-row">
          <div className="print-cell">
            <span className="print-label">Data da Requisição:</span> {formatDate(data.data_requisicao)}
            {data.previsao_fechamento && (
              <span style={{ marginLeft: '20px' }}>
                <span className="print-label">Previsão de Fechamento:</span> {formatDate(data.previsao_fechamento)}
              </span>
            )}
          </div>
        </div>

        {/* Dados da Movimentação */}
        <div className="print-section-title">DADOS DA MOVIMENTAÇÃO / REQUISIÇÃO</div>

        <div className="print-row">
          <div className="print-cell print-full-width">
            <span className="print-label">UNIDADES:</span>
            {' '}CRISTALINA <span className="print-checkbox">{data.unidade === 'Cristalina' && 'X'}</span>
            {' '}CORRENTINA <span className="print-checkbox">{data.unidade === 'Correntina' && 'X'}</span>
            {' '}CORPORATIVO <span className="print-checkbox">{data.unidade === 'Corporativo' && 'X'}</span>
            {' '}IBICOARA <span className="print-checkbox">{data.unidade === 'Ibicoara' && 'X'}</span>
            {' '}PAPANDUVA <span className="print-checkbox">{data.unidade === 'Papanduva' && 'X'}</span>
            {' '}SÃO GABRIEL <span className="print-checkbox">{data.unidade === 'São Gabriel' && 'X'}</span>
            {' '}UBERLANDIA <span className="print-checkbox">{data.unidade === 'Uberlandia' && 'X'}</span>
          </div>
        </div>

        <div className="print-row print-grid-3">
          <div className="print-cell">
            <div className="print-label">Motivo da Movimentação Requisição:</div>
            <div><span className="print-checkbox">{data.motivo === 'Aumento de Quadro' && 'X'}</span> Aumento de Quadro</div>
            <div><span className="print-checkbox">{data.motivo === 'Promoção' && 'X'}</span> Promoção</div>
            <div><span className="print-checkbox">{data.motivo === 'Prestador de Serviço' && 'X'}</span> Prestador de serviço</div>
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <div style={{ height: '16px' }}>&nbsp;</div>
            <div><span className="print-checkbox">{data.motivo === 'Substituição' && 'X'}</span> Substituição</div>
            <div><span className="print-checkbox">{data.motivo === 'Demissão' && 'X'}</span> Demissão</div>
            <div><span className="print-checkbox">{data.motivo === 'Transferência - Unidade' && 'X'}</span> Transferência - Unidade</div>
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <div style={{ height: '16px' }}>&nbsp;</div>
            <div><span className="print-checkbox">{data.motivo === 'Transferência - Área' && 'X'}</span> Transferência - área</div>
            <div><span className="print-checkbox">{data.motivo === 'Estágio' && 'X'}</span> Estágio</div>
            <div><span className="print-checkbox">{data.motivo === 'Aprendiz' && 'X'}</span> Aprendiz</div>
          </div>
        </div>

        <div className="print-row print-grid-2">
          <div className="print-cell">
            <span className="print-label">Cargo:</span> {data.cargo}
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-label">Sexo:</span>
            <span className="print-checkbox">{data.sexo === 'Feminino' && 'X'}</span> F
            <span className="print-checkbox" style={{ marginLeft: '10px' }}>{data.sexo === 'Masculino' && 'X'}</span> M
          </div>
        </div>

        <div className="print-row print-grid-2">
          <div className="print-cell">
            <span className="print-label">Área/Setor:</span> {data.area_setor}
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-label">Centro de Custo:</span> {data.centro_custo}
          </div>
        </div>

        <div className="print-row print-grid-2">
          <div className="print-cell">
            <span className="print-label">Horário de Trabalho:</span> {data.horario_trabalho}
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-label">Candidato P.C.D.?</span>
            <span className="print-checkbox">{data.candidato_pcd && 'X'}</span> Sim
            <span className="print-checkbox" style={{ marginLeft: '10px' }}>{!data.candidato_pcd && 'X'}</span> Não
          </div>
        </div>

        <div className="print-row">
          <div className="print-cell">
            <span className="print-label">Nome do Colaborador:</span> {data.nome_colaborador}
          </div>
        </div>

        <div className="print-row">
          <div className="print-cell">
            <span className="print-label">EQUIPAMENTOS E ACESSOS:</span> {data.equipamentos_acessos}
          </div>
        </div>

        <div className="print-row">
          <div className="print-cell">
            <span className="print-label">Justificativa:</span> {data.justificativa}
          </div>
        </div>

        {/* Seção de Desligamento */}
        {data.motivo === 'Demissão' && (
          <>
            <div className="print-section-title">PARA CASOS DE DESLIGAMENTO</div>

            <div className="print-row">
              <div className="print-cell">
                <span className="print-label">Nome do Colaborador*:</span> {data.desligamento_nome_colaborador}
              </div>
            </div>

            <div className="print-row print-grid-3">
              <div className="print-cell">
                <span className="print-label">Tipo de Rescisão:</span>
                <div><span className="print-checkbox">{data.desligamento_tipo_rescisao === 'Iniciativa da Empresa' && 'X'}</span> Iniciativa da Empresa</div>
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span style={{ visibility: 'hidden' }}>.</span>
                <div><span className="print-checkbox">{data.desligamento_tipo_rescisao === 'Pedido de Demissão' && 'X'}</span> Pedido de Demissão</div>
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span style={{ visibility: 'hidden' }}>.</span>
                <div><span className="print-checkbox">{data.desligamento_tipo_rescisao === 'Término de Contrato' && 'X'}</span> Término de Contrato</div>
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">AVISO:</span>
                <span className="print-checkbox">{data.desligamento_aviso === 'Indenizado' && 'X'}</span> Indenizado
                <span className="print-checkbox">{data.desligamento_aviso === 'Trabalhado' && 'X'}</span> Trabalhado
                <span className="print-checkbox">{data.desligamento_aviso === 'Justa Causa' && 'X'}</span> Justa causa
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-checkbox">{data.desligamento_periodo_experiencia === '45 dias' && 'X'}</span> 45 dias
                <span className="print-checkbox">{data.desligamento_periodo_experiencia === '90 dias' && 'X'}</span> 90 dias
              </div>
            </div>

            <div className="print-row">
              <div className="print-cell">
                <span className="print-label">Poderá retornar para a empresa?</span>
                <span className="print-checkbox">{data.desligamento_recontratacao === 'Poderá retornar' && 'X'}</span> Poderá retornar
                <span className="print-checkbox">{data.desligamento_recontratacao === 'Não poderá retornar' && 'X'}</span> Não poderá retornar a empresa
              </div>
            </div>

            <div className="print-row">
              <div className="print-cell">
                <span className="print-label">Justificar:</span> {data.desligamento_justificativa}
              </div>
            </div>
          </>
        )}

        {/* Seção de Promoção */}
        {data.motivo === 'Promoção' && (
          <>
            <div className="print-section-title">PROMOÇÃO COM ALTERAÇÃO DE CARGO/SALÁRIO</div>

            <div className="print-row print-grid-2">
              <div className="print-cell" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                Situação Atual
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>
                Situação Proposta
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">Unidade:</span> {data.promocao_unidade_atual}
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-label">Unidade:</span> {data.promocao_unidade_proposta}
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">Setor:</span> {data.promocao_setor_atual}
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-label">Setor:</span> {data.promocao_setor_proposto}
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">Centro de Custo:</span> {data.promocao_centro_custo_atual}
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-label">Centro de Custo:</span> {data.promocao_centro_custo_proposto}
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">Cargo:</span> {data.promocao_cargo_atual}
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-label">Cargo:</span> {data.promocao_cargo_proposto}
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">Salário Base:</span> R$ {formatCurrency(data.promocao_salario_base_atual)}
                <span style={{ marginLeft: '20px' }}>
                  <span className="print-label">Gratificação:</span> R$ {formatCurrency(data.promocao_gratificacao_atual)}
                </span>
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-label">Salário Base:</span> R$ {formatCurrency(data.promocao_salario_base_proposto)}
                <span style={{ marginLeft: '20px' }}>
                  <span className="print-label">Gratificação:</span> R$ {formatCurrency(data.promocao_gratificacao_proposta)}
                </span>
              </div>
            </div>

            <div className="print-row print-grid-2">
              <div className="print-cell">
                <span className="print-label">Total mês Recebido:</span> R$ {formatCurrency(data.promocao_total_mes_atual)}
              </div>
              <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
                <span className="print-label">Reajuste de:</span> R$ {formatCurrency(data.promocao_reajuste_valor)}
                <span style={{ marginLeft: '10px' }}>{data.promocao_reajuste_percentual?.toFixed(2)}%</span>
              </div>
            </div>
          </>
        )}

        {/* Recursos Necessários */}
        <div className="print-section-title">RECURSOS NECESSÁRIOS</div>

        <div className="print-row print-grid-4">
          <div className="print-cell">
            <span className="print-checkbox">{data.recurso_mesa && 'X'}</span> Mesa
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-checkbox">{data.recurso_cadeira && 'X'}</span> Cadeira
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-checkbox">{data.recurso_apoio_pes && 'X'}</span> Apoio de Pé
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000' }}>
            <span className="print-checkbox">{data.recurso_epi_bota && 'X'}</span> EPI - Bota de Segurança
          </div>
        </div>

        {/* Aprovações */}
        <div className="print-section-title">APROVAÇÕES FUNÇÕES OPERACIONAIS - (Substituição/Desligamentos/Aumento de Quadro)</div>

        <div className="print-row print-grid-3">
          <div className="print-cell" style={{ textAlign: 'center', minHeight: '50px' }}>
            <div className="print-label">Coordenador de Área</div>
            <div style={{ marginTop: '30px' }}>___/___/___</div>
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000', textAlign: 'center' }}>
            <div className="print-label">Gerência da Unidade - Diretoria</div>
            <div style={{ marginTop: '30px' }}>___/___/___</div>
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000', textAlign: 'center' }}>
            <div className="print-label">PRESIDENCIA</div>
            <div style={{ marginTop: '30px' }}>___/___/___</div>
          </div>
        </div>

        <div className="print-section-title">APROVAÇÕES CARGOS DE LIDERANÇA</div>

        <div className="print-row print-grid-2">
          <div className="print-cell" style={{ textAlign: 'center', minHeight: '50px' }}>
            <div className="print-label">GERENCIA - DIRETORIA</div>
            <div style={{ marginTop: '30px' }}>___/___/___</div>
          </div>
          <div className="print-cell" style={{ borderLeft: '1px solid #000', textAlign: 'center' }}>
            <div className="print-label">PRESIDENCIA</div>
            <div style={{ marginTop: '30px' }}>___/___/___</div>
          </div>
        </div>

        {/* Informações Complementares */}
        <div className="print-section-title">INFORMAÇÕES COMPLEMENTARES (para preenchimento da área de Gente & Gestão)</div>

        <div className="print-row">
          <div className="print-cell" style={{ minHeight: '40px' }}>
            <span className="print-label">Informações em casos de desligamentos ou promoções:</span>
          </div>
        </div>

        <div className="print-row">
          <div className="print-cell" style={{ minHeight: '40px' }}>
            <span className="print-label">Parecer do RH quando Necessário:</span>
            {data.comentario_aprovacao && (
              <div style={{ marginTop: '4px' }}>{data.comentario_aprovacao}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
