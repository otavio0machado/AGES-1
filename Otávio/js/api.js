const URL_COTACAO = 'https://economia.awesomeapi.com.br/last/USD-BRL,BRL-USD,USD-BRLT';
const URL_HISTORICO = 'https://economia.awesomeapi.com.br/json/daily';

export async function fetchCotacao() {
  let resposta;

  try {
    resposta = await fetch(URL_COTACAO);
  } catch (erro) {
    if (erro instanceof TypeError) {
      throw new Error('Sem conexao com a internet. Verifique sua rede e tente novamente.');
    }
    throw new Error(`Erro inesperado ao conectar com o servico de cotacoes: ${erro.message}`);
  }

  if (!resposta.ok) {
    const mensagensPorStatus = {
      404: 'Servico de cotacoes nao encontrado.',
      429: 'Muitas requisicoes seguidas. Aguarde alguns segundos.',
      500: 'Servidor de cotacoes com problemas internos.',
      502: 'Servidor temporariamente indisponivel.',
      503: 'Servico em manutencao.',
    };
    throw new Error(mensagensPorStatus[resposta.status] || `Erro ao buscar cotacao (codigo ${resposta.status}).`);
  }

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    throw new Error('Resposta inesperada do servidor.');
  }

  if (!dados.USDBRL || !dados.BRLUSD) {
    throw new Error('Dados de cotacao USD/BRL nao encontrados.');
  }

  return {
    USDBRL: extrairDados(dados.USDBRL),
    BRLUSD: extrairDados(dados.BRLUSD),
    USDBRLT: dados.USDBRLT ? extrairDados(dados.USDBRLT) : null,
  };
}

export async function fetchHistorico(par, dias) {
  try {
    const resposta = await fetch(`${URL_HISTORICO}/${par}/${dias}`);
    if (!resposta.ok) return [];
    const dados = await resposta.json();
    return dados.map(d => ({
      bid: parseFloat(d.bid),
      ask: parseFloat(d.ask),
      high: parseFloat(d.high),
      low: parseFloat(d.low),
      timestamp: d.timestamp,
    })).reverse();
  } catch {
    return [];
  }
}

function extrairDados(c) {
  return {
    bid: parseFloat(c.bid),
    ask: parseFloat(c.ask),
    high: parseFloat(c.high),
    low: parseFloat(c.low),
    varBid: parseFloat(c.varBid),
    pctChange: parseFloat(c.pctChange),
    timestamp: c.timestamp,
    create_date: c.create_date,
  };
}
