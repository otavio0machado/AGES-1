import { fetchCotacao } from './api.js';
import { converterBRLparaUSD, converterUSDparaBRL } from './converter.js';
import {
  debounce,
  formatarData,
  formatarMoeda,
  formatarVariacao,
} from './utils.js';

const CACHE_TTL_MS = 30_000;
const LIMITE_MAXIMO = 999_999_999_999;

const elementos = {
  form: document.getElementById('form-conversor'),
  input: document.getElementById('valor-input'),
  botao: document.getElementById('btn-converter'),
  loading: document.getElementById('loading'),
  resultado: document.getElementById('resultado'),
  resultadoLabel: document.getElementById('resultado-label'),
  resultadoValor: document.getElementById('resultado-valor'),
  resultadoMoeda: document.getElementById('resultado-moeda'),
  resultadoNumero: document.getElementById('resultado-numero'),
  resultadoDescricao: document.getElementById('resultado-descricao'),
  erro: document.getElementById('erro'),
  erroMensagem: document.getElementById('erro-mensagem'),
  detalheCompra: document.getElementById('detalhe-compra'),
  detalheVenda: document.getElementById('detalhe-venda'),
  detalheMaxima: document.getElementById('detalhe-maxima'),
  detalheMinima: document.getElementById('detalhe-minima'),
  detalheVariacao: document.getElementById('detalhe-variacao'),
  detalheTimestamp: document.getElementById('detalhe-timestamp'),
  radiosDirecao: Array.from(
    document.querySelectorAll('input[name="direcao"]')
  ),
};

const estado = {
  cotacoes: null,
  ultimoFetch: 0,
  sequenciaRequisicao: 0,
};

const textoOriginalBotao = elementos.botao.textContent.trim();

function obterDirecaoSelecionada() {
  return (
    document.querySelector('input[name="direcao"]:checked')?.value || 'USD-BRL'
  );
}

function obterValorBruto() {
  return elementos.input.value.trim().replace(',', '.');
}

function validarEntradaAntesDoFetch(valorBruto) {
  if (valorBruto === '') {
    return;
  }

  const valorNumerico = Number(valorBruto);

  if (Number.isNaN(valorNumerico)) {
    throw new Error('O valor informado nao e um numero valido.');
  }

  if (valorNumerico < 0) {
    throw new Error('O valor nao pode ser negativo.');
  }

  if (valorNumerico > LIMITE_MAXIMO) {
    throw new Error('O valor maximo permitido e 999.999.999.999.');
  }
}

function alternarLoading(ativo) {
  elementos.loading.classList.toggle('loading--visivel', ativo);
  elementos.botao.disabled = ativo;
  elementos.botao.textContent = ativo ? 'Consultando...' : textoOriginalBotao;
  elementos.form.setAttribute('aria-busy', String(ativo));
}

function exibirErro(mensagem) {
  elementos.erroMensagem.textContent = mensagem;
  elementos.erro.classList.add('erro--visivel');
}

function esconderErro() {
  elementos.erro.classList.remove('erro--visivel');
}

function exibirResultado() {
  elementos.resultado.classList.add('resultado--visivel');
}

function esconderResultado() {
  elementos.resultado.classList.remove('resultado--visivel');
}

function limparEstadosVisuais() {
  esconderErro();
  esconderResultado();
}

function preencherValorPrincipal(valor, moeda) {
  const valorFormatado = formatarMoeda(valor, moeda);
  const [simbolo = '', ...restante] = valorFormatado.split(' ');

  elementos.resultadoMoeda.textContent = simbolo;
  elementos.resultadoNumero.textContent = restante.join(' ');
}

function animarAtualizacaoResultado() {
  elementos.resultadoValor.classList.remove('resultado__valor--atualizando');

  requestAnimationFrame(() => {
    elementos.resultadoValor.classList.add('resultado__valor--atualizando');
  });
}

function aplicarClasseVariacao(classeDaUtilidade) {
  elementos.detalheVariacao.classList.remove(
    'detalhes-cotacao__valor--positivo',
    'detalhes-cotacao__valor--negativo'
  );

  if (classeDaUtilidade === 'variacao-positiva') {
    elementos.detalheVariacao.classList.add(
      'detalhes-cotacao__valor--positivo'
    );
  }

  if (classeDaUtilidade === 'variacao-negativa') {
    elementos.detalheVariacao.classList.add(
      'detalhes-cotacao__valor--negativo'
    );
  }
}

function montarDescricaoConversao(resultado, cotacaoDolar) {
  const valorOrigem = formatarMoeda(resultado.valorOriginal, resultado.moedaOrigem);
  const valorDestino = formatarMoeda(
    resultado.valorConvertido,
    resultado.moedaDestino
  );

  if (resultado.moedaOrigem === 'USD') {
    return `${valorOrigem} equivalem a ${valorDestino} com a compra do dolar em ${formatarMoeda(cotacaoDolar.bid, 'BRL')}.`;
  }

  return `${valorOrigem} equivalem a ${valorDestino} com a venda do dolar em ${formatarMoeda(cotacaoDolar.ask, 'BRL')}.`;
}

