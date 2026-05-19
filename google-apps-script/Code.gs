/**
 * Catalisador de Vendas — endpoint para Google Sheets
 *
 * Vincule este script à planilha (Extensões > Apps Script na planilha)
 * ou defina SPREADSHEET_ID abaixo.
 */

/** Deixe vazio para usar a planilha vinculada ao script */
const SPREADSHEET_ID = '';

/** Nome da aba onde os leads serão gravados */
const SHEET_NAME = 'Leads';

/** Cabeçalhos criados automaticamente na primeira linha */
const HEADERS = [
  'Nome completo',
  'WhatsApp',
  'Empresa',
  'Principal gargalo',
  'Faturamento mensal',
  'Data e hora do envio',
];

function doPost(e) {
  return handleRequest_(e);
}

function doGet(e) {
  return handleRequest_(e);
}

function handleRequest_(e) {
  try {
    const payload = parsePayload_(e);

    const nome = sanitize_(payload.nome);
    const whatsapp = sanitize_(payload.whatsapp);
    const empresa = sanitize_(payload.empresa);
    const gargalo = sanitize_(payload.gargalo || payload.desafio);
    const faturamento = sanitize_(payload.faturamento);
    const enviadoEm = formatDateTime_(payload.enviadoEm);

    if (!nome || !whatsapp || !empresa || !gargalo || !faturamento) {
      return jsonResponse_({ ok: false, error: 'Campos obrigatórios ausentes.' });
    }

    const sheet = getSheet_();
    ensureHeaders_(sheet);

    if (isDuplicateLead_(sheet, whatsapp, nome)) {
      return jsonResponse_({ ok: false, error: 'Lead já registrado recentemente.' });
    }

    sheet.appendRow([nome, whatsapp, empresa, gargalo, faturamento, enviadoEm]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error && error.message ? error.message : 'Erro interno ao salvar lead.',
    });
  }
}

function parsePayload_(e) {
  if (!e) return {};

  if (e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  if (e.postData && e.postData.contents) {
    const contentType = String(e.postData.type || '').toLowerCase();

    if (contentType.indexOf('application/json') !== -1) {
      return JSON.parse(e.postData.contents);
    }

    if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
      const params = {};
      e.postData.contents.split('&').forEach((pair) => {
        const parts = pair.split('=');
        const key = decodeURIComponent(parts[0] || '');
        const value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
        if (key) params[key] = value;
      });
      return params;
    }
  }

  return {};
}

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow(HEADERS);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function isDuplicateLead_(sheet, whatsapp, nome) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const rowsToCheck = Math.min(25, lastRow - 1);
  const startRow = lastRow - rowsToCheck + 1;
  const values = sheet.getRange(startRow, 1, lastRow, 2).getValues();
  const normalizedWhatsapp = normalizeWhatsapp_(whatsapp);
  const normalizedName = String(nome).trim().toLowerCase();
  const limitMs = 5 * 60 * 1000;
  const now = Date.now();

  for (let i = values.length - 1; i >= 0; i -= 1) {
    const rowWhatsapp = normalizeWhatsapp_(values[i][1]);
    const rowName = String(values[i][0] || '').trim().toLowerCase();

    if (rowWhatsapp !== normalizedWhatsapp || rowName !== normalizedName) continue;

    const rowNumber = startRow + i;
    const timestampCell = sheet.getRange(rowNumber, 6).getValue();
    const rowTime = timestampCell instanceof Date ? timestampCell.getTime() : now;

    if (now - rowTime < limitMs) {
      return true;
    }
  }

  return false;
}

function normalizeWhatsapp_(value) {
  return String(value || '').replace(/\D/g, '');
}

function sanitize_(value) {
  return String(value || '').trim();
}

function formatDateTime_(isoString) {
  const parsed = isoString ? new Date(isoString) : new Date();

  if (isNaN(parsed.getTime())) {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  }

  return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
