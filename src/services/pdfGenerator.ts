import { jsPDF } from 'jspdf';
import type { Quote, CompanySettings } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateString?: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export async function generateQuotePDF(
  quote: Quote,
  settings: CompanySettings,
  action: 'download' | 'share' | 'blob' = 'download'
): Promise<Blob | void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Cores institucionais
  const primaryRed = [190, 18, 24]; // #BE1218 Vermelho extintor
  const darkNavy = [15, 23, 42]; // #0F172A
  const textMuted = [100, 116, 139]; // #64748B
  const bgLight = [248, 250, 252]; // #F8FAFC
  const borderLight = [226, 232, 240]; // #E2E8F0

  let y = 14;

  // ===============================
  // CABEÇALHO CORPORATIVO
  // ===============================
  // Barra superior decorativa
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.rect(margin, y, contentWidth, 3, 'F');
  y += 7;

  // Logotipo desenhado em vetor (Ícone de extintor estilizado)
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.roundedRect(margin, y, 14, 18, 2, 2, 'F');
  // Detalhe do cilindro
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + 3, y + 4, 8, 11, 1, 1, 'F');
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.circle(margin + 7, y + 9.5, 2.5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(margin + 5, y + 2, 4, 2, 'F'); // Válvula

  // Nome da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('EXTINTORES JUAZEIRO', margin + 18, y + 5.5);

  // CNPJ e Endereço exatamente conforme solicitado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(
    `Extintores Juazeiro - CNPJ:${settings.cnpj || '64.319.136/0001-41'}`,
    margin + 18,
    y + 9.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `${settings.address || 'Quadra 19, Nº 01'} - ${settings.neighborhood || 'JOÃO PAULO II'} - ${settings.city || 'JUAZEIRO'}-${settings.state || 'BA'}`,
    margin + 18,
    y + 13.5
  );
  doc.text(
    `Resp. Técnico: ${settings.responsibleName || 'Robson Alves Dias Bonfim'}  |  Fone/WhatsApp: ${settings.whatsapp || settings.phone}`,
    margin + 18,
    y + 17.5
  );

  // Box do Número do Orçamento no lado direito
  const quoteBoxWidth = 52;
  const quoteBoxX = pageWidth - margin - quoteBoxWidth;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(quoteBoxX, y, quoteBoxWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('PROPOSTA COMERCIAL', quoteBoxX + quoteBoxWidth / 2, y + 5, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Nº ${quote.number}`, quoteBoxX + quoteBoxWidth / 2, y + 11.5, { align: 'center' });

  // Status Badge
  const statusColors: Record<string, { bg: number[]; text: number[] }> = {
    APROVADO: { bg: [220, 252, 231], text: [22, 101, 52] },
    ENVIADO: { bg: [224, 242, 254], text: [3, 105, 161] },
    RASCUNHO: { bg: [241, 245, 249], text: [71, 85, 105] },
    RECUSADO: { bg: [254, 226, 226], text: [153, 27, 27] },
    EXPIRADO: { bg: [254, 243, 199], text: [146, 64, 14] },
  };
  const sc = statusColors[quote.status] || statusColors.RASCUNHO;
  doc.setFillColor(sc.bg[0], sc.bg[1], sc.bg[2]);
  doc.roundedRect(quoteBoxX + 8, y + 13.5, quoteBoxWidth - 16, 5, 1, 1, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(sc.text[0], sc.text[1], sc.text[2]);
  doc.text(quote.status, quoteBoxX + quoteBoxWidth / 2, y + 17, { align: 'center' });

  y += 24;

  // Linha divisória
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ===============================
  // DADOS DO CLIENTE & PROPOSTA
  // ===============================
  const colWidth = (contentWidth - 6) / 2;

  // Card Dados do Cliente
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, colWidth, 26, 2, 2, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, y, colWidth, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('DADOS DO CLIENTE', margin + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  const clientNameStr = quote.clientName.length > 34 ? quote.clientName.substring(0, 32) + '...' : quote.clientName;
  doc.text(clientNameStr, margin + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  if (quote.clientDocument) {
    doc.text(`CNPJ/CPF: ${quote.clientDocument}`, margin + 4, y + 15);
  }
  if (quote.clientPhone) {
    doc.text(`Telefone: ${quote.clientPhone}`, margin + 4, y + 19);
  }
  if (quote.clientAddress) {
    const addressStr = quote.clientAddress.length > 40 ? quote.clientAddress.substring(0, 38) + '...' : quote.clientAddress;
    doc.text(`Endereço: ${addressStr}`, margin + 4, y + 23);
  }

  // Card Dados do Orçamento
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(rightColX, y, colWidth, 26, 2, 2, 'F');
  doc.roundedRect(rightColX, y, colWidth, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('INFORMAÇÕES DA PROPOSTA', rightColX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Data de Emissão:', rightColX + 4, y + 10.5);
  doc.text('Data de Validade:', rightColX + 4, y + 15);
  doc.text('Responsável:', rightColX + 4, y + 19.5);
  doc.text('Prazo de Entrega:', rightColX + 4, y + 23.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(formatDateBR(quote.date), rightColX + 32, y + 10.5);
  doc.text(formatDateBR(quote.validUntil), rightColX + 32, y + 15);
  const respStr = quote.responsible.length > 28 ? quote.responsible.substring(0, 26) + '...' : quote.responsible;
  doc.text(respStr, rightColX + 32, y + 19.5);
  doc.text(quote.deliveryTime || 'Conforme agendamento', rightColX + 32, y + 23.5);

  y += 31;

  // ===============================
  // TABELA DE ITENS (PRODUTOS / SERVIÇOS)
  // ===============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('ITENS DO ORÇAMENTO', margin, y);
  y += 3;

  // Cabeçalho da tabela
  const tableX = margin;
  const colDescWidth = 92;
  const colQtdWidth = 16;
  const colUnidWidth = 14;
  const colVlrWidth = 30;
  const colTotalWidth = 30;

  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.rect(tableX, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIÇÃO DO PRODUTO OU SERVIÇO', tableX + 3, y + 4.8);
  doc.text('QTD', tableX + colDescWidth + 4, y + 4.8, { align: 'center' });
  doc.text('UN', tableX + colDescWidth + colQtdWidth + 5, y + 4.8, { align: 'center' });
  doc.text('VALOR UNIT.', tableX + colDescWidth + colQtdWidth + colUnidWidth + colVlrWidth - 3, y + 4.8, { align: 'right' });
  doc.text('TOTAL', tableX + contentWidth - 3, y + 4.8, { align: 'right' });

  y += 7;

  // Linhas de itens
  quote.items.forEach((item, index) => {
    // Quebra de página se necessário
    if (y > pageHeight - 65) {
      doc.addPage();
      y = 16;
    }

    const isEven = index % 2 === 0;
    const rowHeight = item.description ? 10 : 7.5;

    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(tableX, y, contentWidth, rowHeight, 'F');
    }

    // Linha divisória inferior suave
    doc.setDrawColor(235, 238, 242);
    doc.line(tableX, y + rowHeight, tableX + contentWidth, y + rowHeight);

    // Nome do Produto/Serviço
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    const prodName = item.productService.length > 50 ? item.productService.substring(0, 48) + '...' : item.productService;
    doc.text(prodName, tableX + 3, y + 4.5);

    if (item.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const descStr = item.description.length > 65 ? item.description.substring(0, 62) + '...' : item.description;
      doc.text(descStr, tableX + 3, y + 8);
    }

    // Quantidade
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(item.quantity.toString(), tableX + colDescWidth + 4, y + 4.5, { align: 'center' });

    // Unidade
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(item.unit || 'UN', tableX + colDescWidth + colQtdWidth + 5, y + 4.5, { align: 'center' });

    // Valor Unitário
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(
      formatCurrency(item.unitPrice),
      tableX + colDescWidth + colQtdWidth + colUnidWidth + colVlrWidth - 3,
      y + 4.5,
      { align: 'right' }
    );

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.text(
      formatCurrency(item.quantity * item.unitPrice - (item.discount || 0)),
      tableX + contentWidth - 3,
      y + 4.5,
      { align: 'right' }
    );

    y += rowHeight;
  });

  y += 4;

  // ===============================
  // QUADRO DE TOTAIS & OBSERVAÇÕES
  // ===============================
  if (y > pageHeight - 75) {
    doc.addPage();
    y = 16;
  }

  const totalsBoxWidth = 75;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const notesWidth = contentWidth - totalsBoxWidth - 8;

  // Caixa de Observações
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, y, notesWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('OBSERVAÇÕES E CONDIÇÕES', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);

  const notesText =
    quote.notes ||
    settings.defaultNotes ||
    'Proposta sujeita a aprovação técnica e comercial.';
  const splitNotes = doc.splitTextToSize(notesText, notesWidth - 8);
  doc.text(splitNotes, margin + 4, y + 10);

  if (quote.paymentTerms) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Pagamento: ${quote.paymentTerms}`, margin + 4, y + 29);
  }
  if (quote.warranty) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Garantia: ${quote.warranty}`, margin + 4, y + 34);
  }

  // Caixa de Totais
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(totalsBoxX, y, totalsBoxWidth, 38, 2, 2, 'FD');

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Subtotal:', totalsBoxX + 6, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(formatCurrency(quote.subtotal), totalsBoxX + totalsBoxWidth - 6, y + 8, { align: 'right' });

  // Desconto
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Desconto:', totalsBoxX + 6, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(190, 18, 24);
  doc.text(`- ${formatCurrency(quote.discount || 0)}`, totalsBoxX + totalsBoxWidth - 6, y + 16, { align: 'right' });

  // Barra de Destaque do TOTAL
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.roundedRect(totalsBoxX + 3, y + 22, totalsBoxWidth - 6, 12, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL:', totalsBoxX + 7, y + 29.5);
  doc.setFontSize(11.5);
  doc.text(formatCurrency(quote.total), totalsBoxX + totalsBoxWidth - 7, y + 29.5, { align: 'right' });

  y += 44;

  // ===============================
  // BLOCO DE ASSINATURAS
  // ===============================
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 20;
  }

  const sigColWidth = (contentWidth - 14) / 2;

  // Assinatura do Cliente
  doc.setDrawColor(180, 190, 205);
  doc.line(margin, y + 14, margin + sigColWidth, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(quote.clientName, margin + sigColWidth / 2, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Aceite do Cliente / De acordo em: ____/____/2026', margin + sigColWidth / 2, y + 21.5, { align: 'center' });

  // Assinatura do Responsável Técnico
  const sig2X = margin + sigColWidth + 14;
  doc.line(sig2X, y + 14, sig2X + sigColWidth, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(quote.responsible || settings.responsibleName, sig2X + sigColWidth / 2, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`${settings.name} — ${settings.responsibleRole}`, sig2X + sigColWidth / 2, y + 21.5, { align: 'center' });

  // Rodapé da página
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    `Extintores Juazeiro - CNPJ:${settings.cnpj} - ${settings.address} - ${settings.neighborhood} - ${settings.city}-${settings.state}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  const filename = `Orcamento_${quote.number}_ExtintoresJuazeiro.pdf`;

  // Check AndroidBridge (Native Android App)
  const androidBridge = typeof window !== 'undefined' ? (window as unknown as { AndroidBridge?: {
    sharePdfWhatsApp: (b64: string, fname: string, phone: string, caption: string) => void;
    sharePdfGeneral: (b64: string, fname: string, caption: string) => void;
    downloadPdf: (b64: string, fname: string) => void;
  } }).AndroidBridge : undefined;

  if (action === 'download') {
    if (androidBridge) {
      const dataUri = doc.output('datauristring');
      androidBridge.downloadPdf(dataUri, filename);
      return;
    }
    doc.save(filename);
    return;
  }

  const pdfBlob = doc.output('blob');

  if (action === 'share') {
    const shareText = `Segue o orçamento Nº ${quote.number} de Extintores Juazeiro para ${quote.clientName}. Total: ${formatCurrency(quote.total)}.`;
    
    // 1. If inside Android APK Native Bridge, use FileProvider + WhatsApp Intent
    if (androidBridge) {
      const dataUri = doc.output('datauristring');
      const phone = quote.clientPhone ? quote.clientPhone.replace(/\D/g, '') : '';
      androidBridge.sharePdfWhatsApp(dataUri, filename, phone, shareText);
      return pdfBlob;
    }

    // 2. Standard Web Share API with File
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Orçamento Nº ${quote.number} - Extintores Juazeiro`,
            text: shareText,
            files: [file],
          });
          return pdfBlob;
        }
      } catch (e) {
        console.warn('Web Share API error or cancelled:', e);
      }
    }

    // Fallback: download
    doc.save(filename);
    return pdfBlob;
  }

  return pdfBlob;
}

// Helper para compartilhar via WhatsApp enviando o PDF diretamente
export async function shareQuoteWhatsAppWithPdf(quote: Quote, settings: CompanySettings): Promise<void> {
  const androidBridge = typeof window !== 'undefined' ? (window as unknown as { AndroidBridge?: {
    sharePdfWhatsApp: (b64: string, fname: string, phone: string, caption: string) => void;
    sharePdfGeneral: (b64: string, fname: string, caption: string) => void;
    downloadPdf: (b64: string, fname: string) => void;
  } }).AndroidBridge : undefined;

  const phone = quote.clientPhone ? quote.clientPhone.replace(/\D/g, '') : '';
  const captionText = `🔥 *EXTINTORES JUAZEIRO*
*PROPOSTA COMERCIAL Nº ${quote.number}*
👤 *Cliente:* ${quote.clientName}
💰 *Total: ${formatCurrency(quote.total)}*
⏳ *Validade:* ${formatDateBR(quote.validUntil)}
📄 *Segue em anexo o documento oficial em PDF.*`;

  // If in native Android app, send PDF file directly via AndroidBridge
  if (androidBridge) {
    try {
      const doc = await generateQuotePDF(quote, settings, 'blob');
      if (doc) {
        // We can re-trigger generateQuotePDF with 'share'
        await generateQuotePDF(quote, settings, 'share');
        return;
      }
    } catch (err) {
      console.error('Error generating PDF for Android WhatsApp:', err);
    }
  }

  // If in mobile browser supporting Web Share with files
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const blob = await generateQuotePDF(quote, settings, 'blob');
      if (blob instanceof Blob) {
        const filename = `Orcamento_${quote.number}_ExtintoresJuazeiro.pdf`;
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Orçamento Nº ${quote.number} - Extintores Juazeiro`,
            text: captionText,
            files: [file],
          });
          return;
        }
      }
    } catch {
      // User cancelled or share declined, continue to WhatsApp link fallback
    }
  }

  // Fallback: Baixa o PDF no dispositivo e abre o WhatsApp com a mensagem estruturada
  try {
    await generateQuotePDF(quote, settings, 'download');
  } catch (e) {
    console.error('PDF download fallback error:', e);
  }

  // Open WhatsApp chat
  shareQuoteWhatsApp(quote, settings);
}

