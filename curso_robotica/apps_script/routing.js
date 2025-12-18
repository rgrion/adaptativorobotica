/* ===================================================
   Roteamento e Diagnóstico — Robótica v6
   (compatível com incluir(...) e com doGet?p=...)
   =================================================== */

function doGet(e) {
  let page = (e && e.parameter && e.parameter.p) ? String(e.parameter.p) : 'index';
  page = page.trim().replace(/\.html?$/i, '');
  let output;
  try {
    output = HtmlService.createHtmlOutputFromFile(page);
  } catch (err) {
    console.warn('⚠️ Página não encontrada:', page, '| Erro:', err && err.message);
    output = HtmlService.createHtmlOutputFromFile('index');
  }
  return output
    .setTitle('Curso de Robótica')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ===================================================
   incluir(nomePagina)
   - Mantido para compatibilidade com os HTMLs que chamam
   - Retorna o conteúdo HTML da página solicitada
   =================================================== */
function incluir(nomePagina) {
  var nome = String(nomePagina || '').trim().replace(/\.html?$/i, '');
  if (!nome) throw new Error('Página inválida.');

  try {
    HtmlService.createHtmlOutputFromFile(nome); // lança se não existir
  } catch (err) {
    throw new Error('Página "' + nome + '" não encontrada no projeto.');
  }

  try {
    return HtmlService
      .createHtmlOutputFromFile(nome)
      .setTitle('Curso de Robótica')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .getContent();
  } catch (e) {
    console.error('❌ incluir("' + nome + '") falhou:', e && e.message ? e.message : e);
    throw new Error('incluir("' + nome + '") falhou: ' + (e && e.message ? e.message : e));
  }
}

/* ===================================================
   Diagnóstico Inicial (salva respostas e define rota)
   =================================================== */
function registrarDiagnostico(pacote) {
  try {
    var codigo = String(pacote && pacote[0] || '').trim();
    if (!/^\d{5}$/.test(codigo)) {
      console.warn('⚠️ Código inválido:', codigo);
      return 'erro_numero';
    }

    // pacote esperado: [codigo, ...14 perfil, "Sim", nota] => total 17
    if (!Array.isArray(pacote) || pacote.length < 15) {
      throw new Error('Pacote inválido. Esperado 15 itens (código + 14 perfil + consentimento + nota). Recebido: ' + JSON.stringify(pacote));
    }

    var proxima = 'topico01'; // rota inicial após diagnóstico
    var ctx = getDados();
    var aba = ctx.aba, dados = ctx.dados, cab = ctx.cab;

    // 14 campos de perfil + Consentimento (igual você já tinha)
    var camposPerfilMaisConsent = [
      'Faixa Etária','Gênero','Grau de escolaridade','Você tem acesso à internet em casa?',
      'Principal dispositivo usado para estudar','Como costuma estudar?','Já teve contato com programação/eletrônica?',
      'Você já usou Arduino ou Tinkercad?', 'Onde você costuma estudar sobre tecnologia?',
      'Com que frequência estuda tecnologia por conta própria?','Como você se sente ao aprender algo novo em tecnologia?',
      'Qual é o seu principal objetivo com este curso?','Consentimento'
    ];

    // ⚠️ Agora garantimos TAMBÉM a coluna da nota
    var need = ['Código','Tópico Atual'].concat(camposPerfilMaisConsent).concat(['NotaPre_0_10']);
    var fixed = ensureCols(cab, need);
    aba   = fixed.aba;
    dados = fixed.dados;
    cab   = fixed.cab;

    var iCod  = colIndex(cab,'Código');
    var iTop  = colIndex(cab,'Tópico Atual');
    var iNota = colIndex(cab,'NotaPre_0_10');

    var respostas = (pacote || []).slice(1); // [14 perfil, "Sim", nota]
    var linha = -1;

    // Procura linha do aluno pelo código
    for (var i = 1; i < dados.length; i++) {
      if (String(dados[i][iCod]) === codigo) { linha = i; break; }
    }

    // Se não existe, cria linha nova com Código e Tópico Atual
    if (linha === -1) {
      linha = dados.length;
      var nova = new Array(cab.length).fill('');
      nova[iCod] = codigo;
      nova[iTop] = proxima;
      aba.appendRow(nova);
    }

    // Grava os 14 campos de perfil + Consentimento (mesma lógica de antes)
    for (var j = 0; j < camposPerfilMaisConsent.length; j++) {
      var idx = colIndex(cab, camposPerfilMaisConsent[j]);
      if (idx !== -1) aba.getRange(linha+1, idx+1).setValue(respostas[j] || '');
    }

    // 🔢 Grava a nota final (respostas[15] == posição da nota no pacote.slice(1))
    var nota = Number(respostas[15]);
    if (iNota !== -1) {
      aba.getRange(linha+1, iNota+1).setValue( isNaN(nota) ? '' : nota );
    } else {
      console.warn('⚠️ Coluna NotaPre_0_10 não encontrada após ensureCols.');
    }

    // Atualiza Tópico Atual
    aba.getRange(linha+1, iTop+1).setValue(proxima);

    console.log('✅ Diagnóstico salvo para', codigo, '→', proxima, '| NotaPre_0_10 =', nota);
    return proxima;

  } catch (e) {
    console.error('❌ registrarDiagnostico:', e && e.message ? e.message : e);
    throw new Error('registrarDiagnostico: ' + (e && e.message ? e.message : e));
  }
}

/* ===================================================
   Verificação do Aluno (para bootstrap do index)
   =================================================== */
function verificarAluno(codigo) {
  const cod = String(codigo || '').trim();
  if (!/^\d{5}$/.test(cod)) return 'introducao';

  try {
    const ctx = getDados();
    const cab = ctx.cab;
    const dados = ctx.dados;
    const iCod = colIndex(cab, 'Código');
    const iTop = colIndex(cab, 'Tópico Atual');

    for (let i = 1; i < dados.length; i++) {
      if (String(dados[i][iCod]) === cod) {
        const destino = String(dados[i][iTop] || '').trim();
        return destino ? destino.replace(/\.html?$/i, '') : 'introducao';
      }
    }
    return 'introducao';
  } catch (e) {
    console.error('verificarAluno erro:', e.message);
    return 'introducao';
  }
}

/* ===================================================
   Utilitários / Debug
   =================================================== */
function ping() { return 'pong ' + new Date(); }

function debugIncluirTodos() {
  const paginas = [
    'index', 'introducao', 'diagnostico',
    'topico01', 'topico02', 'topico03', 'topico04', 'topico05',
    'reforco01','reforco02','reforco03','reforco04','reforco05',
    'desafio01','desafio02','desafio03','desafio04','desafio05',
    'avaliacaofinal','finalagradecimento'
  ];
  const res = {};
  paginas.forEach(n => {
    try {
      HtmlService.createHtmlOutputFromFile(n);
      res[n] = 'OK';
    } catch (e) {
      res[n] = 'ERRO: ' + (e && e.message ? e.message : e);
    }
  });
  Logger.log(JSON.stringify(res, null, 2));
  return res;
}

debugIncluirTodos();

/** Monta a URL correta do WebApp (exec ou dev) para a página pedida */
function makeUrl(page) {
  page = String(page || 'introducao').trim().replace(/\.html?$/i, '');
  var base = ScriptApp.getService().getUrl(); // resolve /exec ou /dev automaticamente
  var ts = Date.now();
  return base + '?p=' + encodeURIComponent(page) + '&ts=' + ts;
}

function bootstrapAluno(codigo, destinoInicial) {
  try {
    const cod = String(codigo || '').trim();
    if (!/^\d{5}$/.test(cod)) return 'introducao';

    let {aba, dados, cab} = getDados();
    ({aba, dados, cab} = ensureCols(cab, ['Código','Tópico Atual']));

    const iCod = colIndex(cab,'Código');
    const iTop = colIndex(cab,'Tópico Atual');

    for (let i = 1; i < dados.length; i++) {
      if (String(dados[i][iCod]) === cod) {
        const atual = String(dados[i][iTop] || '').trim();
        if (!atual) aba.getRange(i+1, iTop+1).setValue(destinoInicial || 'introducao.html');
        return (destinoInicial || 'introducao').replace(/\.html?$/i,'');
      }
    }

    const nova = new Array(cab.length).fill('');
    nova[iCod] = cod;
    nova[iTop] = destinoInicial || 'introducao.html';
    aba.appendRow(nova);

    return (destinoInicial || 'introducao').replace(/\.html?$/i,'');
  } catch (e) {
    console.error('bootstrapAluno erro:', e && e.message ? e.message : e);
    return 'introducao';
  }
}

function debugHeaders() {
  const { aba } = getDados();
  const lastCol = aba.getLastColumn();
  const headers = aba.getRange(1,1,1,lastCol).getValues()[0];

  Logger.log('Total de colunas: ' + lastCol);
  headers.forEach((h, i) => {
    const txt = String(h);
    const codes = txt.split('').map(ch => ch.charCodeAt(0)).join(',');
    Logger.log( (i+1) + ' → "' + txt + '"  [codes: ' + codes + ']' );
  });
}