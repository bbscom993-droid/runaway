import jsPDF from 'jspdf';
import { AdSlot, SiteSettings } from '../types';

interface GenerateAdReportPdfOptions {
  adSlots: AdSlot[];
  siteSettings?: SiteSettings;
  generatedBy?: string;
}

/**
 * Parses numeric price from priceRate string (e.g. "Rp 2.500.000 / bln" -> 2500000)
 */
export function parseSlotPrice(priceRate?: string): number {
  if (!priceRate) return 0;
  const cleaned = priceRate.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Generates and downloads a comprehensive Ad Performance and Estimated Revenue PDF report.
 */
export function generateAdPerformancePdf({
  adSlots,
  siteSettings,
  generatedBy = 'Staf Redaksi Komersial'
}: GenerateAdReportPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate totals
  const totalSlots = adSlots.length;
  const activeSlots = adSlots.filter((s) => s.isEnabled).length;
  const totalClicks = adSlots.reduce((acc, s) => acc + (s.clicks || 0), 0);
  const totalImpressions = adSlots.reduce((acc, s) => acc + (s.impressions || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  // Revenue calculation
  let totalContractRevenue = 0;
  adSlots.forEach((slot) => {
    totalContractRevenue += parseSlotPrice(slot.priceRate);
  });

  // Top performing slot
  const sortedByClicks = [...adSlots].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const topSlot = sortedByClicks.length > 0 ? sortedByClicks[0] : null;

  // =========================================================
  // 1. TOP BRANDING BANNER
  // =========================================================
  doc.setFillColor(12, 74, 110); // Sky-950 #0c4a6e
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setFillColor(250, 204, 21); // Yellow-400 #facc15
  doc.rect(0, 23.5, pageWidth, 1.5, 'F');

  // Title Arun News
  doc.setTextColor(250, 204, 21); // Yellow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text((siteSettings?.portalName || 'ARUN NEWS').toUpperCase(), margin, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('DIVISI IKLAN, KEMITRAAN & MONETISASI DIGITAL', margin, 17);

  doc.setTextColor(224, 242, 254);
  doc.setFontSize(7.5);
  doc.text(`Waktu Cetak: ${dateFormatted}, ${timeFormatted} WIB`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Ref ID: ARN-AD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate()}-${Math.floor(1000 + Math.random() * 9000)}`, pageWidth - margin, 17, { align: 'right' });

  y = 31;

  // =========================================================
  // 2. DOCUMENT TITLE & SUBTITLE
  // =========================================================
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN PERFORMA IKLAN & PENDAPATAN ESTIMASI', margin, y);
  y += 5;

  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Ringkasan statistik klik real-time, tayangan impresi, rasio CTR, dan estimasi nilai kontrak slot iklan.', margin, y);
  y += 8;

  // =========================================================
  // 3. EXECUTIVE SUMMARY CARDS (4 Boxes)
  // =========================================================
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 22;

  // Card 1: Total Klik
  doc.setFillColor(254, 243, 199); // Yellow-100
  doc.setDrawColor(251, 191, 36); // Amber-400
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setTextColor(146, 64, 14); // Amber-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TOTAL KLIK REAL-TIME', margin + 3, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(`${totalClicks.toLocaleString('id-ID')}`, margin + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9);
  doc.text('Interaksi pengunjung', margin + 3, y + 18);

  // Card 2: Total Impresi
  const c2X = margin + cardWidth + 3;
  doc.setFillColor(224, 242, 254); // Sky-100
  doc.setDrawColor(56, 189, 248); // Sky-400
  doc.roundedRect(c2X, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setTextColor(7, 89, 133); // Sky-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TOTAL IMPRESI TAYANG', c2X + 3, y + 5);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.text(`${totalImpressions.toLocaleString('id-ID')}`, c2X + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(3, 105, 161);
  doc.text('Akumulasi views portal', c2X + 3, y + 18);

  // Card 3: Rata-Rata CTR
  const c3X = margin + (cardWidth + 3) * 2;
  doc.setFillColor(209, 250, 229); // Emerald-100
  doc.setDrawColor(52, 211, 153); // Emerald-400
  doc.roundedRect(c3X, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70); // Emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('RATA-RATA CTR (%)', c3X + 3, y + 5);
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(12);
  doc.text(`${avgCtr}%`, c3X + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Tingkat konversi tinggi', c3X + 3, y + 18);

  // Card 4: Total Estimasi Pendapatan
  const c4X = margin + (cardWidth + 3) * 3;
  doc.setFillColor(243, 232, 255); // Purple-100
  doc.setDrawColor(192, 132, 252); // Purple-400
  doc.roundedRect(c4X, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setTextColor(107, 33, 168); // Purple-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ESTIMASI NILAI SEWA', c4X + 3, y + 5);
  doc.setTextColor(88, 28, 135);
  doc.setFontSize(10.5);
  doc.text(`Rp ${totalContractRevenue.toLocaleString('id-ID')}`, c4X + 3, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(126, 34, 206);
  doc.text(`Kumulatif ${activeSlots} slot aktif`, c4X + 3, y + 18);

  y += cardHeight + 8;

  // =========================================================
  // 4. PERFORMANCE HIGHLIGHT BOX (Slot Terbaik)
  // =========================================================
  if (topSlot) {
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

    doc.setFillColor(250, 204, 21);
    doc.circle(margin + 6, y + 7, 3, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Slot Performa Terbaik:', margin + 12, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const topSlotInfo = `${topSlot.name} (${topSlot.advertiserName || 'Sponsor'}) - Total: ${(topSlot.clicks || 0).toLocaleString('id-ID')} Klik, Rasio CTR: ${topSlot.impressions ? (((topSlot.clicks || 0) / topSlot.impressions) * 100).toFixed(2) : '0.00'}%, Tarif: ${topSlot.priceRate || '-'}`;
    doc.text(topSlotInfo, margin + 12, y + 10.5);

    y += 18;
  }

  // =========================================================
  // 5. DETAILED TABLE OF AD SLOTS
  // =========================================================
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RINCIAN PERFORMA DAN PENDAPATAN SETIAP SLOT IKLAN', margin, y);
  y += 5;

  // Table Columns Widths (Total = contentWidth ~ 182mm)
  // No: 8, Nama Slot: 46, Posisi: 28, Mitra: 30, Status: 16, Klik: 18, CTR: 14, Tarif: 22
  const cols = {
    no: { x: margin, w: 8, title: 'No' },
    name: { x: margin + 8, w: 46, title: 'Nama Slot Iklan' },
    pos: { x: margin + 54, w: 28, title: 'Posisi Tata Letak' },
    mitra: { x: margin + 82, w: 30, title: 'Mitra Sponsor' },
    status: { x: margin + 112, w: 16, title: 'Status' },
    clicks: { x: margin + 128, w: 18, title: 'Total Klik' },
    ctr: { x: margin + 146, w: 14, title: 'CTR (%)' },
    price: { x: margin + 160, w: 22, title: 'Tarif / Bln' },
  };

  // Header Row
  doc.setFillColor(12, 74, 110); // sky-950
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text(cols.no.title, cols.no.x + 2, y + 5);
  doc.text(cols.name.title, cols.name.x + 2, y + 5);
  doc.text(cols.pos.title, cols.pos.x + 2, y + 5);
  doc.text(cols.mitra.title, cols.mitra.x + 2, y + 5);
  doc.text(cols.status.title, cols.status.x + 2, y + 5);
  doc.text(cols.clicks.title, cols.clicks.x + 2, y + 5);
  doc.text(cols.ctr.title, cols.ctr.x + 2, y + 5);
  doc.text(cols.price.title, cols.price.x + 2, y + 5);

  y += 7;

  // Table Data Rows
  adSlots.forEach((slot, index) => {
    // Check if page end reached
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin + 5;
    }

    const rowBg = index % 2 === 0 ? [248, 250, 252] : [255, 255, 255]; // Alternating colors
    doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
    doc.rect(margin, y, contentWidth, 8, 'F');

    // Horizontal bottom border
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    // No
    doc.text((index + 1).toString(), cols.no.x + 2, y + 5.5);

    // Name (truncated)
    const displayName = slot.name.length > 24 ? `${slot.name.substring(0, 22)}..` : slot.name;
    doc.setFont('helvetica', 'bold');
    doc.text(displayName, cols.name.x + 2, y + 5.5);
    doc.setFont('helvetica', 'normal');

    // Position label
    const posLabel = {
      top_billboard: 'Header Billboard',
      in_article: 'Sisipan Naskah',
      sidebar_sticky: 'Sidebar Sticky',
      bottom_sticky: 'Bottom Anchor',
    }[slot.position] || slot.position;
    doc.text(posLabel, cols.pos.x + 2, y + 5.5);

    // Advertiser
    const brandName = (slot.advertiserName || '-').substring(0, 16);
    doc.text(brandName, cols.mitra.x + 2, y + 5.5);

    // Status
    if (slot.isEnabled) {
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.setFont('helvetica', 'bold');
      doc.text('LIVE', cols.status.x + 2, y + 5.5);
    } else {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'normal');
      doc.text('OFF', cols.status.x + 2, y + 5.5);
    }

    // Clicks
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text((slot.clicks || 0).toLocaleString('id-ID'), cols.clicks.x + 2, y + 5.5);
    doc.setFont('helvetica', 'normal');

    // CTR
    const slotCtr = slot.impressions && slot.impressions > 0 
      ? (((slot.clicks || 0) / slot.impressions) * 100).toFixed(2) 
      : '0.00';
    doc.setTextColor(5, 150, 105);
    doc.text(`${slotCtr}%`, cols.ctr.x + 2, y + 5.5);

    // Price Rate
    doc.setTextColor(12, 74, 110);
    doc.setFont('helvetica', 'bold');
    const priceText = (slot.priceRate || 'Rp 2.500.000').replace(' / bln', '').replace(' / bulan', '');
    doc.text(priceText, cols.price.x + 2, y + 5.5);

    y += 8;
  });

  // Table Total Row
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL KUMULATIF', cols.name.x + 2, y + 5.5);
  doc.text(`${activeSlots} Live`, cols.status.x + 2, y + 5.5);
  doc.text(totalClicks.toLocaleString('id-ID'), cols.clicks.x + 2, y + 5.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`${avgCtr}%`, cols.ctr.x + 2, y + 5.5);
  doc.setTextColor(12, 74, 110);
  doc.text(`Rp ${totalContractRevenue.toLocaleString('id-ID')}`, cols.price.x + 2, y + 5.5);

  y += 14;

  // =========================================================
  // 6. ADVERTISING CONTACT & DIGITAL VERIFICATION
  // =========================================================
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFillColor(240, 249, 255); // sky-50
  doc.setDrawColor(186, 230, 253); // sky-200
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(12, 74, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('INFORMASI KONTAK PEMASANGAN IKLAN & VERIFIKASI RESMI', margin + 4, y + 6);

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const emailIklan = siteSettings?.officialContacts?.advertisingEmail || 'iklan@arunnews.id';
  const phoneIklan = siteSettings?.officialContacts?.hotlineWhatsapp || siteSettings?.hotlinePhone || '0895-6269-41900';
  const councilCode = siteSettings?.pressCouncilCode || 'DP-2026/08/ARN-9281';

  doc.text(`Email Divisi Iklan: ${emailIklan}   |   Hotline WhatsApp: ${phoneIklan}   |   Dewan Pers ID: ${councilCode}`, margin + 4, y + 11);
  doc.text('Sesuai Pedoman Pemberitaan Media Siber Dewan Pers, materi promosi berbayar/advertorial bertanda resmi.', margin + 4, y + 16);

  y += 28;

  // =========================================================
  // 7. SIGNATURE & STAMP SECTION
  // =========================================================
  if (y > pageHeight - 35) {
    doc.addPage();
    y = margin + 5;
  }

  const signWidth = 60;
  const signX = pageWidth - margin - signWidth;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Jakarta, ${dateFormatted}`, signX, y);
  doc.text('Meja Redaksi & Divisi Komersial,', signX, y + 4);

  // Digital Stamp Box
  doc.setDrawColor(250, 204, 21);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(signX, y + 6, signWidth, 14, 1.5, 1.5, 'FD');

  doc.setTextColor(12, 74, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('VERIFIKASI SISTEM DIGITAL', signX + 4, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(161, 98, 7);
  doc.text('TERVALIDASI OLEH MEJA REDAKSI', signX + 4, y + 15);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(generatedBy, signX, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(siteSettings?.portalName || 'Arun News Digital Network', signX, y + 29);

  // =========================================================
  // 8. PAGE FOOTER
  // =========================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(
      `Dokumen Rahasia Komersial ${siteSettings?.portalName || 'Arun News'} • Halaman ${i} dari ${totalPages}`,
      margin,
      pageHeight - 4.5
    );
    doc.text(
      'Dicetak secara otomatis melalui Meja Redaksi Sistem CMS',
      pageWidth - margin,
      pageHeight - 4.5,
      { align: 'right' }
    );
  }

  // Trigger download
  const cleanPortalName = (siteSettings?.portalName || 'ArunNews').replace(/\s+/g, '_');
  const filename = `Laporan_Performa_Iklan_${cleanPortalName}_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.pdf`;
  doc.save(filename);
}