function atualizarDetalhesCotacao(cotacaoDolar) {
  const variacao = formatarVariacao(cotacaoDolar.pctChange);

  elementos.detalheCompra.textContent = formatarMoeda(cotacaoDolar.bid, 'BRL');
  elementos.detalheVenda.textContent = formatarMoeda(cotacaoDolar.ask, 'BRL');
  elementos.detalheMaxima.textContent = formatarMoeda(cotacaoDolar.high, 'BRL');
  elementos.detalheMinima.textContent = formatarMoeda(cotacaoDolar.low, 'BRL');
  elementos.detalheVariacao.textContent = variacao.texto;
  elementos.detalheTimestamp.textContent = formatarData(cotacaoDolar.timestamp);

  aplicarClasseVariacao(variacao.classe);
}

function atualizarResultadoNaTela(resultado, cotacaoDolar) {
  const textoDirecao = `${resultado.moedaOrigem} → ${resultado.moedaDestino}`;

  elementos.resultadoLabel.textContent = `Conversao ${textoDirecao}`;
  preencherValorPrincipal(resultado.valorConvertido, resultado.moedaDestino);
  elementos.resultadoDescricao.textContent = montarDescricaoConversao(
    resultado,
    cotacaoDolar
  );

  atualizarDetalhesCotacao(cotacaoDolar);
  exibirResultado();
  animarAtualizacaoResultado();
}

async function obterCotacoesAtualizadas({ forcarAtualizacao = false } = {}) {
  const cotacoesAindaValidas =
    estado.cotacoes !== null && Date.now() - estado.ultimoFetch < CACHE_TTL_MS;

  if (!forcarAtualizacao && cotacoesAindaValidas) {
    return estado.cotacoes;
  }

  const cotacoes = await fetchCotacao();

  estado.cotacoes = cotacoes;
  estado.ultimoFetch = Date.now();

  return cotacoes;
}

function converterComDirecao(valor, direcao, cotacoes) {
  if (direcao === 'BRL-USD') {
    return converterBRLparaUSD(valor, cotacoes.USDBRL);
  }

  return converterUSDparaBRL(valor, cotacoes.USDBRL);
}

async function executarConversao({ forcarAtualizacao = false } = {}) {
  const valorBruto = obterValorBruto();

  if (valorBruto === '') {
    estado.sequenciaRequisicao += 1;
    alternarLoading(false);
    limparEstadosVisuais();
    return;
  }

  try {
    validarEntradaAntesDoFetch(valorBruto);
  } catch (erro) {
    estado.sequenciaRequisicao += 1;
    alternarLoading(false);
    esconderResultado();
    exibirErro(erro.message);
    return;
  }

  const direcaoSelecionada = obterDirecaoSelecionada();
  const sequenciaAtual = ++estado.sequenciaRequisicao;

  esconderErro();
  alternarLoading(true);

  try {
    const cotacoes = await obterCotacoesAtualizadas({ forcarAtualizacao });

    if (sequenciaAtual !== estado.sequenciaRequisicao) {
      return;
    }

    const resultado = converterComDirecao(
      valorBruto,
      direcaoSelecionada,
      cotacoes
    );

    atualizarResultadoNaTela(resultado, cotacoes.USDBRL);
  } catch (erro) {
    if (sequenciaAtual !== estado.sequenciaRequisicao) {
      return;
    }

    esconderResultado();
    exibirErro(
      erro instanceof Error
        ? erro.message
        : 'Nao foi possivel concluir a conversao agora.'
    );
  } finally {
    if (sequenciaAtual === estado.sequenciaRequisicao) {
      alternarLoading(false);
    }
  }
}

const executarConversaoComDebounce = debounce(() => {
  executarConversao({ forcarAtualizacao: true });
}, 450);

function lidarComMudancaNoInput() {
  if (obterValorBruto() === '') {
    estado.sequenciaRequisicao += 1;
    alternarLoading(false);
    limparEstadosVisuais();
    return;
  }

  executarConversaoComDebounce();
}

function lidarComMudancaNaDirecao() {
  if (obterValorBruto() === '') {
    esconderErro();
    esconderResultado();
    return;
  }

  executarConversao();
}

async function preaquecerCotacoes() {
  try {
    await obterCotacoesAtualizadas();
  } catch {
    // Falha silenciosa: o usuario ainda pode tentar a conversao manualmente.
  }
}

function iniciarAplicacao() {
  elementos.form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    executarConversao({ forcarAtualizacao: true });
  });

  elementos.input.addEventListener('input', lidarComMudancaNoInput);

  elementos.radiosDirecao.forEach((radio) => {
    radio.addEventListener('change', lidarComMudancaNaDirecao);
  });

  window.addEventListener('online', () => {
    if (obterValorBruto() !== '') {
      executarConversao({ forcarAtualizacao: true });
    }
  });

  preaquecerCotacoes();
}

iniciarAplicacao();
