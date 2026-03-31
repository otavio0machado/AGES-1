import { fetchCotacao, fetchHistorico } from './api.js';
import { converterUSDparaBRL, converterBRLparaUSD } from './converter.js';

// DOM
const cotacaoValor = document.getElementById('cotacao-valor');
const detalheTurismo = document.getElementById('detalhe-turismo');
const detalheAsk = document.getElementById('detalhe-ask');
const detalheVar = document.getElementById('detalhe-var');
const cotacaoHora = document.getElementById('cotacao-hora');
const selectDe = document.getElementById('moeda-de');
const selectPara = document.getElementById('moeda-para');
const inputPrefix = document.getElementById('input-prefix');
const valorInput = document.getElementById('valor-input');
const btnConverter = document.getElementById('btn-converter');
const btnSwap = document.getElementById('btn-swap');
const resultadoSection = document.getElementById('resultado');
const resultadoTexto = document.getElementById('resultado-texto');
const resultadoCotacao = document.getElementById('resultado-cotacao');
const erroSection = document.getElementById('erro');
const erroMensagem = document.getElementById('erro-mensagem');
const loadingEl = document.getElementById('loading');
const graficoCanvas = document.getElementById('grafico-canvas');
const graficoTitulo = document.getElementById('grafico-titulo');
const graficoLoading = document.getElementById('grafico-loading');
const botoesDetalhe = document.querySelectorAll('.card-cotacao__detalhe');

let cotacoesCache = null;
let graficoAtivo = 'turismo'; // turismo | venda | variacao

const PREFIXOS = { BRL: 'R$', USD: '$' };

function formatarMoeda(valor, moeda) {
  const simbolo = moeda === 'BRL' ? 'R$' : '$';
  return `${simbolo} ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)}`;
}

function atualizarPrefix() {
  inputPrefix.textContent = PREFIXOS[selectDe.value];
}

function sincronizarSelects(mudou) {
  if (mudou === 'de') {
    selectPara.value = selectDe.value === 'BRL' ? 'USD' : 'BRL';
  } else {
    selectDe.value = selectPara.value === 'BRL' ? 'USD' : 'BRL';
  }
  atualizarPrefix();
}

function swapMoedas() {
  const temp = selectDe.value;
  selectDe.value = selectPara.value;
  selectPara.value = temp;
  atualizarPrefix();
}

function preencherDetalhes(usdbrl, usdbrlt) {
  // Turismo
  if (usdbrlt) {
    detalheTurismo.textContent = usdbrlt.bid.toFixed(4);
  } else {
    detalheTurismo.textContent = '--';
  }

  // Venda
  detalheAsk.textContent = usdbrl.ask.toFixed(4);

  // Variação
  const pct = usdbrl.pctChange;
  const sinal = pct > 0 ? '+' : '';
  detalheVar.textContent = `${sinal}${pct.toFixed(2)}%`;
  detalheVar.className = 'card-cotacao__detalhe-valor';
  if (pct > 0) detalheVar.classList.add('positivo');
  else if (pct < 0) detalheVar.classList.add('negativo');

  // Horário
  const data = new Date(Number(usdbrl.timestamp) * 1000);
  const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  cotacaoHora.textContent = `Atualizado em ${fmt.format(data)}`;
}

