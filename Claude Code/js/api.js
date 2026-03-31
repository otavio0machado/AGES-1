/**
 * api.js — Modulo de consumo da AwesomeAPI de cotacoes
 *
 * Responsavel por buscar a cotacao USD/BRL em tempo real.
 * Toda comunicacao com servicos externos fica isolada aqui,
 * facilitando manutencao e testes.
 */

// URL base da AwesomeAPI — retorna USD->BRL e BRL->USD numa so chamada
const URL_COTACAO = 'https://economia.awesomeapi.com.br/last/USD-BRL,BRL-USD';

/**
 * Busca a cotacao atual do dolar (USD-BRL) e do real (BRL-USD).
 *
 * @returns {Promise<Object>} Objeto com as cotacoes limpas:
 *   {
 *     USDBRL: { bid, ask, high, low, varBid, pctChange, timestamp, create_date },
 *     BRLUSD: { bid, ask, high, low, varBid, pctChange, timestamp, create_date }
 *   }
 *
 * @throws {Error} Com mensagem amigavel em portugues caso algo de errado
 */
export async function fetchCotacao() {
  let resposta;

  // Primeiro passo: fazer a requisicao HTTP
  // O try/catch aqui pega erros de rede (offline, DNS, CORS, etc.)
  try {
    resposta = await fetch(URL_COTACAO);
  } catch (erro) {
    // TypeError eh o erro tipico quando o navegador nao consegue conectar
    if (erro instanceof TypeError) {
      throw new Error(
        'Sem conexao com a internet. Verifique sua rede e tente novamente.'
      );
    }
    // Qualquer outro erro inesperado no fetch
    throw new Error(
      `Erro inesperado ao conectar com o servico de cotacoes: ${erro.message}`
    );
  }

  // Segundo passo: verificar se o servidor respondeu com sucesso (status 200)
  if (!resposta.ok) {
    // Mensagens especificas para codigos comuns ajudam na depuracao
    const mensagensPorStatus = {
      404: 'Servico de cotacoes nao encontrado. A API pode ter mudado de endereco.',
      429: 'Muitas requisicoes seguidas. Aguarde alguns segundos e tente novamente.',
      500: 'O servidor de cotacoes esta com problemas internos. Tente mais tarde.',
      502: 'O servidor de cotacoes esta temporariamente indisponivel.',
      503: 'O servico de cotacoes esta em manutencao. Tente novamente em breve.',
    };

    const mensagem =
      mensagensPorStatus[resposta.status] ||
      `Erro ao buscar cotacao (codigo ${resposta.status}). Tente novamente.`;

    throw new Error(mensagem);
  }

  // Terceiro passo: interpretar o JSON da resposta
  let dados;
  try {
    dados = await resposta.json();
  } catch {
    // Se o servidor devolveu algo que nao eh JSON valido
    throw new Error(
      'Resposta inesperada do servidor. Os dados recebidos nao estao no formato correto.'
    );
  }

  // Quarto passo: validar a estrutura do JSON
  // A API retorna chaves como "USDBRL" e "BRLUSD" — precisamos garantir que existem
  if (!dados.USDBRL || !dados.BRLUSD) {
    throw new Error(
      'A resposta da API nao contem os dados esperados de cotacao USD/BRL.'
    );
  }

  // Quinto passo: extrair somente os campos que precisamos
  // Isso desacopla nosso app da estrutura exata da API
  return {
    USDBRL: extrairDadosCotacao(dados.USDBRL),
    BRLUSD: extrairDadosCotacao(dados.BRLUSD),
  };
}

/**
 * Extrai apenas os campos relevantes de um objeto de cotacao da API.
 * Funcao pura — recebe dados brutos, devolve dados limpos.
 *
 * @param {Object} cotacaoBruta - Objeto retornado pela AwesomeAPI
 * @returns {Object} Objeto com apenas os campos que usamos
 */
function extrairDadosCotacao(cotacaoBruta) {
  return {
    // bid = preco de compra (quanto o mercado PAGA pela moeda)
    bid: parseFloat(cotacaoBruta.bid),

    // ask = preco de venda (quanto o mercado COBRA pela moeda)
    ask: parseFloat(cotacaoBruta.ask),

    // high = maior cotacao do dia
    high: parseFloat(cotacaoBruta.high),

    // low = menor cotacao do dia
    low: parseFloat(cotacaoBruta.low),

    // varBid = variacao absoluta em relacao ao fechamento anterior
    varBid: parseFloat(cotacaoBruta.varBid),

    // pctChange = variacao percentual em relacao ao fechamento anterior
    pctChange: parseFloat(cotacaoBruta.pctChange),

    // timestamp = momento da cotacao em Unix (segundos desde 1970)
    timestamp: cotacaoBruta.timestamp,

    // create_date = data/hora de criacao no formato legivel da API
    create_date: cotacaoBruta.create_date,
  };
}
