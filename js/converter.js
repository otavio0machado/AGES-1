/**
 * converter.js — Funcoes de conversao de moedas
 *
 * Contem funcoes puras que recebem valor + cotacao e devolvem
 * o resultado completo da conversao. Nenhuma funcao aqui faz
 * chamadas de rede ou manipula o DOM.
 */

/**
 * Converte dolares americanos (USD) para reais brasileiros (BRL).
 * Usa o campo `bid` (preco de compra) da cotacao USD-BRL.
 *
 * Por que `bid`? Quando voce compra dolares, o mercado te vende pelo `ask`.
 * Quando voce vende dolares (converte pra real), o mercado te paga pelo `bid`.
 * Aqui estamos simulando "tenho USD, quero BRL" = mercado compra seus dolares = bid.
 *
 * @param {number} valor - Quantidade em dolares a converter
 * @param {Object} cotacao - Objeto de cotacao USDBRL retornado por fetchCotacao()
 * @returns {Object} Resultado completo da conversao
 * @throws {Error} Se o valor ou a cotacao forem invalidos
 */
export function converterUSDparaBRL(valor, cotacao) {
  // Validacoes com early return — falham rapido com mensagem clara
  const valorValidado = validarValor(valor);
  validarCotacao(cotacao);

  const valorConvertido = valorValidado * cotacao.bid;

  return montarResultado({
    valorOriginal: valorValidado,
    valorConvertido,
    moedaOrigem: 'USD',
    moedaDestino: 'BRL',
    cotacaoUsada: cotacao.bid,
    cotacao,
  });
}

/**
 * Converte reais brasileiros (BRL) para dolares americanos (USD).
 * Usa o campo `ask` (preco de venda) da cotacao USD-BRL, invertido.
 *
 * Por que `ask` invertido? O `ask` da USD-BRL diz "1 USD custa X BRL".
 * Para saber quantos USD valem 1 BRL, fazemos 1/ask.
 * Usamos `ask` (e nao `bid`) porque estamos comprando dolares = mercado vende = ask.
 *
 * @param {number} valor - Quantidade em reais a converter
 * @param {Object} cotacao - Objeto de cotacao USDBRL retornado por fetchCotacao()
 * @returns {Object} Resultado completo da conversao
 * @throws {Error} Se o valor ou a cotacao forem invalidos
 */
export function converterBRLparaUSD(valor, cotacao) {
  const valorValidado = validarValor(valor);
  validarCotacao(cotacao);

  // Divisao pelo ask: se 1 USD = 5.20 BRL (ask), entao 1 BRL = 1/5.20 USD
  const valorConvertido = valorValidado / cotacao.ask;

  return montarResultado({
    valorOriginal: valorValidado,
    valorConvertido,
    moedaOrigem: 'BRL',
    moedaDestino: 'USD',
    cotacaoUsada: cotacao.ask,
    cotacao,
  });
}

/**
 * Valida o valor de entrada para conversao.
 * Funcao pura — retorna o valor numerico limpo ou lanca erro.
 *
 * @param {*} valor - Valor a ser validado
 * @returns {number} Valor numerico validado
 * @throws {Error} Se o valor for invalido
 */
function validarValor(valor) {
  // Aceitar strings numericas (ex: "100.50" digitado pelo usuario)
  const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;

  if (valorNumerico === undefined || valorNumerico === null || valorNumerico === '') {
    throw new Error('Informe um valor para converter.');
  }

  if (typeof valorNumerico !== 'number' || isNaN(valorNumerico)) {
    throw new Error('O valor informado nao e um numero valido.');
  }

  if (valorNumerico < 0) {
    throw new Error('O valor nao pode ser negativo.');
  }

  if (valorNumerico === 0) {
    // Zero eh tecnicamente valido, mas retornamos logo — nada a converter
    return 0;
  }

  // Limite de seguranca para evitar numeros absurdos que quebram a formatacao
  if (valorNumerico > 999_999_999_999) {
    throw new Error('O valor maximo permitido e 999.999.999.999.');
  }

  return valorNumerico;
}

/**
 * Valida o objeto de cotacao recebido.
 *
 * @param {Object} cotacao - Objeto de cotacao a validar
 * @throws {Error} Se a cotacao nao tiver os campos necessarios
 */
function validarCotacao(cotacao) {
  if (!cotacao || typeof cotacao !== 'object') {
    throw new Error('Dados de cotacao indisponiveis. Atualize a pagina.');
  }

  // Verificar campos obrigatorios para a conversao funcionar
  if (typeof cotacao.bid !== 'number' || isNaN(cotacao.bid)) {
    throw new Error('Cotacao de compra (bid) invalida. Atualize a pagina.');
  }

  if (typeof cotacao.ask !== 'number' || isNaN(cotacao.ask)) {
    throw new Error('Cotacao de venda (ask) invalida. Atualize a pagina.');
  }

  // Cotacao zero ou negativa indicaria dados corrompidos
  if (cotacao.bid <= 0 || cotacao.ask <= 0) {
    throw new Error('Valores de cotacao invalidos (zero ou negativo). Tente novamente.');
  }
}

/**
 * Monta o objeto padrao de resultado da conversao.
 * Centraliza a criacao do resultado para garantir consistencia.
 *
 * @param {Object} params - Parametros da conversao
 * @returns {Object} Resultado formatado
 */
function montarResultado({ valorOriginal, valorConvertido, moedaOrigem, moedaDestino, cotacaoUsada, cotacao }) {
  return {
    valorOriginal,
    valorConvertido: arredondar(valorConvertido),
    moedaOrigem,
    moedaDestino,
    cotacaoUsada,
    detalhes: {
      high: cotacao.high,
      low: cotacao.low,
      varBid: cotacao.varBid,
      pctChange: cotacao.pctChange,
      timestamp: cotacao.timestamp,
    },
  };
}

/**
 * Arredonda para 2 casas decimais evitando problemas de ponto flutuante.
 * Ex: 0.1 + 0.2 = 0.30000000000000004 -> arredondar retorna 0.3
 *
 * @param {number} valor - Numero a arredondar
 * @returns {number} Numero com no maximo 2 casas decimais
 */
function arredondar(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}