// ============================================
// GRÁFICO (Canvas puro)
// ============================================
function desenharGrafico(dados, campo, label) {
  const canvas = graficoCanvas;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = rect.height;

  ctx.clearRect(0, 0, W, H);

  if (!dados || dados.length < 2) {
    ctx.fillStyle = '#ACACAC';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dados indisponiveis', W / 2, H / 2);
    return;
  }

  const valores = dados.map(d => d[campo]);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;

  const padTop = 24;
  const padBottom = 32;
  const padLeft = 50;
  const padRight = 16;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBottom;

  // Grid horizontal
  const linhas = 4;
  ctx.strokeStyle = '#EFEFEF';
  ctx.lineWidth = 1;
  ctx.font = '10px SF Mono, Consolas, monospace';
  ctx.fillStyle = '#ACACAC';
  ctx.textAlign = 'right';
  for (let i = 0; i <= linhas; i++) {
    const y = padTop + (chartH / linhas) * i;
    const val = max - (range / linhas) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(W - padRight, y);
    ctx.stroke();
    ctx.fillText(val.toFixed(campo === 'pctChange' ? 2 : 4), padLeft - 6, y + 3);
  }

  // Labels de data no eixo X
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ACACAC';
  const labelInterval = Math.max(1, Math.floor(dados.length / 5));
  for (let i = 0; i < dados.length; i += labelInterval) {
    const x = padLeft + (i / (dados.length - 1)) * chartW;
    const d = new Date(Number(dados[i].timestamp) * 1000);
    const txt = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
    ctx.fillText(txt, x, H - 8);
  }

  // Área preenchida
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop + chartH);
  for (let i = 0; i < valores.length; i++) {
    const x = padLeft + (i / (valores.length - 1)) * chartW;
    const y = padTop + chartH - ((valores[i] - min) / range) * chartH;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(padLeft + chartW, padTop + chartH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(90, 143, 92, 0.08)';
  ctx.fill();

  // Linha do gráfico
  ctx.beginPath();
  for (let i = 0; i < valores.length; i++) {
    const x = padLeft + (i / (valores.length - 1)) * chartW;
    const y = padTop + chartH - ((valores[i] - min) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#2B4D2C';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Ponto final
  const lastX = padLeft + chartW;
  const lastY = padTop + chartH - ((valores[valores.length - 1] - min) / range) * chartH;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#2B4D2C';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

async function carregarGrafico(tipo) {
  graficoAtivo = tipo;
  graficoLoading.classList.remove('oculto');

  // Atualizar botão ativo
  botoesDetalhe.forEach(btn => {
    btn.classList.toggle('ativo', btn.dataset.tipo === tipo);
  });

  let par, campo, titulo;
  if (tipo === 'turismo') {
    par = 'USD-BRLT';
    campo = 'bid';
    titulo = 'Turismo - 30 dias';
  } else if (tipo === 'venda') {
    par = 'USD-BRL';
    campo = 'ask';
    titulo = 'Venda (USD/BRL) - 30 dias';
  } else {
    par = 'USD-BRL';
    campo = 'bid';
    titulo = 'Compra (USD/BRL) - 30 dias';
  }

  graficoTitulo.textContent = titulo;

  const dados = await fetchHistorico(par, 30);
  graficoLoading.classList.add('oculto');
  desenharGrafico(dados, campo, titulo);
}

// ============================================
// COTAÇÃO
// ============================================
async function atualizarCotacao() {
  try {
    cotacoesCache = await fetchCotacao();
    cotacaoValor.textContent = cotacoesCache.USDBRL.bid.toFixed(4);
    preencherDetalhes(cotacoesCache.USDBRL, cotacoesCache.USDBRLT);
    // Carregar gráfico padrão (turismo)
    carregarGrafico('turismo');
  } catch {
    cotacaoValor.textContent = '--';
  }
}

// ============================================
// CONVERSÃO
// ============================================
function exibirErro(msg) {
  erroMensagem.textContent = msg;
  erroSection.classList.add('erro--visivel');
  resultadoSection.classList.remove('resultado--visivel');
}

function esconderErro() {
  erroSection.classList.remove('erro--visivel');
}

function mostrarLoading(ativo) {
  loadingEl.classList.toggle('loading--visivel', ativo);
  btnConverter.disabled = ativo;
  btnConverter.querySelector('.btn-converter__text').textContent = ativo ? 'Consultando...' : 'Converter';
}

async function converter() {
  esconderErro();
  resultadoSection.classList.remove('resultado--visivel');

  const valorBruto = valorInput.value.trim().replace(',', '.');
  if (valorBruto === '') {
    exibirErro('Digite um valor para converter.');
    return;
  }

  const valorNumerico = Number(valorBruto);
  if (isNaN(valorNumerico) || valorNumerico < 0) {
    exibirErro('O valor informado nao e valido.');
    return;
  }

  mostrarLoading(true);

  try {
    cotacoesCache = await fetchCotacao();
    cotacaoValor.textContent = cotacoesCache.USDBRL.bid.toFixed(4);
    preencherDetalhes(cotacoesCache.USDBRL, cotacoesCache.USDBRLT);

    const de = selectDe.value;
    const para = selectPara.value;
    let resultado;

    if (de === 'USD' && para === 'BRL') {
      resultado = converterUSDparaBRL(valorNumerico, cotacoesCache.USDBRL);
    } else if (de === 'BRL' && para === 'USD') {
      resultado = converterBRLparaUSD(valorNumerico, cotacoesCache.USDBRL);
    } else {
      resultado = { valorOriginal: valorNumerico, valorConvertido: valorNumerico, moedaOrigem: de, moedaDestino: para };
    }

    const textoOrigem = formatarMoeda(resultado.valorOriginal, resultado.moedaOrigem);
    const textoDestino = formatarMoeda(resultado.valorConvertido, resultado.moedaDestino);

    resultadoTexto.innerHTML = `<span class="resultado__origem">${textoOrigem}</span> = <span class="resultado__destino">${textoDestino}</span>`;

    const taxa = de === 'USD' ? cotacoesCache.USDBRL.bid : cotacoesCache.USDBRL.ask;
    resultadoCotacao.textContent = `Taxa: 1 USD = ${taxa.toFixed(4)} BRL`;

    resultadoSection.classList.add('resultado--visivel');
  } catch (erro) {
    exibirErro(erro.message || 'Nao foi possivel realizar a conversao.');
  } finally {
    mostrarLoading(false);
  }
}

// ============================================
// EVENTOS
// ============================================
selectDe.addEventListener('change', () => sincronizarSelects('de'));
selectPara.addEventListener('change', () => sincronizarSelects('para'));
btnSwap.addEventListener('click', swapMoedas);
btnConverter.addEventListener('click', converter);
valorInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); converter(); }
});

// Clique nos detalhes abre gráfico correspondente
botoesDetalhe.forEach(btn => {
  btn.addEventListener('click', () => {
    carregarGrafico(btn.dataset.tipo);
  });
});

// Resize do gráfico
window.addEventListener('resize', () => {
  if (graficoAtivo) carregarGrafico(graficoAtivo);
});

// Inicializar
atualizarPrefix();
atualizarCotacao();
