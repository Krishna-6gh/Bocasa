import { RepriceLogItem } from '../types';

/**
 * Escapes a field for CSV format following RFC 4180
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  // If the value contains comma, double-quote, or newline, enclose in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export interface CSVExportOptions {
  fileName?: string;
  filterLabel?: string;
  includeAccountingHeaders?: boolean;
}

/**
 * Generates and triggers download of a structured CSV file for seller internal accounting
 */
export function downloadRepricingCSVReport(
  logs: RepriceLogItem[],
  options?: CSVExportOptions
): { success: boolean; rowCount: number; fileName: string } {
  if (!logs || logs.length === 0) {
    return { success: false, rowCount: 0, fileName: '' };
  }

  const dateNow = new Date();
  const dateFormatted = dateNow.toISOString().split('T')[0];
  const timeFormatted = dateNow.toTimeString().split(' ')[0].replace(/:/g, '-');
  const defaultFileName = `Bocasa_Repricing_Audit_Report_${dateFormatted}_${timeFormatted}.csv`;
  const fileName = options?.fileName || defaultFileName;

  // Metadata Header Block for Accounting & Tax Audits
  const metadataLines = [
    `# =========================================================================`,
    `# BOCASA AUTOMATED REPRICING AUDIT & INTERNAL ACCOUNTING REPORT`,
    `# Generated At: ${dateNow.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
    `# Total Adjustments Recorded: ${logs.length}`,
    `# Filter Scope: ${options?.filterLabel || 'All Recorded Dispatches'}`,
    `# System Engine: Bocasa Dynamic Autonomous Repricer (Multi-Marketplace)`,
    `# Supported Channels: Amazon IN (SP-API), Flipkart Marketplace, Meesho Direct`,
    `# Currency: INR (₹)`,
    `# =========================================================================`,
    ``,
  ];

  // Column Headers matching accounting and ERP audit standards
  const headers = [
    'Log ID',
    'Timestamp (IST)',
    'Product SKU',
    'Product Title',
    'Marketplace Platform',
    'Dispatch Status',
    'Decision Action',
    'Previous Price (INR)',
    'New Adjusted Price (INR)',
    'Price Delta (INR)',
    'Price Delta (%)',
    'Cost Floor (INR)',
    'Floor Safety Margin Buffer (INR)',
    'Competitor Price (INR)',
    'Competitor Delta (INR)',
    'Decision Rationale',
    'Guardrail Safety Audit Note',
    'Accounting Classification',
  ];

  const rows = logs.map((log) => {
    const priceDeltaINR = Number((log.newPrice - log.oldPrice).toFixed(2));
    const floorMarginBufferINR = Number((log.newPrice - log.floorPrice).toFixed(2));
    const competitorDeltaINR = Number((log.newPrice - log.competitorPrice).toFixed(2));
    const isSuccess = log.status === 'SUCCESS';
    const accountingClass = isSuccess 
      ? (priceDeltaINR < 0 ? 'Margin Adjustment (Markdown/Win-Box)' : 'Margin Enhancement (Surge/Upsell)')
      : 'Blocked by Safeguard (Zero Financial Impact)';

    return [
      escapeCSVField(log.id),
      escapeCSVField(log.timestamp),
      escapeCSVField(log.productSku),
      escapeCSVField(log.productTitle),
      escapeCSVField(log.platform.toUpperCase()),
      escapeCSVField(log.status === 'SUCCESS' ? 'APPLIED (SUCCESS)' : (log.status === 'GUARDRAIL_BLOCKED' ? 'BLOCKED (GUARDRAIL)' : 'FAILED')),
      escapeCSVField(log.decisionAction),
      escapeCSVField(log.oldPrice.toFixed(2)),
      escapeCSVField(log.newPrice.toFixed(2)),
      escapeCSVField((priceDeltaINR > 0 ? `+${priceDeltaINR.toFixed(2)}` : priceDeltaINR.toFixed(2))),
      escapeCSVField(`${log.changePct > 0 ? '+' : ''}${log.changePct}%`),
      escapeCSVField(log.floorPrice.toFixed(2)),
      escapeCSVField((floorMarginBufferINR > 0 ? `+${floorMarginBufferINR.toFixed(2)}` : floorMarginBufferINR.toFixed(2))),
      escapeCSVField(log.competitorPrice.toFixed(2)),
      escapeCSVField((competitorDeltaINR > 0 ? `+${competitorDeltaINR.toFixed(2)}` : competitorDeltaINR.toFixed(2))),
      escapeCSVField(log.explanation),
      escapeCSVField(log.guardrailNote || 'Safe: Executed within pre-set margin and velocity limits.'),
      escapeCSVField(accountingClass),
    ].join(',');
  });

  // UTF-8 Byte Order Mark (BOM) \uFEFF ensures Excel renders non-ASCII characters & symbols cleanly
  const csvContent = '\uFEFF' + metadataLines.join('\n') + headers.join(',') + '\n' + rows.join('\n');

  // Trigger Browser Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    rowCount: logs.length,
    fileName,
  };
}
