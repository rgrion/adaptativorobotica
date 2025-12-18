/* ===========================
   Correção genérica + Fuzzy (v2)
   =========================== */
/**
 * pacote: [codigo, ...respostasQuiz(5), dificuldadeLikert?, autoconfiancaLikert?]
 * meta: {
 *   colQuiz:    'T01',           // acertos do quiz (0..5)
 *   colNota:    'T01_Nota',      // nota 0..100 (acertos * 20)
 *   colReforco: 'T01R',          // acertos do reforço (0..3) - mantido
 *   colDesafio: 'T01D',          // acertos do desafio (0..1) - mantido
 *   likertDif:  'T01_Dif',       // dificuldade percebida (1..5)
 *   likertAutoC:'T01_AutoC',     // autoconfiança (1..5)
 *   colTrilha:  'T01_Trilha',    // saída linguística da fuzzy: REFORCO | REGULAR | DESAFIO
 *   colScore:   'T01_Score',     // score contínuo (0..100) da fuzzy
 *   colRota:    'T01_Rota',      // página decidida/rota (reforco01.html | topico02.html | desafio01.html)
 *   nextTopico: 'topico02.html', // página padrão REGULAR
 *   pagReforco: 'reforco01.html',
 *   pagDesafio: 'desafio01.html'
 * }
 */
function _corrigirComFuzzy(pacote, gabarito, meta){
  const codigo = pacote[0];
  const respostasQuiz = pacote.slice(1, 1+gabarito.length);

  // Likert opcionais no final do pacote (1..5)
  const possiveisLikert = pacote.slice(1+gabarito.length);
  const difLik  = Number(possiveisLikert[0]);
  const autoLik = Number(possiveisLikert[1]);
  const temLikert = !isNaN(difLik) && !isNaN(autoLik) && difLik>0 && autoLik>0;

  // acertos
  let acertos = 0;
  for(let i=0;i<gabarito.length;i++){ if(respostasQuiz[i] === gabarito[i]) acertos++; }

  // === NOTA (0..100) = acertos * 20 ===
  const nota = acertos * 20;

  // garante colunas
  let {aba, dados, cab} = getDados();
  ({aba, dados, cab} = ensureCols(cab, [
    'Código','Tópico Atual',
    meta.colQuiz, meta.colNota, meta.colReforco, meta.colDesafio,
    meta.likertDif, meta.likertAutoC, meta.colTrilha, meta.colScore, meta.colRota
  ]));

  const idxCodigo = colIndex(cab,'Código');
  const idxTopico = colIndex(cab,'Tópico Atual');
  const idxQuiz   = colIndex(cab, meta.colQuiz);
  const idxNota   = colIndex(cab, meta.colNota);
  const idxDif    = colIndex(cab, meta.likertDif);
  const idxAutoC  = colIndex(cab, meta.likertAutoC);
  const idxTrilha = colIndex(cab, meta.colTrilha);
  const idxScore  = colIndex(cab, meta.colScore);
  const idxRota   = colIndex(cab, meta.colRota);

  for(let i=1;i<dados.length;i++){
    if(String(dados[i][idxCodigo]) === String(codigo)){

      // grava acertos do quiz e nota
      if(idxQuiz !== -1) aba.getRange(i+1, idxQuiz+1).setValue(acertos);  // 0..5
      if(idxNota !== -1) aba.getRange(i+1, idxNota+1).setValue(nota);     // 0..100

      // grava likert se veio no pacote; senão preserva/usa neutro 3
      let dif = parseFloat(dados[i][idxDif]) || null;
      let aut = parseFloat(dados[i][idxAutoC]) || null;
      if(temLikert){
        if(idxDif   !== -1) aba.getRange(i+1, idxDif+1).setValue(difLik);
        if(idxAutoC !== -1) aba.getRange(i+1, idxAutoC+1).setValue(autoLik);
        dif = difLik; aut = autoLik;
      }
      if(!dif) dif = 3;
      if(!aut) aut = 3;

      // decisão fuzzy
      const decisao = decidirTrilhaFuzzy(nota, dif, aut); // { trilha, score, ... }

      if(idxTrilha !== -1) aba.getRange(i+1, idxTrilha+1).setValue(decisao.trilha);          // REFORCO|REGULAR|DESAFIO
      if(idxScore  !== -1) aba.getRange(i+1, idxScore+1).setValue(Math.round(decisao.score)); // 0..100 inteiro
      if(idxRota   !== -1){
        // escolhe próxima página por trilha
        let proximo = meta.nextTopico; // REGULAR
        if(decisao.trilha === 'REFORCO') proximo = meta.pagReforco;
        else if(decisao.trilha === 'DESAFIO') proximo = meta.pagDesafio;

        aba.getRange(i+1, idxRota+1).setValue(proximo);
        // atualiza "Tópico Atual"
        aba.getRange(i+1, idxTopico+1).setValue(proximo);
        return proximo;
      }

      // fallback
      return meta.nextTopico;
    }
  }
  return 'erro_numero.html';
}

/* ===========================
   Tópicos 01–05 (Quiz principal)
   =========================== */
