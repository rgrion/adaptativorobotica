/* ===========================
   UX (Likert 1..5) – salva ux1..ux7 na aba "respostas"
   =========================== */
function corrigirUX(pacote){
  // esperado: [codigo, ux1..ux7]  -> números 1..5
  const codigo = String(pacote[0] || '').trim();
  const valores = pacote.slice(1).map(v => Number(v) || 0); // [ux1..ux7]

  if (!/^\d{5}$/.test(codigo)) throw new Error('Código inválido.');

  let {aba, dados, cab} = getDados();
  ({aba, dados, cab} = ensureCols(cab, [
    'Código','ux1','ux2','ux3','ux4','ux5','ux6','ux7','Tópico Atual'
  ]));

  const idxCodigo = colIndex(cab,'Código');
  const idxTopico = colIndex(cab,'Tópico Atual');
  const idxsUX = ['ux1','ux2','ux3','ux4','ux5','ux6','ux7'].map(n=>colIndex(cab,n));

  // Atualiza linha existente
  for (let i=1; i<dados.length; i++){
    if (String(dados[i][idxCodigo]).trim() === codigo){
      // grava ux1..ux7
      for (let j=0; j<idxsUX.length; j++){
        if (idxsUX[j] !== -1){
          aba.getRange(i+1, idxsUX[j]+1).setValue(valores[j]);
        }
      }
      const proximo = 'finalagradecimento.html';
      if (idxTopico !== -1) aba.getRange(i+1, idxTopico+1).setValue(proximo);
      return proximo;
    }
  }

  // Se não encontrou o código, opcionalmente acrescenta linha:
  // (descomente se quiser permitir novo registro)
  /*
  const nova = new Array(cab.length).fill('');
  nova[idxCodigo] = codigo;
  for (let j=0; j<idxsUX.length; j++){
    if (idxsUX[j] !== -1) nova[idxsUX[j]] = valores[j];
  }
  if (idxTopico !== -1) nova[idxTopico] = 'finalagradecimento.html';
  aba.appendRow(nova);
  */
  return 'erro_numero.html';
}