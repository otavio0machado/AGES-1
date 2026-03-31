/**
 * utils.js — Funcoes utilitarias reutilizaveis
 *
 * Funcoes de formatacao e helpers que nao pertencem a nenhum
 * modulo de negocio especifico. Todas sao funcoes puras
 * (exceto debounce, que por natureza gerencia estado interno).
 */

/**
 * Formata um valor numerico como moeda (BRL ou USD).
 * Usa o padrao brasileiro: R$ 1.234,56 ou $ 1.234,56
 *
 * @param {number} valor - Valor numerico a formatar
 * @param {string} moeda - Codigo da moeda: 'BRL' ou 'USD'
 * @returns {string} Valor formatado com simbolo e separadores
 *
 * @example
 * formatarMoeda(1234.5, 'BRL')  // "R$ 1.234,50"
 * formatarMoeda(1234.5, 'USD')  // "$ 1.234,50"
 */
export function formatarMoeda(valor, moeda) {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return '—'; // Traco em dash indica valor indisponivel
  }

  const simbolo = moeda === 'BRL' ? 'R$' : '$';

  // Intl.NumberFormat faz o trabalho pesado de locale corretamente
  // Usamos pt-BR para ter separador de milhar com ponto e decimal com virgula
  const formatador = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${simbolo} ${formatador.format(valor)}`;
}

/**
 * Converte um timestamp Unix (em segundos) para data legivel em pt-BR.
 *
 * @param {string|number} timestamp - Timestamp Unix em segundos
 * @returns {string} Data formatada, ex: "31/03/2026 às 14:30:00"
 *
 * @example
 * formatarData('1711900200')  // "31/03/2024 às 15:30:00"
 */
export function formatarData(timestamp) {
  if (!timestamp) {
    return 'Data indisponivel';
  }

  // A API retorna timestamp como string — converter para numero
  const timestampNumero = Number(timestamp);

  if (isNaN(timestampNumero)) {
    return 'Data indisponivel';
  }

  // Date() espera milissegundos, a API envia segundos — multiplicar por 1000
  const data = new Date(timestampNumero * 1000);

  // Verificar se a data resultante eh valida
  if (isNaN(data.getTime())) {
    return 'Data indisponivel';
  }

  // Formatar no padrao brasileiro com Intl
  const formatadorData = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formatadorHora = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${formatadorData.format(data)} as ${formatadorHora.format(data)}`;
}

/**
 * Cria uma versao "debounced" de uma funcao.
 *
 * Debounce adia a execucao ate que o usuario pare de chamar por `delay` ms.
 * Analogia: um elevador so fecha a porta depois que ninguem entra por X segundos.
 * Se alguem entra, o timer reinicia.
 *
 * Util para campos de input — evita converter a cada tecla digitada,
 * esperando o usuario terminar de digitar.
 *
 * @param {Function} fn - Funcao a ser executada apos o delay
 * @param {number} delay - Tempo de espera em milissegundos (padrao: 300ms)
 * @returns {Function} Versao debounced da funcao original
 *
 * @example
 * const converterComDebounce = debounce(converter, 500);
 * inputElement.addEventListener('input', converterComDebounce);
 */
export function debounce(fn, delay = 300) {
  let timerId = null;

  return function (...argumentos) {
    // Se ja existe um timer pendente, cancelar (o "elevador reabre a porta")
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    // Iniciar novo timer — a funcao so executa se ninguem chamar de novo
    timerId = setTimeout(() => {
      fn.apply(this, argumentos);
      timerId = null;
    }, delay);
  };
}

/**
 * Formata a variacao percentual com indicador visual (seta e cor).
 * Retorna um objeto com o texto formatado e a classe CSS apropriada.
 *
 * @param {number} valor - Variacao percentual (ex: 1.23, -0.45)
 * @returns {Object} { texto: string, classe: string }
 *   - texto: ex: "↑ +1,23%" ou "↓ -0,45%" ou "→ 0,00%"
 *   - classe: "variacao-positiva", "variacao-negativa" ou "variacao-neutra"
 *
 * @example
 * formatarVariacao(1.5)   // { texto: "↑ +1,50%", classe: "variacao-positiva" }
 * formatarVariacao(-0.3)  // { texto: "↓ -0,30%", classe: "variacao-negativa" }
 * formatarVariacao(0)     // { texto: "→ 0,00%",  classe: "variacao-neutra" }
 */
export function formatarVariacao(valor) {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return { texto: '— %', classe: 'variacao-neutra' };
  }

  const formatador = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const valorFormatado = formatador.format(Math.abs(valor));

  if (valor > 0) {
    return {
      texto: `↑ +${valorFormatado}%`,
      classe: 'variacao-positiva',
    };
  }

  if (valor < 0) {
    return {
      texto: `↓ -${valorFormatado}%`,
      classe: 'variacao-negativa',
    };
  }

  // valor === 0
  return {
    texto: `→ ${valorFormatado}%`,
    classe: 'variacao-neutra',
  };
}