function corrigirQuiz01(pacote){
  return _corrigirComFuzzy(pacote, ['c','d','a','c','c'], {
    colQuiz:'T01', colNota:'T01_Nota', colReforco:'T01R', colDesafio:'T01D',
    likertDif:'T01_Dif', likertAutoC:'T01_AutoC',
    colTrilha:'T01_Trilha', colScore:'T01_Score', colRota:'T01_Rota',
    nextTopico:'topico02.html', pagReforco:'reforco01.html', pagDesafio:'desafio01.html'
  });
}
function corrigirQuiz02(pacote){
  return _corrigirComFuzzy(pacote, ['b','c','d','b','b'], {
    colQuiz:'T02', colNota:'T02_Nota', colReforco:'T02R', colDesafio:'T02D',
    likertDif:'T02_Dif', likertAutoC:'T02_AutoC',
    colTrilha:'T02_Trilha', colScore:'T02_Score', colRota:'T02_Rota',
    nextTopico:'topico03.html', pagReforco:'reforco02.html', pagDesafio:'desafio02.html'
  });
}
function corrigirQuiz03(pacote){
  return _corrigirComFuzzy(pacote, ['b','a','a','c','b'], {
    colQuiz:'T03', colNota:'T03_Nota', colReforco:'T03R', colDesafio:'T03D',
    likertDif:'T03_Dif', likertAutoC:'T03_AutoC',
    colTrilha:'T03_Trilha', colScore:'T03_Score', colRota:'T03_Rota',
    nextTopico:'topico04.html', pagReforco:'reforco03.html', pagDesafio:'desafio03.html'
  });
}
function corrigirQuiz04(pacote){
  return _corrigirComFuzzy(pacote, ['c','b','a','a','b'], {
    colQuiz:'T04', colNota:'T04_Nota', colReforco:'T04R', colDesafio:'T04D',
    likertDif:'T04_Dif', likertAutoC:'T04_AutoC',
    colTrilha:'T04_Trilha', colScore:'T04_Score', colRota:'T04_Rota',
    nextTopico:'topico05.html', pagReforco:'reforco04.html', pagDesafio:'desafio04.html'
  });
}
function corrigirQuiz05(pacote){
  return _corrigirComFuzzy(pacote, ['b','d','c','b','b'], {
    colQuiz:'T05', colNota:'T05_Nota', colReforco:'T05R', colDesafio:'T05D',
    likertDif:'T05_Dif', likertAutoC:'T05_AutoC',
    colTrilha:'T05_Trilha', colScore:'T05_Score', colRota:'T05_Rota',
    nextTopico:'avaliacaofinal.html', pagReforco:'reforco05.html', pagDesafio:'desafio05.html'
  });
}

/* ===========================
   Reforços (mantidos)
   =========================== */
function _corrigirReforcoGenerico(pacote, gabarito, colR, proxima){
  const codigo = pacote[0];
  const respostas = pacote.slice(1);
  let acertos = 0;
  for(let i=0;i<gabarito.length;i++){ if(respostas[i] === gabarito[i]) acertos++; }

  let {aba, dados, cab} = getDados();
  ({aba, dados, cab} = ensureCols(cab, ['Código','Tópico Atual', colR]));
  const idxCodigo = colIndex(cab, 'Código');
  const idxTopico = colIndex(cab, 'Tópico Atual');
  const idxCol    = colIndex(cab, colR);

  for(let i=1;i<dados.length;i++){
    if(String(dados[i][idxCodigo]) === String(codigo)){
      if(idxCol !== -1) aba.getRange(i+1, idxCol+1).setValue(acertos);
      aba.getRange(i+1, idxTopico+1).setValue(proxima);
      return proxima;
    }
  }
  return 'erro_numero.html';
}
function corrigirReforco01(pacote){ return _corrigirReforcoGenerico(pacote, ['a','c','d'], 'T01R', 'topico02.html'); }
function corrigirReforco02(pacote){ return _corrigirReforcoGenerico(pacote, ['c','b','a'], 'T02R', 'topico03.html'); }
function corrigirReforco03(pacote){ return _corrigirReforcoGenerico(pacote, ['b','d','c'], 'T03R', 'topico04.html'); }
function corrigirReforco04(pacote){ return _corrigirReforcoGenerico(pacote, ['c','b','a'], 'T04R', 'topico05.html'); }
function corrigirReforco05(pacote){ return _corrigirReforcoGenerico(pacote, ['c','b','c'], 'T05R', 'avaliacaofinal.html'); }

/* ===========================
   Desafios 01–05 (mantidos)
   =========================== */
function _corrigirDesafio(pacote, correta, colD, proxima){
  const codigo = pacote[0];
  const resp = (pacote[1] || '').toString();
  const acertos = resp === correta ? 1 : 0;

  let {aba, dados, cab} = getDados();
  ({aba, dados, cab} = ensureCols(cab, ['Código','Tópico Atual', colD]));
  const idxCodigo = colIndex(cab, 'Código');
  const idxTopico = colIndex(cab, 'Tópico Atual');
  const idxCol    = colIndex(cab, colD);

  for(let i=1;i<dados.length;i++){
    if(String(dados[i][idxCodigo]) === String(codigo)){
      if(idxCol !== -1) aba.getRange(i+1, idxCol+1).setValue(acertos);
      aba.getRange(i+1, idxTopico+1).setValue(proxima);
      return proxima;
    }
  }
  return 'erro_numero.html';
}
function corrigirDesafio01(pacote){ return _corrigirDesafio(pacote, 'c', 'T01D', 'topico02.html'); }
function corrigirDesafio02(pacote){ return _corrigirDesafio(pacote, 'd', 'T02D', 'topico03.html'); }
function corrigirDesafio03(pacote){ return _corrigirDesafio(pacote, 'a', 'T03D', 'topico04.html'); }
function corrigirDesafio04(pacote){ return _corrigirDesafio(pacote, 'c', 'T04D', 'topico05.html'); }
function corrigirDesafio05(pacote){ return _corrigirDesafio(pacote, 'b', 'T05D', 'avaliacaofinal.html'); }