import { MovimentacaoRequisicaoPessoal } from '../types'

interface PrintRequisicaoA4Props {
  data: MovimentacaoRequisicaoPessoal
}

export function PrintRequisicaoA4({ data }: PrintRequisicaoA4Props) {
  const formatDate = (date: string | undefined) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '0,00'
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          #print-requisicao-container,
          #print-requisicao-container * {
            visibility: visible;
          }

          #print-requisicao-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            background: white;
            z-index: 99999;
          }

          /* CRÍTICO: Remover cabeçalhos e rodapés do navegador */
          @page {
            margin: 0mm;
          }
        }

        #print-requisicao-container {
          display: none;
          width: 210mm;
          min-height: 297mm;
          padding: 10mm;
          background: white;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9pt;
          color: #000;
          line-height: 1.1;
          box-sizing: border-box;
        }

        @media print {
          #print-requisicao-container {
            display: block !important;
            padding: 10mm;
          }
        }

        .pr-header {
          display: grid;
          grid-template-columns: 55mm 1fr 48mm;
          border: 2px solid #000;
          margin-bottom: 0;
        }

        .pr-logo-box {
          background: #1a5f3f;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 2px solid #000;
        }

        .pr-logo {
          max-width: 100%;
          max-height: 45px;
          object-fit: contain;
        }

        .pr-header-center {
          display: flex;
          flex-direction: column;
          border-right: 2px solid #000;
        }

        .pr-header-item {
          padding: 2px 6px;
          text-align: center;
          border-bottom: 1px solid #000;
          font-size: 8.5pt;
        }

        .pr-header-item:last-child {
          border-bottom: none;
          background: #4a7c59;
          color: white;
          font-weight: bold;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pr-header-right {
          display: flex;
          flex-direction: column;
        }

        .pr-header-right .pr-header-item {
          font-size: 7.5pt;
        }

        .pr-section-title {
          background: #4a7c59;
          color: white;
          padding: 3px 6px;
          font-weight: bold;
          text-align: center;
          border: 2px solid #000;
          border-top: none;
          margin: 0;
          font-size: 8.5pt;
        }

        .pr-row {
          display: flex;
          border: 1px solid #000;
          border-top: none;
          min-height: 18px;
        }

        .pr-cell {
          padding: 2px 5px;
          border-right: 1px solid #000;
          flex: 1;
          font-size: 7.5pt;
        }

        .pr-cell:last-child {
          border-right: none;
        }

        .pr-label {
          font-weight: bold;
        }

        .pr-checkbox {
          display: inline-block;
          width: 9px;
          height: 9px;
          border: 1px solid #000;
          margin: 0 2px;
          vertical-align: middle;
          position: relative;
        }

        .pr-checkbox.checked::after {
          content: 'X';
          position: absolute;
          top: -3px;
          left: 1px;
          font-weight: bold;
          font-size: 9pt;
        }

        .pr-motivos-container {
          border: 1px solid #000;
          border-top: none;
        }

        .pr-motivos-title {
          padding: 2px 5px;
          border-bottom: 1px solid #000;
          font-size: 7.5pt;
          font-weight: bold;
        }

        .pr-motivos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .pr-motivo-cell {
          padding: 2px 5px;
          border-right: 1px solid #000;
          border-bottom: 1px solid #000;
          font-size: 7.5pt;
        }

        .pr-motivo-cell:nth-child(3n) {
          border-right: none;
        }

        .pr-motivo-cell:nth-last-child(-n+3) {
          border-bottom: none;
        }

        .pr-promocao {
          border: 1px solid #000;
          border-top: none;
        }

        .pr-promocao-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #000;
        }

        .pr-promocao-header-cell {
          padding: 3px 6px;
          text-align: center;
          font-weight: bold;
          border-right: 1px solid #000;
          font-size: 8pt;
        }

        .pr-promocao-header-cell:last-child {
          border-right: none;
        }

        .pr-promocao-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #000;
        }

        .pr-promocao-row:last-child {
          border-bottom: none;
        }

        .pr-promocao-cell {
          padding: 2px 5px;
          border-right: 1px solid #000;
          font-size: 7.5pt;
        }

        .pr-promocao-cell:last-child {
          border-right: none;
        }

        .pr-recursos {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid #000;
          border-top: none;
        }

        .pr-recursos-item {
          padding: 2px 5px;
          border-right: 1px solid #000;
          font-size: 7.5pt;
        }

        .pr-recursos-item:last-child {
          border-right: none;
        }

        .pr-aprovacoes {
          display: grid;
          border: 1px solid #000;
          border-top: none;
          min-height: 45px;
        }

        .pr-aprovacoes-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .pr-aprovacoes-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .pr-aprovacao-cell {
          padding: 6px 5px;
          border-right: 1px solid #000;
          text-align: center;
          font-size: 7.5pt;
        }

        .pr-aprovacao-cell:last-child {
          border-right: none;
        }

        .pr-aprovacao-title {
          font-weight: bold;
          margin-bottom: 18px;
        }

        .pr-info-comp {
          border: 1px solid #000;
          border-top: none;
          padding: 5px;
          min-height: 28px;
          font-size: 7.5pt;
        }
      `}</style>

      <div id="print-requisicao-container">
        {/* Cabeçalho */}
        <div className="pr-header">
          <div className="pr-logo-box">
            <img
              src="/Black and White Modern Personal Brand Logo.png"
              alt="IGARASHI"
              className="pr-logo"
            />
          </div>
          <div className="pr-header-center">
            <div className="pr-header-item">Sistema de Gestão de Processo</div>
            <div className="pr-header-item">Registro de Gestão</div>
            <div className="pr-header-item">MOVIMENTAÇÃO / REQUISIÇÃO DE PESSOAL</div>
          </div>
          <div className="pr-header-right">
            <div className="pr-header-item">Código: GPFR-G&G-MP01-2025</div>
            <div className="pr-header-item">Aprovação: 01/09/205</div>
            <div className="pr-header-item">Nº de Páginas: 1 de 1</div>
          </div>
        </div>

        {/* Previsão de Fechamento */}
        <div className="pr-section-title">PREVISÃO DE FECHAMENTO:</div>

        <div className="pr-row">
          <div className="pr-cell" style={{ flex: 2 }}>
            <span className="pr-label">Requisitante:</span> {data.requisitante_nome}
          </div>
        </div>

        <div className="pr-row">
          <div className="pr-cell">
            <span className="pr-label">Área:</span> {data.area_requisitante}
          </div>
          <div className="pr-cell">
            <span className="pr-label">Data da Requisição:</span> {formatDate(data.data_requisicao)}
          </div>
        </div>

        {/* Dados da Movimentação */}
        <div className="pr-section-title">
          DADOS DA MOVIMENTAÇÃO / Contratação - aumento de quadro e demais movimentações
        </div>

        <div className="pr-row">
          <div className="pr-cell" style={{ width: '100%' }}>
            <span className="pr-label">UNIDADES:</span>
            {' '}CRISTALINA <span className={`pr-checkbox ${data.unidade === 'Cristalina' ? 'checked' : ''}`}></span>
            {' '}CORRENTINA <span className={`pr-checkbox ${data.unidade === 'Correntina' ? 'checked' : ''}`}></span>
            {' '}CORPORATIVO <span className={`pr-checkbox ${data.unidade === 'Corporativo' ? 'checked' : ''}`}></span>
            {' '}IBICOARA <span className={`pr-checkbox ${data.unidade === 'Ibicoara' ? 'checked' : ''}`}></span>
            {' '}PAPANDUVA <span className={`pr-checkbox ${data.unidade === 'Papanduva' ? 'checked' : ''}`}></span>
            {' '}SÃO GABRIEL <span className={`pr-checkbox ${data.unidade === 'São Gabriel' ? 'checked' : ''}`}></span>
            {' '}UBERLANDIA <span className={`pr-checkbox ${data.unidade === 'Uberlandia' ? 'checked' : ''}`}></span>
          </div>
        </div>

        {/* Motivos */}
        <div className="pr-motivos-container">
          <div className="pr-motivos-title">Motivo da Movimentação Requisição:</div>
          <div className="pr-motivos-grid">
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Aumento de Quadro' ? 'checked' : ''}`}></span> Aumento de Quadro
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Substituição' ? 'checked' : ''}`}></span> Substituição
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Transferência - área' ? 'checked' : ''}`}></span> Transferência - área
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Promoção' ? 'checked' : ''}`}></span> Promoção
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Demissão' ? 'checked' : ''}`}></span> Demissão
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Estágio' ? 'checked' : ''}`}></span> Estágio
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Prestador de serviço' ? 'checked' : ''}`}></span> Prestador de serviço
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Transferência - Unidade' ? 'checked' : ''}`}></span> Transferência - Unidade
            </div>
            <div className="pr-motivo-cell">
              <span className={`pr-checkbox ${data.motivo === 'Aprendiz' ? 'checked' : ''}`}></span> Aprendiz
            </div>
          </div>
        </div>

        {/* Cargo e Sexo */}
        <div className="pr-row">
          <div className="pr-cell" style={{ flex: 3 }}>
            <span className="pr-label">Cargo:</span> {data.cargo}
          </div>
          <div className="pr-cell" style={{ flex: 1 }}>
            <span className="pr-label">Sexo:</span>
            <span className={`pr-checkbox ${data.sexo === 'Feminino' ? 'checked' : ''}`}></span> F
            <span className={`pr-checkbox ${data.sexo === 'Masculino' ? 'checked' : ''}`}></span> M
          </div>
        </div>

        {/* Área/Setor, Centro de Custo e Data admissão */}
        <div className="pr-row">
          <div className="pr-cell">
            <span className="pr-label">Área/Setor:</span> {data.area_setor}
          </div>
          <div className="pr-cell">
            <span className="pr-label">Centro de Custo:</span> {data.centro_custo}
          </div>
          <div className="pr-cell">
            <span className="pr-label">Data admissão:</span>
          </div>
        </div>

        {/* Horário e PCD */}
        <div className="pr-row">
          <div className="pr-cell">
            <span className="pr-label">Horário de Trabalho:</span> {data.horario_trabalho}
          </div>
          <div className="pr-cell">
            <span className="pr-label">Candidato P.C.D.?</span>
            <span className={`pr-checkbox ${data.candidato_pcd ? 'checked' : ''}`}></span> Sim
            <span className={`pr-checkbox ${!data.candidato_pcd ? 'checked' : ''}`}></span> Não
          </div>
        </div>

        {/* Nome do Colaborador e Salário */}
        <div className="pr-row">
          <div className="pr-cell" style={{ flex: 3 }}>
            <span className="pr-label">Nome do Colaborador:</span> {data.nome_colaborador}
          </div>
          <div className="pr-cell" style={{ flex: 1 }}>
            <span className="pr-label">Salário:</span> R$
          </div>
        </div>

        {/* Gratificação */}
        <div className="pr-row">
          <div className="pr-cell">
            <span className="pr-label">Gratificação / Ajuda de custo</span> R$
          </div>
        </div>

        {/* Equipamentos e Acessos */}
        <div className="pr-row">
          <div className="pr-cell">
            <span className="pr-label">EQUIPAMENTOS E ACESSOS:</span> Descrever equipamentos (Carro - Celular - Notbook), Senhas de acesso, local de trabalho, e-mail, algo mais especifico:
            <div>{data.equipamentos_acessos}</div>
          </div>
        </div>

        {/* Justificativa */}
        <div className="pr-row">
          <div className="pr-cell">
            <span className="pr-label">Justificativa:</span>
            <div>{data.justificativa}</div>
          </div>
        </div>

        {/* Seção de Desligamento */}
        {data.motivo === 'Demissão' && (
          <>
            <div className="pr-section-title">PARA CASOS DE DESLIGAMENTO</div>

            <div className="pr-row">
              <div className="pr-cell">
                <span className="pr-label">Nome do Colaborador*:</span> {data.desligamento_nome_colaborador}
              </div>
            </div>

            <div className="pr-row">
              <div className="pr-cell">
                <span className="pr-label">Tipo de Rescisão:</span>
                <span className={`pr-checkbox ${data.desligamento_tipo_rescisao === 'Iniciativa da Empresa' ? 'checked' : ''}`}></span> Iniciativa da Empresa
                <span className={`pr-checkbox ${data.desligamento_tipo_rescisao === 'Pedido de Demissão' ? 'checked' : ''}`}></span> Pedido de Demissão
                <span className={`pr-checkbox ${data.desligamento_tipo_rescisao === 'Término de Contrato' ? 'checked' : ''}`}></span> Término de Contrato
              </div>
            </div>

            <div className="pr-row">
              <div className="pr-cell">
                <span className="pr-label">AVISO:</span>
                <span className={`pr-checkbox ${data.desligamento_aviso === 'Indenizado' ? 'checked' : ''}`}></span> Indenizado
                <span className={`pr-checkbox ${data.desligamento_aviso === 'Trabalhado' ? 'checked' : ''}`}></span> Trabalhado
                <span className={`pr-checkbox ${data.desligamento_aviso === 'Justa Causa' ? 'checked' : ''}`}></span> Justa causa
                <span className={`pr-checkbox ${data.desligamento_periodo_experiencia === '45 dias' ? 'checked' : ''}`}></span> 45 dias
                <span className={`pr-checkbox ${data.desligamento_periodo_experiencia === '90 dias' ? 'checked' : ''}`}></span> 90 dias
              </div>
            </div>

            <div className="pr-row">
              <div className="pr-cell">
                <span className="pr-label">Poderá retornar para a empresa ?</span>
                <span className={`pr-checkbox ${data.desligamento_recontratacao === 'Poderá retornar' ? 'checked' : ''}`}></span> Não poderá retornar a empresa
                <span style={{ marginLeft: '15px' }}>Data demissão:______________</span>
              </div>
            </div>

            <div className="pr-row">
              <div className="pr-cell">
                <span className="pr-label">Justificar:</span>
                <div>{data.desligamento_justificativa}</div>
              </div>
            </div>
          </>
        )}

        {/* Seção de Promoção */}
        {data.motivo === 'Promoção' && (
          <>
            <div className="pr-section-title">PROMOÇÃO COM ALTERAÇÃO DE CARGO/SALÁRIO</div>

            <div className="pr-promocao">
              <div className="pr-promocao-header">
                <div className="pr-promocao-header-cell">Situação Atual</div>
                <div className="pr-promocao-header-cell">Situação Proposta</div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Unidade:</span> {data.promocao_unidade_atual}
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Unidade:</span> {data.promocao_unidade_proposta}
                </div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Setor:</span> {data.promocao_setor_atual}
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Setor:</span> {data.promocao_setor_proposto}
                </div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Centro de Custo:</span> {data.promocao_centro_custo_atual}
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Centro de Custo:</span> {data.promocao_centro_custo_proposto}
                </div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Cargo:</span> {data.promocao_cargo_atual}
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Cargo:</span> {data.promocao_cargo_proposto}
                </div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Salário Base:</span> {formatCurrency(data.promocao_salario_base_atual)}
                  <span style={{ marginLeft: '8px' }}>
                    <span className="pr-label">Gratificação:</span> {formatCurrency(data.promocao_gratificacao_atual)}
                  </span>
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Salário Base:</span> {formatCurrency(data.promocao_salario_base_proposto)}
                  <span style={{ marginLeft: '8px' }}>
                    <span className="pr-label">Gratificação:</span> {formatCurrency(data.promocao_gratificacao_proposta)}
                  </span>
                </div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Total mês Recebido:</span> {formatCurrency(data.promocao_total_mes_atual)}
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Reajuste de:</span> {formatCurrency(data.promocao_reajuste_valor)}
                  <span style={{ marginLeft: '8px' }}>{data.promocao_reajuste_percentual}%</span>
                </div>
              </div>

              <div className="pr-promocao-row">
                <div className="pr-promocao-cell">
                  <span className="pr-label">Total</span> {formatCurrency(data.promocao_total_mes_atual)}
                </div>
                <div className="pr-promocao-cell">
                  <span className="pr-label">Total</span> R$ {formatCurrency(data.promocao_total_mes_proposto)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recursos Necessários */}
        <div className="pr-section-title">RECURSOS NECESSÁRIOS</div>
        <div className="pr-recursos">
          <div className="pr-recursos-item">
            <span className={`pr-checkbox ${data.recurso_mesa ? 'checked' : ''}`}></span> Mesa
          </div>
          <div className="pr-recursos-item">
            <span className={`pr-checkbox ${data.recurso_cadeira ? 'checked' : ''}`}></span> Cadeira
          </div>
          <div className="pr-recursos-item">
            <span className={`pr-checkbox ${data.recurso_apoio_pes ? 'checked' : ''}`}></span> Apoio de Pé
          </div>
          <div className="pr-recursos-item">
            <span className={`pr-checkbox ${data.recurso_epi_bota ? 'checked' : ''}`}></span> EPI - Bota de Segurança
          </div>
        </div>

        {/* Aprovações Funções Operacionais */}
        <div className="pr-section-title">
          APROVAÇÕES FUNÇÕES OPERACIONAIS - (Substituição/Desligamentos/Aumento de Quadro)
        </div>
        <div className="pr-aprovacoes pr-aprovacoes-3">
          <div className="pr-aprovacao-cell">
            <div className="pr-aprovacao-title">Coordenador de Área</div>
            <div>___/___/___</div>
          </div>
          <div className="pr-aprovacao-cell">
            <div className="pr-aprovacao-title">Gerência da Unidade - Diretoria</div>
            <div>___/___/___</div>
          </div>
          <div className="pr-aprovacao-cell">
            <div className="pr-aprovacao-title">PRESIDENCIA</div>
            <div>___/___/___</div>
          </div>
        </div>

        {/* Aprovações Cargos de Liderança */}
        <div className="pr-section-title">APROVAÇÕES CARGOS DE LIDERANÇA</div>
        <div className="pr-aprovacoes pr-aprovacoes-2">
          <div className="pr-aprovacao-cell">
            <div className="pr-aprovacao-title">GERENCIA - DIRETORIA</div>
            <div>___/___/___</div>
          </div>
          <div className="pr-aprovacao-cell">
            <div className="pr-aprovacao-title">PRESIDENCIA</div>
            <div>___/___/___</div>
          </div>
        </div>

        {/* Informações Complementares */}
        <div className="pr-section-title">
          INFORMAÇÕES COMPLEMENTARES (para preenchimento da área de Gente & Gestão)
        </div>
        <div className="pr-info-comp">
          <span className="pr-label">Informações em casos de desligamentos ou promoções:</span>
        </div>
        <div className="pr-info-comp" style={{ borderTop: '1px solid #000' }}>
          <span className="pr-label">Parecer do RH quando Necessário:</span>
          {data.comentario_aprovacao && (
            <div style={{ marginTop: '2px' }}>{data.comentario_aprovacao}</div>
          )}
        </div>
      </div>
    </>
  )
}
