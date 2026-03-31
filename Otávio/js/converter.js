export function converterUSDparaBRL(valor, cotacao) {
  const v = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(v) || v < 0) throw new Error('Valor invalido.');
  return { valorOriginal: v, valorConvertido: Math.round((v * cotacao.bid + Number.EPSILON) * 100) / 100, moedaOrigem: 'USD', moedaDestino: 'BRL' };
}

export function converterBRLparaUSD(valor, cotacao) {
  const v = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(v) || v < 0) throw new Error('Valor invalido.');
  return { valorOriginal: v, valorConvertido: Math.round((v / cotacao.ask + Number.EPSILON) * 100) / 100, moedaOrigem: 'BRL', moedaDestino: 'USD' };
}
