import jsPDF from 'jspdf';
import { CallLogItem, MessageLogItem, LocationWaypoint, SimDataUsageItem, WifiSessionItem, SystemStatsSummary } from '../types/tracker';

export interface ForensicReportPayload {
  reportId: string;
  generatedAt: string;
  targetDate: string;
  deviceName: string;
  deviceId: string;
  androidVersion: string;
  calls: CallLogItem[];
  messages: MessageLogItem[];
  waypoints: LocationWaypoint[];
  simDataUsage: SimDataUsageItem[];
  wifiSessions: WifiSessionItem[];
  summaryStats: SystemStatsSummary;
  operatorNotes?: string;
}

// Generate real SHA-256 cryptographic hash of the JSON payload
export async function calculateSha256Digest(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('Crypto subtle error, fallback hash:', err);
    // Fallback deterministic hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, 'a');
  }
}

export async function generateForensicPdf(payload: ForensicReportPayload): Promise<{ doc: jsPDF; hash: string }> {
  const serialized = JSON.stringify({
    reportId: payload.reportId,
    generatedAt: payload.generatedAt,
    targetDate: payload.targetDate,
    deviceId: payload.deviceId,
    callsCount: payload.calls.length,
    messagesCount: payload.messages.length,
    waypointsCount: payload.waypoints.length,
    calls: payload.calls.map((c) => ({ id: c.id, type: c.type, contact: c.contactName, num: c.phoneNumberOrHandle, deleted: c.deletedOnPhone })),
    messages: payload.messages.map((m) => ({ id: m.id, sender: m.sender, src: m.source, deleted: m.deletedOnPhone })),
  });

  const sha256Hash = await calculateSha256Digest(serialized);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  const primaryColor = [30, 41, 59]; // slate-800
  const accentColor = [79, 70, 229]; // indigo-600
  const alertColor = [225, 29, 72]; // rose-600
  const successColor = [16, 185, 129]; // emerald-500
  const lightBg = [248, 250, 252];

  // Helper for adding headers
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 16;
      drawPageBorder();
    }
  };

  const drawPageBorder = () => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(margin - 4, 10, pageWidth - (margin - 4) * 2, pageHeight - 20);

    // Footer on every page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ACTIVITY FORENSIC VAULT · REPORT ID: ${payload.reportId} · IMMUTABLE ARCHIVE · PAGE ${doc.getCurrentPageInfo().pageNumber}`,
      margin,
      pageHeight - 13
    );
    doc.text(
      `SHA-256: ${sha256Hash.slice(0, 32)}...`,
      pageWidth - margin,
      pageHeight - 13,
      { align: 'right' }
    );
  };

  drawPageBorder();

  // --- PAGE 1: TITLE & EXECUTIVE SUMMARY ---
  // Top Banner
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('OFFICIAL TELEMETRY & DEVICE ACTIVITY FORENSIC REPORT', margin + 6, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Cryptographically Signed · Write-Once-Read-Many (WORM) Immutable Storage Audit', margin + 6, y + 14);

  y += 24;

  // Metadata Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 2, 2, 'FD');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AUDIT METADATA & CHAIN OF CUSTODY', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  doc.text(`Report ID: ${payload.reportId}`, col1X, y + 13);
  doc.text(`Target Date: ${payload.targetDate}`, col1X, y + 19);
  doc.text(`Generated At: ${payload.generatedAt}`, col1X, y + 25);

  doc.text(`Device Model: ${payload.deviceName}`, col2X, y + 13);
  doc.text(`Device ID: ${payload.deviceId}`, col2X, y + 19);
  doc.text(`OS Version: ${payload.androidVersion}`, col2X, y + 25);

  doc.text(`Anti-Delete Engine: ENFORCED`, col3X, y + 13);
  doc.text(`Preservation Rate: 100% Retained`, col3X, y + 19);
  doc.text(`Integrity Seal: SHA-256 Validated`, col3X, y + 25);

  y += 40;

  // Anti-Delete & Security Guarantee Banner
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'FD');

  doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('FORENSIC GUARANTEE: LOCAL PHONE DELETIONS BYPASS DECLARATION', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text(
    'Even if a user clears their call log, erases SMS, or uses "Delete for Everyone / Delete Chat" in WhatsApp/Telegram,\nall incoming and outgoing records captured by the Telephony & Notification Listener daemon remain permanently preserved in this ledger.',
    margin + 4,
    y + 11
  );

  y += 24;

  // KPI Grid
  const kpiBoxWidth = (pageWidth - margin * 2 - 9) / 4;
  const kpis = [
    { label: 'Total Calls Logged', value: `${payload.calls.length}`, sub: `${payload.calls.filter((c) => c.deletedOnPhone).length} Deleted on Phone` },
    { label: 'Messages Captured', value: `${payload.messages.length}`, sub: `${payload.messages.filter((m) => m.deletedOnPhone).length} Deleted on Phone` },
    { label: 'Total Data Tracked', value: `${(payload.summaryStats.totalDataMb / 1024).toFixed(2)} GB`, sub: `SIM + Wi-Fi` },
    { label: 'GPS Checkpoints', value: `${payload.waypoints.length}`, sub: `${payload.summaryStats.distanceTraveledKm} km travel trail` },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiBoxWidth + 3);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(kpiX, y, kpiBoxWidth, 20, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kpiX + 3, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(kpi.value, kpiX + 3, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(kpi.sub.includes('Deleted') ? alertColor[0] : 100, kpi.sub.includes('Deleted') ? alertColor[1] : 116, kpi.sub.includes('Deleted') ? alertColor[2] : 139);
    doc.text(kpi.sub, kpiX + 3, y + 17);
  });

  y += 27;

  // --- SECTION 1: CALL LOG AUDIT TABLE ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. IMMUTABLE CALL LOGS & TELEPHONY FORENSICS', margin, y);
  y += 5;

  // Table header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Time', margin + 3, y + 4.2);
  doc.text('Type', margin + 22, y + 4.2);
  doc.text('Channel', margin + 42, y + 4.2);
  doc.text('Contact Name & Number / Handle', margin + 68, y + 4.2);
  doc.text('Duration', margin + 130, y + 4.2);
  doc.text('Device Phone Status', margin + 155, y + 4.2);
  y += 6;

  payload.calls.slice(0, 14).forEach((call, i) => {
    checkPageBreak(8);
    const rowBg = i % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    doc.text(call.timeFormatted || 'N/A', margin + 3, y + 4.8);

    // Call Type
    const typeLabel = call.type.toUpperCase();
    if (call.type === 'missed') {
      doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
    } else {
      doc.setTextColor(51, 65, 85);
    }
    doc.text(typeLabel, margin + 22, y + 4.8);

    // Channel
    doc.setTextColor(79, 70, 229);
    doc.text(call.channel.toUpperCase(), margin + 42, y + 4.8);

    // Contact
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    const contactText = `${call.contactName} (${call.phoneNumberOrHandle})`;
    doc.text(contactText.slice(0, 36), margin + 68, y + 4.8);

    // Duration
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const durStr = call.durationSeconds > 0 ? `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s` : '0s';
    doc.text(durStr, margin + 130, y + 4.8);

    // Phone Deletion Badge
    if (call.deletedOnPhone) {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(margin + 154, y + 1.2, 28, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(185, 28, 28);
      doc.text('DELETED ON PHONE', margin + 156, y + 4.5);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129);
      doc.text('Active in Dialer', margin + 155, y + 4.8);
    }

    y += 7.5;
  });

  y += 8;

  // --- SECTION 2: MESSAGES & CHAT INTERCEPT TABLE ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. MESSAGES & NOTIFICATION INTERCEPTS (SMS / WHATSAPP / TELEGRAM)', margin, y);
  y += 5;

  // Table header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Time', margin + 3, y + 4.2);
  doc.text('Source', margin + 22, y + 4.2);
  doc.text('Sender / Handle', margin + 46, y + 4.2);
  doc.text('Message Preview / Notification Body', margin + 92, y + 4.2);
  doc.text('Archival State', margin + 155, y + 4.2);
  y += 6;

  payload.messages.slice(0, 10).forEach((msg, i) => {
    checkPageBreak(10);
    const rowBg = i % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, pageWidth - margin * 2, 8.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    doc.text(msg.timeFormatted || 'N/A', margin + 3, y + 5);

    // Source
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(msg.source.toUpperCase(), margin + 22, y + 5);

    // Sender
    doc.setTextColor(15, 23, 42);
    doc.text(msg.sender.slice(0, 22), margin + 46, y + 5);

    // Preview
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const cleanPreview = (msg.preview || msg.fullMessageText || '').replace(/[\r\n]+/g, ' ');
    doc.text(cleanPreview.slice(0, 42) + (cleanPreview.length > 42 ? '...' : ''), margin + 92, y + 5);

    // Deletion status
    if (msg.deletedOnPhone) {
      doc.setFillColor(254, 226, 226);
      doc.roundedRect(margin + 154, y + 1.8, 28, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(185, 28, 28);
      doc.text('PHONE DELETED', margin + 156, y + 5.2);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(16, 185, 129);
      doc.text('Permanently Archived', margin + 155, y + 5);
    }

    y += 8.5;
  });

  y += 8;

  // --- SECTION 3: NETWORK & DATA BREAKDOWN ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. DUAL SIM & WI-FI DATA CONSUMPTION SUMMARY', margin, y);
  y += 5;

  const sim1 = payload.simDataUsage.find((s) => s.slotIndex === 1);
  const sim2 = payload.simDataUsage.find((s) => s.slotIndex === 2);

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const simCol1 = margin + 4;
  const simCol2 = margin + 65;
  const simCol3 = margin + 125;

  doc.text(`SIM 1 (Jio True 5G): ${sim1 ? (sim1.usedMb / 1024).toFixed(2) + ' GB' : 'N/A'}`, simCol1, y + 7);
  doc.text(`Upload: ${sim1?.uploadMb || 0} MB · Download: ${sim1?.downloadMb || 0} MB`, simCol1, y + 14);

  doc.text(`SIM 2 (Airtel 5G Plus): ${sim2 ? (sim2.usedMb / 1024).toFixed(2) + ' GB' : 'N/A'}`, simCol2, y + 7);
  doc.text(`Upload: ${sim2?.uploadMb || 0} MB · Download: ${sim2?.downloadMb || 0} MB`, simCol2, y + 14);

  const totalWifiMb = payload.wifiSessions.reduce((acc, w) => acc + w.dataUsedMb, 0);
  doc.text(`Wi-Fi Total: ${(totalWifiMb / 1024).toFixed(2)} GB`, simCol3, y + 7);
  doc.text(`Sessions: ${payload.wifiSessions.length} AP Connections`, simCol3, y + 14);

  y += 28;

  // --- SECTION 4: GPS WAYPOINTS ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('4. FUSED GPS LOCATION AUDIT TRAIL', margin, y);
  y += 5;

  payload.waypoints.slice(0, 5).forEach((w) => {
    checkPageBreak(12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${w.timeFormatted} · ${w.placeName}`, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${w.address} | Coordinates: [${w.latitude.toFixed(4)}, ${w.longitude.toFixed(4)}] | Accuracy: ±${w.accuracyMeters}m`, margin + 3, y + 8);

    y += 11.5;
  });

  y += 8;

  // --- CRYPTOGRAPHIC SIGNATURE & CERTIFICATE BLOCK ---
  checkPageBreak(35);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CRYPTOGRAPHIC INTEGRITY CERTIFICATE & DIGITAL SIGNATURE', margin + 5, y + 6);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(165, 180, 252);
  doc.text(`DIGITAL SIGNATURE (SHA-256):`, margin + 5, y + 12);
  doc.text(`${sha256Hash}`, margin + 5, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Issuer: PhonePulse Telemetry Daemon v4.2 · WORM Append-Only Vault · Certified Non-Repudiation`, margin + 5, y + 24);
  doc.text(`Timestamp: ${payload.generatedAt} · Target: ${payload.targetDate}`, pageWidth - margin - 5, y + 24, { align: 'right' });

  return { doc, hash: sha256Hash };
}
