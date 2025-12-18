/* ===========================
   Fuzzy — Funções básicas
   =========================== */
function tri(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  return (x < b) ? (x - a) / (b - a) : (c - x) / (c - b);
}
function trap(x, a, b, c, d) {
  // 1) plateau primeiro para cobrir limites inclusivos [b..c]
  if (x >= b && x <= c) return 1;
  // 2) fora do suporte
  if (x <= a || x >= d) return 0;
  // 3) rampas
  if (x > a && x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

// Entradas linguísticas (FAIXAS DOS ESPECIALISTAS — mantidas)
function fuzzificarNota(n) {
  return {
    baixa:  trap(n, 0, 0, 32, 36),   // LOW (a,b,c,d)
    media:  trap(n, 32, 38, 70, 75), // MED (a,b,c,d)
    alta:   trap(n, 60, 65, 100, 100) // HIGH (a,b,c,d)
  };
}
function fuzzificarDificuldadeLikert(d) { // 1..5 (5 = mais difícil)
  return {
    baixa: trap(d, 1, 1, 2, 2.5),
    media: tri(d, 2, 3, 4),
    alta:  trap(d, 3.5, 4.2, 5, 5)
  };
}
function fuzzificarAutoconf(c) { // 1..5 (5 = mais confiante)
  return {
    baixa: trap(c, 1, 1, 2, 2.5),
    media: tri(c, 2, 3, 4),
    alta:  trap(c, 3.5, 4.2, 5, 5)
  };
}

/* =========================================================
   Regras Mamdani — VERSÃO NOVA com boost para AVANÇADO
   (mantém as faixas; ajusta apenas a ponderação das regras)
   ========================================================= */
function inferirRegrasV2(N, D, C) {
  const AND = (a, b) => Math.min(a, b);
  const OR  = (a, b) => Math.max(a, b);
  const clamp01 = x => Math.max(0, Math.min(1, x));

  // --- Regras base (mantidas/compatíveis) ---
  // Reforço
  const rReforco1 = AND(D.alta, C.baixa);
  const rReforco2 = OR(N.baixa, AND(N.media, D.alta));

  // Regular (mais contido — sem C.alta & D.alta)
  const rRegular1 = AND(AND(N.media, D.media), C.media);
  const rRegular2 = AND(N.alta, AND(D.alta, C.baixa)); // evitar salto

  // Avançado (caminhos coerentes com especialistas)
  const rAvancado1 = AND(AND(N.alta, D.baixa), C.alta);
  const rAvancado2 = AND(AND(N.alta, D.baixa), C.media);
  const rAvancado3 = AND(AND(N.alta, D.media), C.alta);

  // --- Boost de AVANÇADO em caso "claro" (nota alta + dif. baixa) ---
  const casoClaro = clamp01(AND(N.alta, D.baixa)); // 0..1
  const boostAvancado = clamp01(0.25 * casoClaro + (N.alta > 0.8 ? 0.15 : 0));

  const baseAvancado = Math.max(rAvancado1, rAvancado2, rAvancado3);
  const avancado = clamp01(baseAvancado + boostAvancado); // cap em 1

  // --- Atenuação de REGULAR quando o caso de DESAFIO é claro ---
  const baseRegular = Math.max(rRegular1, rRegular2);
  const atenuacao = 0.4 * casoClaro; // até -40%
  const regular = clamp01(baseRegular * (1 - atenuacao));

  // Reforço (inalterado)
  const reforco = Math.max(rReforco1, rReforco2);

  // Logger.log({reforco, regular, avancado, baseAvancado, boostAvancado, casoClaro, N, D, C}); // debug opcional
  return { reforco, regular, avancado };
}

/* ===========================================
   Defuzzificação (centróide discreto) — mantida
   =========================================== */
function defuzzificar(saidas) {
  function muReforco(x){  return tri(x, 0,   0,   40); }   // pico ~0
  function muRegular(x){  return tri(x, 30,  50,  70); }   // pico 50
  function muAvancado(x){ return tri(x, 60, 100, 100); }   // pico ~100

  let num = 0, den = 0;
  for (let x = 0; x <= 100; x += 1) {
    const mu = Math.max(
      Math.min(saidas.reforco,  muReforco(x)),
      Math.min(saidas.regular,  muRegular(x)),
      Math.min(saidas.avancado, muAvancado(x))
    );
    num += x * mu;
    den += mu;
  }
  return den === 0 ? 50 : (num / den);
}

/* ==========================================================
   Orquestra a decisão fuzzy (usa explicitamente a versão V2)
   ========================================================== */
function decidirTrilhaFuzzy(nota, dificuldade, autoconf){
  const N = fuzzificarNota(nota);
  const D = fuzzificarDificuldadeLikert(dificuldade);
  const C = fuzzificarAutoconf(autoconf);

  // >>> garante uso da nova versão:
  const forcas = inferirRegrasV2(N, D, C);

  const score = defuzzificar(forcas); // 0..100

  let trilha = 'REGULAR';
  if (score < 33) trilha = 'REFORCO';
  else if (score >= 66) trilha = 'DESAFIO';

  return { trilha, score, forcas, N, D, C };
}

/* ===========================
   Debug rápido (rode no editor)
   =========================== */
function debugFuzzy() {
  const casos = [
    { nota: 100, dif: 1, auto: 5 },
    { nota: 90,  dif: 2, auto: 4 },
    { nota: 80,  dif: 3, auto: 3 },
    { nota: 70,  dif: 4, auto: 2 },    
    { nota: 60,  dif: 5, auto: 1 },
    { nota: 50,  dif: 1, auto: 5 },
    { nota: 40,  dif: 2, auto: 4 },
    { nota: 30,  dif: 3, auto: 3 },
    { nota: 30,  dif: 4, auto: 2 },
    { nota: 20,  dif: 5, auto: 1 },
    { nota: 10,  dif: 1, auto: 5 },
    { nota: 0,  dif: 2, auto: 1 },
  ];
  casos.forEach(c => {
    const r = decidirTrilhaFuzzy(c.nota, c.dif, c.auto);
    Logger.log(`nota=${c.nota} dif=${c.dif} auto=${c.auto} -> trilha=${r.trilha} score=${r.score.toFixed(1)}`);
  });
}