// Helper para compartilhar via WhatsApp com texto estruturado
export function shareQuoteWhatsApp(quote: Quote, settings: CompanySettings): void {
  const phone = quote.clientPhone ? quote.clientPhone.replace(/\D/g, '') : '';
  const itemsText = quote.items
    .map(
      (item, i) =>
        `  ${i + 1}. *${item.productService}*\n     Qtd: ${item.quantity} ${item.unit} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice - (item.discount || 0))}`
    )
    .join('\n');

  const text = `🔥 *EXTINTORES JUAZEIRO*
*PROPOSTA COMERCIAL Nº ${quote.number}*
🏢 Extintores Juazeiro - CNPJ:${settings.cnpj}
📍 ${settings.address} - ${settings.neighborhood} - ${settings.city}-${settings.state}
----------------------------------------
👤 *Cliente:* ${quote.clientName}
📅 *Data:* ${formatDateBR(quote.date)}
⏳ *Validade:* ${formatDateBR(quote.validUntil)}
👷 *Responsável Técnico:* ${quote.responsible}

📋 *ITENS:*
${itemsText}
----------------------------------------
*Subtotal:* ${formatCurrency(quote.subtotal)}
*Desconto:* ${formatCurrency(quote.discount || 0)}
💰 *VALOR TOTAL: ${formatCurrency(quote.total)}*

📌 *Observações:*
${quote.notes || settings.defaultNotes || 'Garantia de 12 meses nos serviços executados.'}

Entre em contato conosco para aprovação:
📞 ${settings.phone} / 💬 ${settings.whatsapp}
Extintores Juazeiro - Sua segurança em primeiro lugar!`;

  const encoded = encodeURIComponent(text);
  const url = phone.length >= 10
    ? `https://api.whatsapp.com/send?phone=55${phone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;

  window.open(url, '_blank');
}

// Compartilhamento geral (Web Share API ou Clipboard)
export async function shareQuoteGeneral(quote: Quote, settings?: CompanySettings): Promise<'shared' | 'copied'> {
  const shareText = `*EXTINTORES JUAZEIRO* - Orçamento Nº ${quote.number}
Cliente: ${quote.clientName}
Total: ${formatCurrency(quote.total)}
Validade: ${formatDateBR(quote.validUntil)}
Status: ${quote.status}`;

  if (settings) {
    try {
      const blob = await generateQuotePDF(quote, settings, 'blob');
      if (blob instanceof Blob && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
        const filename = `Orcamento_${quote.number}_ExtintoresJuazeiro.pdf`;
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Orçamento Nº ${quote.number} - Extintores Juazeiro`,
            text: shareText,
            files: [file],
          });
          return 'shared';
        }
      }
    } catch {
      // Ignored
    }
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Orçamento Nº ${quote.number} - Extintores Juazeiro`,
        text: shareText,
        url: window.location.href,
      });
      return 'shared';
    } catch {
      // Ignorar cancelamento
    }
  }

  // Fallback: copiar para área de transferência
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(shareText);
  }
  return 'copied';
}

