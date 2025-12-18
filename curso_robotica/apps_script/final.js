/* ===========================
   Avaliação Final (10 questões)
   -> Pontuação Final = Prova Final (0..10)
   =========================== */
function corrigirAvaliacaoFinal(pacote){
  const codigo = String(pacote[0] || '').trim();
  const respostas = pacote.slice(1).map(r => String(r || '').toLowerCase());

  // Gabarito: 1)c 2)b 3)c 4)b 5)c 6)b 7)a 8)b 9)d 10)a
  const gabarito = ['c','b','c','b','c','b','a','b','d','a'];

  let acertos = 0; // 0..10
  for (let i=0; i<gabarito.length; i++){
    if (respostas[i] === gabarito[i]) acertos++;
  }

  let {aba, dados, cab} = getDados();
  ({aba, dados, cab} = ensureCols(cab, [
    'Código','Prova Final','Pontuação Final','Tópico Atual',
    // mantém colunas antigas se você usa em outros fluxos
    'T01','T01R','T02','T02R','T03','T03R','T04','T04R','T05','T05R'
  ]));

  const idxCodigo = colIndex(cab,'Código');
  const idxProva  = colIndex(cab,'Prova Final');
  const idxPontos = colIndex(cab,'Pontuação Final');
  const idxTopico = colIndex(cab,'Tópico Atual');

  for (let i=1; i<dados.length; i++){
    if (String(dados[i][idxCodigo]).trim() === codigo){
      // Prova Final = acertos (0..10)
      if (idxProva  !== -1) aba.getRange(i+1, idxProva +1).setValue(acertos);
      // Pontuação Final = acertos (0..10)  ✅ (agora igual à prova)
      if (idxPontos !== -1) aba.getRange(i+1, idxPontos+1).setValue(acertos);

      // guarda para a tela final
      CacheService.getScriptCache().put('ultimoCodigo', codigo, 60*60);

      // fluxo: avaliacaofinal -> ux -> finalagradecimento
      const proximo = 'ux.html';
      if (idxTopico !== -1) aba.getRange(i+1, idxTopico+1).setValue(proximo);
      return proximo;
    }
  }
  return 'erro_numero.html';
}

/* ===========================
   Resultado Final (0..10)
   =========================== */
function obterPontuacaoFinal(codigo){
  let {dados, cab} = getDados();
  const idxCodigo = colIndex(cab,'Código');
  const idxProva  = colIndex(cab,'Prova Final');
  const idxPontos = colIndex(cab,'Pontuação Final');

  if (!codigo){
    codigo = CacheService.getScriptCache().get('ultimoCodigo') || '';
  }
  if (!codigo) return 0;

  const codigoStr = String(codigo).trim();

  for (let i=1; i<dados.length; i++){
    if (String(dados[i][idxCodigo]).trim() === codigoStr){
      // Prioriza Prova Final; se vazio, usa Pontuação Final como fallback
      const prova  = Number(dados[i][idxProva])  || 0;
      const pontos = Number(dados[i][idxPontos]) || 0;
      return prova || pontos || 0; // 0..10
    }
  }
  return 0;
}