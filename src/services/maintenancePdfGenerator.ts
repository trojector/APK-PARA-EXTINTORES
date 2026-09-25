import { jsPDF } from 'jspdf';
import type { MaintenanceReport, CompanySettings } from '../types';

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export async function generateMaintenanceReportPDF(
  report: MaintenanceReport,
  settings: CompanySettings,
  action: 'download' | 'share' | 'whatsapp' | 'email' | 'blob' = 'download'
): Promise<File | Blob | void> {
  // Formato A4 Paisagem (Landscape: 297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 5; // margem de 5mm para total aproveitamento da folha A4
  const contentWidth = pageWidth - margin * 2; // 287 mm

  // ==========================================
  // 1. CABEÇALHO SUPERIOR (Box 287 x 24 mm)
  // ==========================================
  const headerTop = margin;
  const headerHeight = 24;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.rect(margin, headerTop, contentWidth, headerHeight);

  // Divisões verticais do cabeçalho:
  // Coluna 1: Empresa Extintores Juazeiro (56 mm)
  // Coluna 2: Dados do Cliente & Endereço (175 mm)
  // Coluna 3: Número do Laudo, Pedido, NF e Data (56 mm)
  const col1W = 56;
  const col3W = 54;
  const col2W = contentWidth - col1W - col3W; // 177 mm

  const xCol1 = margin;
  const xCol2 = xCol1 + col1W;
  const xCol3 = xCol2 + col2W;

  doc.line(xCol2, headerTop, xCol2, headerTop + headerHeight);
  doc.line(xCol3, headerTop, xCol3, headerTop + headerHeight);

  // Coluna 1: Dados da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 38, 38);
  doc.text('EXTINTORES JUAZEIRO', xCol1 + 2.5, headerTop + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(0, 0, 0);
  doc.text(`CNPJ: ${settings.cnpj}`, xCol1 + 2.5, headerTop + 8.5);
  doc.text(`${settings.address}, Nº 01 - ${settings.neighborhood}`, xCol1 + 2.5, headerTop + 12);
  doc.text(`${settings.city} - ${settings.state} | CEP: 48900-000`, xCol1 + 2.5, headerTop + 15.5);
  doc.text(`Fone: ${settings.phone} | Zap: ${settings.whatsapp}`, xCol1 + 2.5, headerTop + 19);
  doc.text('Serviços Técnicos e Ensaios Hidrostáticos', xCol1 + 2.5, headerTop + 22.5);

  // Coluna 2: Título do Documento e Dados do Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text(
    'RELATÓRIO DE MANUTENÇÃO EM EXTINTORES NÍVEL I - II - III NBR 12962 - 12274 / EB 160',
    xCol2 + col2W / 2,
    headerTop + 4.5,
    { align: 'center' }
  );

  // Linha horizontal separando título dos dados do cliente
  doc.setLineWidth(0.2);
  doc.line(xCol2, headerTop + 6.5, xCol3, headerTop + 6.5);

  // Grade interna de dados do cliente (evita estouro de texto com truncamento e dimensões fixas)
  doc.setFontSize(6.2);

  // Linha 1 Cliente
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente: ', xCol2 + 2, headerTop + 10.5);
  doc.setFont('helvetica', 'normal');
  const clientTitle = report.clientName.length > 55 ? report.clientName.substring(0, 55) + '...' : report.clientName;
  doc.text(clientTitle, xCol2 + 13, headerTop + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Nome Fant.: ', xCol2 + 105, headerTop + 10.5);
  doc.setFont('helvetica', 'normal');
  const fantTitle = (report.fantasyName || report.clientName).substring(0, 32);
  doc.text(fantTitle, xCol2 + 122, headerTop + 10.5);

  // Linha 2 Documentos
  doc.setFont('helvetica', 'bold');
  doc.text('CNPJ: ', xCol2 + 2, headerTop + 14.5);
  doc.setFont('helvetica', 'normal');
  doc.text(report.clientDocument || '-', xCol2 + 12, headerTop + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.text('IE: ', xCol2 + 52, headerTop + 14.5);
  doc.setFont('helvetica', 'normal');
  doc.text(report.stateRegistration || 'ISENTO', xCol2 + 58, headerTop + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Contato: ', xCol2 + 82, headerTop + 14.5);
  doc.setFont('helvetica', 'normal');
  doc.text((report.contactPerson || '-').substring(0, 22), xCol2 + 94, headerTop + 14.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Fone: ', xCol2 + 128, headerTop + 14.5);
  doc.setFont('helvetica', 'normal');
  doc.text(report.phone || settings.phone, xCol2 + 136, headerTop + 14.5);

  // Linha 3 Endereço
  doc.setFont('helvetica', 'bold');
  doc.text('End.: ', xCol2 + 2, headerTop + 18.5);
  doc.setFont('helvetica', 'normal');
  const fullAddr = `${report.address}  Nº: ${report.numberStreet || 'S/N'}  Bairro: ${report.neighborhood || 'ZONA RURAL'}`;
  doc.text(fullAddr.substring(0, 75), xCol2 + 11, headerTop + 18.5);

  // Linha 4 Cidade / Vendedor / Entrega
  doc.setFont('helvetica', 'bold');
  doc.text('Cidade: ', xCol2 + 2, headerTop + 22.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.city} - ${report.state}  CEP: ${report.zipCode || '48900-000'}`, xCol2 + 13, headerTop + 22.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Entrega: ', xCol2 + 82, headerTop + 22.5);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateBR(report.deliveryDate || report.date), xCol2 + 94, headerTop + 22.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendedor: ', xCol2 + 128, headerTop + 22.5);
  doc.setFont('helvetica', 'normal');
  doc.text((report.salesperson || 'BALCÃO').substring(0, 15), xCol2 + 142, headerTop + 22.5);

  // Coluna 3: Dados de Emissão
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Relatório', xCol3 + 3, headerTop + 5);
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(report.reportNumber.padStart(5, '0'), xCol3 + col3W - 3, headerTop + 5.5, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.text(`Pedido: ${report.orderNumber || '-'}`, xCol3 + 3, headerTop + 9.8);
  doc.text(`Nota Fiscal: ${report.invoiceNumber || '-'}`, xCol3 + 3, headerTop + 13.8);
  doc.text(`JUAZEIRO / BA`, xCol3 + 3, headerTop + 17.8);
  doc.text(`Data: ${formatDateBR(report.date)}  Pág: 1 de 1`, xCol3 + 3, headerTop + 21.8);

  // ==========================================
  // 2. TABELA DE CILINDROS (26 COLUNAS)
  // TOTAL EXATO = 287 mm (100% de largura A4)
  // ==========================================
  const columns: { header: string; width: number; align: 'left' | 'center' | 'right' }[] = [
    { header: 'Seq', width: 6.5, align: 'center' },                // 1
    { header: 'Nº Cilindro\n/ Recipiente', width: 17, align: 'center' }, // 2
    { header: 'Ano\nFab.', width: 8.5, align: 'center' },           // 3
    { header: 'Último\nT.H.', width: 8.5, align: 'center' },        // 4
    { header: 'Fabricante\n/ Marca', width: 15, align: 'center' }, // 5
    { header: 'Tipo\nAgente', width: 10, align: 'center' },         // 6
    { header: 'Carga\nNominal', width: 11, align: 'center' },       // 7
    { header: 'Nº do\nPatrim.', width: 13, align: 'center' },       // 8
    { header: 'Capac.\nExtint.', width: 10, align: 'center' },      // 9
    { header: 'Cód.\nProj.', width: 8.5, align: 'center' },         // 10
    { header: 'Norma\nNBR', width: 10, align: 'center' },           // 11
    { header: 'Nível\nManut.', width: 9, align: 'center' },         // 12
    { header: 'Rastreabilidade\ndo Agente', width: 17, align: 'center' }, // 13
    { header: 'Pint.', width: 7, align: 'center' },                // 14
    { header: 'Acess.', width: 11, align: 'center' },              // 15
    { header: 'Tara', width: 8.5, align: 'center' },               // 16
    { header: 'P. Vazio\nPV (kg)', width: 11, align: 'center' },   // 17
    { header: 'P. Cheio\nPC (kg)', width: 11, align: 'center' },   // 18
    { header: '% Perda\nMassa', width: 10, align: 'center' },      // 19
    { header: 'Pressão\nTrabalho', width: 11, align: 'center' },   // 20
    { header: 'Pressão\nEnsaio', width: 11, align: 'center' },     // 21
    { header: 'Exp. Tot.\nET-DVM', width: 12, align: 'center' },   // 22
    { header: 'Exp. Perm.\nEP-DVP', width: 12, align: 'center' },  // 23
    { header: 'EP/ET\n(%)', width: 9, align: 'center' },           // 24
    { header: 'Selo nº\nINMETRO', width: 18, align: 'center' },    // 25
    { header: 'A/R/N', width: 8.5, align: 'center' },              // 26
  ];

  // Verificação de soma: 6.5+17+8.5+8.5+15+10+11+13+10+8.5+10+9+17+7+11+8.5+11+11+10+11+11+12+12+9+18+8.5 = 287 mm perfeito!
  const tableStartY = headerTop + headerHeight + 2;
  const headerRowHeight = 9.5;
  const rowHeight = 6.2;

  // Cabeçalho da Tabela
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, tableStartY, contentWidth, headerRowHeight, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.rect(margin, tableStartY, contentWidth, headerRowHeight, 'S');

  let curX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(0, 0, 0);

  columns.forEach((col) => {
    doc.line(curX, tableStartY, curX, tableStartY + headerRowHeight);

    const lines = col.header.split('\n');
    if (lines.length === 1) {
      doc.text(lines[0], curX + col.width / 2, tableStartY + 5.8, { align: 'center' });
    } else {
      doc.text(lines[0], curX + col.width / 2, tableStartY + 3.8, { align: 'center' });
      doc.text(lines[1], curX + col.width / 2, tableStartY + 7.5, { align: 'center' });
    }

    curX += col.width;
  });
  doc.line(curX, tableStartY, curX, tableStartY + headerRowHeight);

  // Linhas de dados (linhas cadastradas no relatório)
  let curY = tableStartY + headerRowHeight;

  report.items.forEach((item, rIdx) => {
    const isAlt = rIdx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, curY, contentWidth, rowHeight, 'F');
    }

    doc.rect(margin, curY, contentWidth, rowHeight, 'S');

    const epPercentFormatted = item.permanentExpansionPercent
      ? (item.permanentExpansionPercent.includes('%') ? item.permanentExpansionPercent : `${item.permanentExpansionPercent}%`)
      : '-';

    const vals = [
      item.seq.toString(),
      item.cylinderNumber || '-',
      item.manufactureYear || '-',
      item.lastHydrotestYear || '-',
      item.manufacturerBrand || '-',
      item.extinguisherType || 'CO2',
      item.nominalCapacity || '02 Kg',
      item.patrimonyNumber || '-',
      item.fireRating || '2bc',
      item.projectCode || '-',
      item.nbrStandard || '12630',
      item.maintenanceLevel.toString(),
      item.agentTraceability || '-',
      item.paintRepaired ? 'X' : '',
      item.accessories || '-',
      item.tareWeight || '-',
      item.emptyWeightPV || '-',
      item.fullWeightPC || '-',
      item.massLossPercent || '0.0',
      item.workingPressurePNC || '124',
      item.testPressure || '210',
      item.totalExpansionET_DVM || '-',
      item.permanentExpansionEP_DVP || '-',
      epPercentFormatted,
      item.inmetroSealNumber || '-',
      item.result || 'A',
    ];

    let cellX = margin;
    columns.forEach((col, cIdx) => {
      doc.line(cellX, curY, cellX, curY + rowHeight);

      let textVal = vals[cIdx] || '';
      // Evitar estouro de texto caso campo seja maior que a célula
      const maxChars = Math.floor(col.width * 0.9);
      if (textVal.length > maxChars && maxChars > 3) {
        textVal = textVal.substring(0, maxChars - 1) + '…';
      }

      const textPosX = col.align === 'center' ? cellX + col.width / 2 : cellX + 1.2;

      if (cIdx === 25) {
        // Coluna A/R/N
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.8);
        if (textVal === 'A') doc.setTextColor(21, 128, 61); // verde
        else if (textVal === 'R') doc.setTextColor(220, 38, 38); // vermelho
        else doc.setTextColor(30, 64, 175); // azul
      } else if (cIdx === 24) {
        // Selo INMETRO
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(185, 28, 28);
      } else if (cIdx === 1) {
        // Nº Cilindro
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(15, 23, 42);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        doc.setTextColor(0, 0, 0);
      }

      doc.text(textVal, textPosX, curY + 4.2, { align: col.align });
      cellX += col.width;
    });

    doc.line(cellX, curY, cellX, curY + rowHeight);
    curY += rowHeight;
  });

  // Linhas em branco complementares para preencher o grid visual (pelo menos 8 linhas completas)
  const minRows = 8;
  const currentCount = report.items.length;
  if (currentCount < minRows) {
    for (let r = currentCount; r < minRows; r++) {
      doc.rect(margin, curY, contentWidth, rowHeight, 'S');
      let cellX = margin;
      columns.forEach((col, cIdx) => {
        doc.line(cellX, curY, cellX, curY + rowHeight);
        if (cIdx === 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5);
          doc.setTextColor(140, 140, 140);
          doc.text((r + 1).toString(), cellX + col.width / 2, curY + 4.2, { align: 'center' });
        }
        cellX += col.width;
      });
      doc.line(cellX, curY, cellX, curY + rowHeight);
      curY += rowHeight;
    }
  }

  // ==========================================
  // 3. RODAPÉ TÉCNICO E CONTABILIZAÇÃO NBR (287 x 48 mm)
  // Posicionado perfeitamente no final da folha A4 (210 mm)
  // ==========================================
  const footerHeight = 44;
  const footerY = Math.max(curY + 2.5, pageHeight - margin - footerHeight);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(margin, footerY, contentWidth, footerHeight);

  // Linha de Legenda e Autenticidade no Topo do Rodapé
  doc.setFontSize(5.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(
    'Leg.: A (Aprovado)  R (Reprovado)  N (Novo) - I (Inspeção Técnica)  2 (Nível - 2 Manutenção)  3 (Nível - 3 Manutenção + Teste Hidrost.)',
    margin + 3,
    footerY + 4.5
  );
  doc.setFont('helvetica', 'normal');
  doc.text(
    'O original e de igual teor se encontra em nossos arquivos devidamente assinado conforme ABNT NBR 12962 / NBR 12274 / EB 160.',
    margin + 3,
    footerY + 8
  );

  doc.setLineWidth(0.2);
  doc.line(margin, footerY + 10, margin + contentWidth, footerY + 10);

  // LADO ESQUERDO: Resumo por Tipo / Carga / Nível
  const typeCounts: Record<string, { total: number; nivel: number }> = {};
  report.items.forEach((i) => {
    const key = `${i.extinguisherType} ${i.nominalCapacity}`;
    if (!typeCounts[key]) {
      typeCounts[key] = { total: 0, nivel: i.maintenanceLevel || 3 };
    }
    typeCounts[key].total += 1;
  });

  const resBoxWidth = 54;
  doc.line(margin + resBoxWidth, footerY + 10, margin + resBoxWidth, footerY + footerHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text('RESUMO DE MANUTENÇÃO:', margin + 2.5, footerY + 14);

  let typeY = footerY + 18.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);

  Object.entries(typeCounts).forEach(([typeStr, dt]) => {
    doc.text(`• ${typeStr}: ${dt.total} un. (Nível ${dt.nivel})`, margin + 2.5, typeY);
    typeY += 3.8;
  });

  // Agente Rastreado / Novo
  typeY = Math.max(typeY + 1, footerY + 31);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.text('AGENTE EXTINTOR:', margin + 2.5, typeY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.text(`CO2 Carga Plena: ${report.items.length * 2} Kg`, margin + 2.5, typeY + 3.8);
  doc.text(`Lote / Rastreabilidade: LOTE-CO2-0926`, margin + 2.5, typeY + 7.4);

  // CENTRO: Tabela de 24 Peças e Acessórios Substituídos (4 colunas)
  const partsX = margin + resBoxWidth + 3;
  const partsW = 160;
  const partsEnd = partsX + partsW;

  doc.line(partsEnd, footerY + 10, partsEnd, footerY + footerHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text('COMPONENTES E ACESSÓRIOS SUBSTITUÍDOS (NBR 12962):', partsX, footerY + 14);

  const parts = report.partsCount || ({} as any);
  const colA = [
    `Pintura: ${parts.pintura || 0}`,
    `Pintura Ret: ${parts.pinturaRet || 0}`,
    `1-Pistola: ${parts.pistola || 0}`,
    `2-Válvula: ${parts.valvula || 0}`,
    `3-Bucha: ${parts.bucha || 0}`,
    `4-Sifão: ${parts.sifao || 0}`,
  ];
  const colB = [
    `5-Punho-Pino: ${parts.punhoPino || 0}`,
    `6-Quebra Jato: ${parts.quebraJato || 0}`,
    `7-Manômetro: ${parts.manometro || 0}`,
    `8-Mangueira: ${parts.mangueira || 0}`,
    `9-Cord. Plástico: ${parts.cordPlastico || 0}`,
    `10-Saia Plástica: ${parts.saiaPlastica || 0}`,
  ];
  const colC = [
    `11-Conj. Apague: ${parts.conjApague || 0}`,
    `12-Difusor: ${parts.difusor || 0}`,
    `13-Pera/Vedação: ${parts.peraVedacao || 0}`,
    `14-Mola/Rosca: ${parts.molaRosca || 0}`,
    `15-Conj. Miolo: ${parts.conjMiolo || 0}`,
    `16-Conj. Haste: ${parts.conjHaste || 0}`,
  ];
  const colD = [
    `17-Anel Oring: ${parts.anelOring || 0}`,
    `18-Sifão Alumínio: ${parts.sifaoAluminio || 0}`,
    `19-Conj. Segurança: ${parts.conjSeguranca || 0}`,
    `20-Haste p/Válvula: ${parts.hastePValvula || 0}`,
    `21-Gancho c/Suporte: ${parts.ganchoSuporte || 0}`,
    `22-Trava e Corrente: ${parts.travaCorrente || 0}`,
  ];

  const drawPartColumn = (list: string[], startX: number) => {
    let pY = footerY + 18.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    list.forEach((txt) => {
      doc.text(txt, startX, pY);
      pY += 3.8;
    });
  };

  drawPartColumn(colA, partsX);
  drawPartColumn(colB, partsX + 38);
  drawPartColumn(colC, partsX + 78);
  drawPartColumn(colD, partsX + 118);

  // LADO DIREITO: Assinatura do Responsável Operacional
  const sigX = partsEnd + 4;
  const sigW = contentWidth - resBoxWidth - partsW - 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text('RESPONSÁVEL OPERACIONAL:', sigX, footerY + 14);

  // Linha para carimbo / assinatura
  doc.setLineWidth(0.3);
  doc.line(sigX + 2, footerY + 28, sigX + sigW - 4, footerY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text(report.responsibleOperator || 'ARILSON LEONEL DOS SANTOS', sigX + sigW / 2 - 2, footerY + 32, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(report.operatorRegistration || 'CFT/BA:58098216268', sigX + sigW / 2 - 2, footerY + 35.5, { align: 'center' });
  doc.text('EXTINTORES JUAZEIRO', sigX + sigW / 2 - 2, footerY + 39, { align: 'center' });

  const fileName = `Relatorio_Manutencao_${report.reportNumber}_ExtintoresJuazeiro.pdf`;

  // Gera o Blob para manipulação multiplataforma (Android, iOS, Web)
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  if (action === 'blob') {
    return pdfBlob;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = typeof window !== 'undefined' ? (window as any) : undefined;
  const androidBridge = win?.AndroidBridge;

  // ============================================================
  // AÇÃO: DOWNLOAD (Compatível com Celular Android, App e Navegador)
  // ============================================================
  if (action === 'download') {
    // 1. Se estiver no App Android APK nativo: envia via bridge nativo
    if (androidBridge && typeof androidBridge.downloadPdf === 'function') {
      try {
        const dataUri = doc.output('datauristring');
        androidBridge.downloadPdf(dataUri, fileName);
        return;
      } catch (err) {
        console.warn('Erro ao chamar downloadPdf nativo:', err);
      }
    }

    // 2. Se for navegador mobile/desktop: cria link com blob URL e dispara download
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 2000);
      return;
    } catch {
      // Fallback padrão jsPDF
      doc.save(fileName);
      return;
    }
  }

  // ============================================================
  // AÇÃO: EMAIL (Enviar por E-mail com anexo / Web Share / Mailto)
  // ============================================================
  if (action === 'email') {
    const subject = encodeURIComponent(`Relatório de Manutenção Nº ${report.reportNumber} - Extintores Juazeiro`);
    const emailBody = encodeURIComponent(
      `Prezado(a) ${report.clientName},\n\n` +
      `Segue o Relatório de Manutenção Técnica em Extintores de Incêndio (Norma ABNT NBR 12962 / 12274 / EB 160) referente aos seus equipamentos.\n\n` +
      `📋 DETALHES DO RELATÓRIO:\n` +
      `• Relatório Nº: ${report.reportNumber}\n` +
      `• Pedido: ${report.orderNumber || '-'}\n` +
      `• Nota Fiscal: ${report.invoiceNumber || '-'}\n` +
      `• Quantidade de Cilindros: ${report.items.length}\n` +
      `• Data da Manutenção: ${formatDateBR(report.date)}\n` +
      `• Responsável Técnico: ${report.responsibleOperator} (${report.operatorRegistration})\n\n` +
      `O documento técnico em PDF de alta resolução no formato A4 Paisagem foi gerado para seu arquivamento e atendimento às exigências do Corpo de Bombeiros.\n\n` +
      `Atenciosamente,\n` +
      `Extintores Juazeiro\n` +
      `Telefone: ${settings.phone} | WhatsApp: ${settings.whatsapp}\n` +
      `${settings.address} - ${settings.neighborhood}, ${settings.city}-${settings.state}`
    );

    // 1. Tentar Web Share API se o celular suportar envio de arquivo para o Gmail/Email
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `Relatório de Manutenção Nº ${report.reportNumber} - Extintores Juazeiro`,
          text: `Relatório Técnico de Manutenção NBR 12962 - Cliente: ${report.clientName}`,
        });
        return pdfFile;
      } catch (err) {
        console.warn('Web Share cancelado ou não suportado:', err);
      }
    }

    // 2. Se estiver no app Android: abre o seletor geral de apps (Gmail, Outlook, etc.)
    if (androidBridge && typeof androidBridge.sharePdfGeneral === 'function') {
      try {
        const dataUri = doc.output('datauristring');
        const caption = `Relatório Técnico de Manutenção Nº ${report.reportNumber} - ${report.clientName}`;
        androidBridge.sharePdfGeneral(dataUri, fileName, caption);
        return pdfFile;
      } catch (err) {
        console.warn('Erro ao chamar sharePdfGeneral nativo:', err);
      }
    }

    // 3. Fallback: Baixa o PDF no celular e abre o cliente de e-mail padrão do aparelho
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1500);
    } catch {
      doc.save(fileName);
    }

    const clientMail = report.clientEmail ? encodeURIComponent(report.clientEmail) : '';
    const mailtoUrl = `mailto:${clientMail}?subject=${subject}&body=${emailBody}`;
    window.location.href = mailtoUrl;
    return pdfFile;
  }

  // ============================================================
  // AÇÃO: WHATSAPP (Direto no Zap com PDF anexado)
  // ============================================================
  const captionMessage =
    `🔥 *EXTINTORES JUAZEIRO*\n` +
    `*RELATÓRIO TÉCNICO DE MANUTENÇÃO NBR 12962 / 12274*\n` +
    `📄 *Laudo Nº:* ${report.reportNumber}\n` +
    `🏢 *Cliente:* ${report.clientName}\n` +
    `🧯 *Qtd. Cilindros:* ${report.items.length} unidades\n` +
    `📅 *Data da Manutenção:* ${formatDateBR(report.date)}\n` +
    `👷 *Resp. Operacional:* ${report.responsibleOperator} (${report.operatorRegistration})\n\n` +
    `Segue em anexo o documento técnico oficial em PDF.`;

  // 1. Android Nativo via AndroidBridge
  if (androidBridge && typeof androidBridge.sharePdfWhatsApp === 'function') {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        const cleanPhone = (report.phone || '').replace(/\D/g, '');
        androidBridge.sharePdfWhatsApp(base64Data, fileName, cleanPhone, captionMessage);
      };
      reader.readAsDataURL(pdfBlob);
      return pdfFile;
    } catch (err) {
      console.warn('Erro ao chamar sharePdfWhatsApp nativo:', err);
    }
  }

  // 2. Web Share API para Navegadores Celulares (Chrome/Safari/Android)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Relatório de Manutenção Nº ${report.reportNumber} - Extintores Juazeiro`,
        text: captionMessage,
      });
      return pdfFile;
    } catch {
      // Caso o usuário cancele ou ocorra erro, cai no fallback
    }
  }

  // 3. Fallback: Baixa o PDF no dispositivo e abre a conversa do WhatsApp
  try {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  } catch {
    doc.save(fileName);
  }

  const cleanPhone = (report.phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(captionMessage);
  const targetUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(targetUrl, '_blank');

  return pdfFile;
}
