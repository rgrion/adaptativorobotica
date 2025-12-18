/*******************************
 *  Curso: Robótica
 *  Backend (Apps Script) — v2 (Fuzzy)
 *******************************/
const SHEET_ID   = 'COLE O ID DA PLANILHA AQUI';
const SHEET_NAME = 'respostas';

/* ===========================
   Utilidades de planilha
   =========================== */

function getSS(){
  try {
    return SpreadsheetApp.openById(SHEET_ID);
  } catch (e) {
    console.error('Falha ao abrir planilha. Verifique SHEET_ID e permissões:', e);
    throw new Error('Não consegui acessar a planilha (SHEET_ID inválido ou sem permissão).');
  }
}

function getAba(){
  const ss = getSS();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    throw new Error('Aba "'+SHEET_NAME+'" não encontrada na planilha.');
  }
  return sh;
}

function getDados(){
  const aba = getAba();
  const rng = aba.getDataRange().getValues();
  return { aba, dados: rng, cab: rng[0] || [] };
}

function pingPlanilha(){
  const ss = getSS();
  const sh = ss.getSheetByName(SHEET_NAME);
  if(!sh) throw new Error('Aba "'+SHEET_NAME+'" não encontrada.');
  const cab = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  console.log('OK planilha:', ss.getName(), ' | Aba:', sh.getName(), ' | Cabeçalho:', cab);
  return { ok:true, sheet:ss.getName(), aba:sh.getName(), cab };
}
function colIndex(cab, nome){ return cab.indexOf(nome); }
function ensureCols(cab, nomes){
  const aba = getAba();
  let changed = false;
  nomes.forEach(n=>{
    if(colIndex(cab, n) === -1){
      aba.getRange(1, cab.length+1, 1, 1).setValue(n);
      cab.push(n);
      changed = true;
    }
  });
  if(changed){
    const rng = aba.getDataRange().getValues();
    return { aba, dados: rng, cab: rng[0] };
  }
  return { aba, dados: aba.getDataRange().getValues(), cab };
}

function testWrite() {
  const ss = getSS();
  const sh = ss.getSheetByName(SHEET_NAME);
  sh.appendRow(['TESTE', 'ok', new Date()]);
  Logger.log('appendRow OK');
}

