# Documentacao — Camada de API e Logica de Conversao

> **Teammate 1 — "API & Logica"**
> Projeto AGES (PUCRS) — Conversor de cambio USD/BRL

---

## Indice

1. [Conceitos-chave](#1-conceitos-chave)
2. [Decisoes tecnicas](#2-decisoes-tecnicas)
3. [Melhores praticas aplicadas](#3-melhores-praticas-aplicadas)
4. [Tutorial passo a passo](#4-tutorial-passo-a-passo)
5. [Glossario](#5-glossario)

---

## 1. Conceitos-chave

Antes de olhar qualquer linha de codigo, vamos entender os conceitos que sustentam tudo. Se voce ja conhece algum, pode pular, mas vale revisar.

### 1.1 O que e uma API?

**Analogia do restaurante:** Imagine que voce esta num restaurante. Voce (o cliente) quer comida (dados), mas nao pode entrar na cozinha (o servidor). O garcom (a API) leva seu pedido ate a cozinha e traz o prato pronto.

Uma **API** (Application Programming Interface) e exatamente isso: um intermediario que permite que dois sistemas se comuniquem. No nosso caso:

- **Cliente** = nosso site rodando no navegador
- **Garcom (API)** = o endereco `https://economia.awesomeapi.com.br/...`
- **Cozinha (Servidor)** = os servidores da AwesomeAPI que consultam cotacoes

Uma **API REST** segue um conjunto de regras (convencoes) sobre como fazer esses pedidos. A principal: usamos URLs (enderecos) para identificar os "recursos" que queremos.

**Referencia:** [MDN — Introduction to web APIs](https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Client-side_web_APIs/Introduction)

---

### 1.2 O que e JSON?

JSON (JavaScript Object Notation) e o "idioma" que o garcom fala. Quando a API responde, ela manda os dados neste formato:

```json
{
  "USDBRL": {
    "code": "USD",
    "codein": "BRL",
    "name": "Dolar Americano/Real Brasileiro",
    "high": "5.2341",
    "low": "5.1890",
    "bid": "5.2100",
    "ask": "5.2150",
    "varBid": "0.0230",
    "pctChange": "0.44",
    "timestamp": "1711900200"
  }
}
```

Como ler:
- `{ }` = objeto (como um formulario com campos)
- `"campo": "valor"` = cada dado tem um nome e um valor
- Objetos podem conter outros objetos (como caixas dentro de caixas)
- `bid` = preco de compra, `ask` = preco de venda

**Referencia:** [MDN — Working with JSON](https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/Objects/JSON)

---

### 1.3 Metodos HTTP — O que e GET?

Quando o navegador faz uma requisicao, ele precisa dizer **o que quer fazer**. Os metodos HTTP mais comuns:

| Metodo | Significado | Analogia |
|--------|-------------|----------|
| **GET** | "Me da esses dados" | Pedir o cardapio |
| POST | "Aqui, guarda esses dados" | Fazer um pedido |
| PUT | "Atualiza esses dados" | Mudar o pedido |
| DELETE | "Remove esses dados" | Cancelar o pedido |

No nosso projeto, so usamos **GET** — queremos *ler* a cotacao, nao criar nem alterar nada.

**Referencia:** [MDN — HTTP request methods](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Methods)

---

### 1.4 Status codes HTTP

Quando o servidor responde, ele inclui um codigo numerico dizendo como foi:

| Codigo | Significado | Analogia |
|--------|-------------|----------|
| **200** | OK — deu tudo certo | Pedido entregue na mesa |
| **404** | Nao encontrado | "Esse prato nao existe no cardapio" |
| **429** | Muitas requisicoes | "Calma, voce ja pediu demais" |
| **500** | Erro interno do servidor | "A cozinha pegou fogo" |
| **503** | Servico indisponivel | "Estamos fechados para reforma" |

No nosso `api.js`, verificamos se o status e 200 (`resposta.ok`) e tratamos os outros com mensagens amigaveis.

**Referencia:** [MDN — HTTP response status codes](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status)

---

### 1.5 async/await e Promises

**Analogia do delivery:** Quando voce pede comida por aplicativo, voce nao fica parado na porta esperando. Voce faz outras coisas e, quando o entregador chega, voce vai buscar.

Uma **Promise** e exatamente essa "promessa" de que um valor vai chegar no futuro. O `fetch()` retorna uma Promise.

**Sem async/await** (usando `.then()`):
```javascript
fetch(url)
  .then(resposta => resposta.json())
  .then(dados => {
    // usar dados
  })
  .catch(erro => {
    // tratar erro
  });
```

**Com async/await** (o que usamos):
```javascript
async function buscarDados() {
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();
    // usar dados
  } catch (erro) {
    // tratar erro
  }
}
```

O `await` e como dizer "espera esse delivery chegar antes de continuar". O codigo fica parecendo sincrono (linha a linha), mas por baixo dos panos continua nao-bloqueante.

**Importante:** `await` so pode ser usado dentro de funcoes marcadas como `async`.

**Referencia:** [MDN — async function](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/async_function)

---

### 1.6 Fetch API

`fetch()` e a funcao nativa do navegador para fazer requisicoes HTTP. Nao precisa instalar nada.

```javascript
const resposta = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
```

O que acontece:
1. O navegador faz um GET para a URL
2. Retorna um objeto `Response`
3. Usamos `resposta.json()` para extrair o corpo como JSON
4. `resposta.ok` e `true` se o status foi 200-299

**Referencia:** [MDN — Fetch API](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch)

---

### 1.7 Tratamento de erros — try/catch

Coisas podem dar errado:
- A internet cai
- O servidor esta fora do ar
- A resposta vem num formato inesperado

O `try/catch` e nosso "plano B":

```javascript
try {
  // tenta fazer algo arriscado
  const resposta = await fetch(url);
} catch (erro) {
  // se deu errado, cai aqui
  console.error('Deu ruim:', erro.message);
}
```

No nosso `api.js`, temos tratamento em **camadas**:
1. Erro de rede (fetch falha)
2. Erro de status (servidor respondeu com erro)
3. Erro de parsing (JSON invalido)
4. Erro de estrutura (JSON veio sem os campos esperados)

**Referencia:** [MDN — try...catch](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/try...catch)

---

### 1.8 Debounce

**Analogia do elevador:** Um elevador nao fecha a porta no instante que alguem entra. Ele espera alguns segundos. Se outra pessoa entra, o timer reinicia. So quando ninguem entra por X segundos, a porta fecha.

Debounce faz a mesma coisa com funcoes. Se o usuario digita "1000" num campo de texto, sem debounce teriamos:

- Tecla "1" → converte 1
- Tecla "0" → converte 10
- Tecla "0" → converte 100
- Tecla "0" → converte 1000

Sao 4 conversoes, mas so a ultima importa. Com debounce de 300ms:

- Tecla "1" → inicia timer de 300ms
- Tecla "0" (100ms depois) → cancela timer, inicia novo
- Tecla "0" (100ms depois) → cancela timer, inicia novo
- Tecla "0" (100ms depois) → cancela timer, inicia novo
- 300ms sem digitar → **agora sim, converte 1000**

Uma conversao em vez de quatro. Se cada conversao chamasse a API, economizariamos 3 requisicoes.

**Referencia:** [CSS-Tricks — Debouncing and Throttling Explained](https://css-tricks.com/debouncing-throttling-explained-examples/)

---

## 2. Decisoes tecnicas

Para cada escolha no projeto, explicamos **o que foi escolhido**, **as alternativas** e **por que esta e melhor neste contexto**.

---

### 2.1 fetch() nativo vs axios

| Criterio | fetch() (escolhido) | axios |
|----------|---------------------|-------|
| Instalacao | Nenhuma — ja vem no navegador | Precisa instalar via npm ou CDN |
| Tamanho | 0 KB | ~13 KB minificado |
| Funcionalidades | Basico, suficiente para GET | Interceptors, timeout nativo, etc. |
| Complexidade | Simples | Mais features, mais complexidade |

**Decisao:** fetch() nativo.

**Por que:** O projeto e frontend puro sem dependencias. Precisamos apenas de GET simples. Adicionar axios seria carregar 13 KB de codigo para algo que o navegador ja faz nativamente. Em projetos maiores com muitas chamadas de API, axios pode valer a pena, mas aqui seria exagero (over-engineering).

---

### 2.2 async/await vs .then().catch()

```javascript
// Opcao A — .then().catch()
fetch(url)
  .then(r => r.json())
  .then(dados => usarDados(dados))
  .catch(e => tratarErro(e));

// Opcao B — async/await (escolhido)
const r = await fetch(url);
const dados = await r.json();
```

**Decisao:** async/await.

**Por que:** Legibilidade. O codigo com async/await se le de cima para baixo, como um texto normal. Com `.then()`, a logica se encadeia e fica mais dificil de acompanhar, especialmente quando ha tratamento de erro em multiplas etapas (como no nosso `api.js`). Para quem esta aprendendo, async/await e muito mais intuitivo.

---

### 2.3 Modulos separados vs arquivo unico

| Abordagem | Arquivos | Problema |
|-----------|----------|----------|
| Arquivo unico | `script.js` (tudo junto) | 500+ linhas, dificil achar coisas, dificil testar |
| **Modulos separados** | `api.js`, `converter.js`, `utils.js` | Cada arquivo com responsabilidade clara |

**Decisao:** Tres modulos separados.

**Por que:** Separation of Concerns (Separacao de Responsabilidades). Cada arquivo cuida de uma coisa:

- `api.js` — fala com o mundo externo (rede)
- `converter.js` — faz contas (logica de negocio)
- `utils.js` — formata coisas (apresentacao)

Se a API mudar, mexemos so no `api.js`. Se a regra de conversao mudar, mexemos so no `converter.js`. Ninguem precisa entender o projeto inteiro para fazer uma alteracao pontual.

---

### 2.4 debounce vs throttle

| Tecnica | Comportamento | Melhor para |
|---------|---------------|-------------|
| **Debounce** | Espera o usuario parar | Campos de busca, inputs de texto |
| Throttle | Executa no maximo 1x a cada N ms | Scroll, resize |

**Decisao:** Debounce.

**Por que:** No nosso caso, o usuario digita um valor e queremos converter so quando ele terminar. Se usassemos throttle, poderiamos converter com um valor incompleto (ex: "10" quando ele ia digitar "1000"). Debounce garante que so converte apos o usuario parar de digitar.

---

### 2.5 Funcoes puras vs funcoes com side effects

Uma **funcao pura**:
- Sempre retorna o mesmo resultado para os mesmos argumentos
- Nao modifica nada fora dela (DOM, variaveis globais, etc.)

```javascript
// Pura — mesmo input, mesmo output, sem efeitos colaterais
function converterUSDparaBRL(valor, cotacao) {
  return valor * cotacao.bid;
}

// Impura — depende de estado externo, modifica o DOM
function converter() {
  const valor = document.getElementById('input').value;  // le do DOM
  const resultado = valor * cotacaoGlobal;                // usa variavel global
  document.getElementById('output').textContent = resultado; // escreve no DOM
}
```

**Decisao:** Funcoes puras em `converter.js` e `utils.js`.

**Por que:**
- **Testabilidade:** Funcoes puras sao triviais de testar — passe argumentos, verifique o retorno.
- **Previsibilidade:** Sem surpresas. O resultado depende so dos argumentos.
- **Reusabilidade:** Podem ser usadas em qualquer contexto, nao so no nosso HTML.
- A unica parte "impura" (que faz I/O) e o `fetch()` no `api.js`, e isso e inevitavel.

---

## 3. Melhores praticas aplicadas

### 3.1 Separacao de responsabilidades

```
js/
  api.js        → Comunicacao com API externa
  converter.js  → Logica de conversao (matematica)
  utils.js      → Formatacao e utilitarios
```

**Anti-pattern (o que NAO fazer):**
```javascript
// Um arquivo gigante que faz TUDO
async function fazerTudo() {
  const resp = await fetch(url);         // API
  const dados = await resp.json();       // API
  const resultado = valor * dados.bid;   // Logica
  document.getElementById('x').textContent =
    'R$ ' + resultado.toFixed(2);        // Formatacao + DOM
}
```

Problema: se a API mudar, voce mexe no mesmo lugar que tem a logica de conversao e a formatacao. Qualquer mudanca pode quebrar tudo.

---

### 3.2 Funcoes puras

Exemplo do nosso codigo (`converter.js`):

```javascript
export function converterUSDparaBRL(valor, cotacao) {
  const valorValidado = validarValor(valor);
  validarCotacao(cotacao);
  const valorConvertido = valorValidado * cotacao.bid;
  return montarResultado({ ... });
}
```

Nao le do DOM, nao escreve no DOM, nao depende de variaveis globais. Recebe tudo que precisa por parametro, retorna o resultado.

**Anti-pattern:**
```javascript
let cotacaoAtual; // variavel global — qualquer coisa pode mudar

function converter() {
  const input = document.querySelector('#valor');  // acoplado ao HTML
  return input.value * cotacaoAtual;               // depende de global
}
```

---

### 3.3 Tratamento de erros em camadas

No `api.js`, cada tipo de falha tem seu proprio tratamento:

```javascript
// Camada 1: erro de rede
try {
  resposta = await fetch(URL_COTACAO);
} catch (erro) {
  throw new Error('Sem conexao com a internet...');
}

// Camada 2: erro de status HTTP
if (!resposta.ok) {
  throw new Error(mensagensPorStatus[resposta.status] || 'Erro generico');
}

// Camada 3: erro de parsing JSON
try {
  dados = await resposta.json();
} catch {
  throw new Error('Resposta inesperada do servidor...');
}

// Camada 4: dados incompletos
if (!dados.USDBRL || !dados.BRLUSD) {
  throw new Error('Dados esperados nao encontrados...');
}
```

**Anti-pattern:**
```javascript
// Um try/catch gigante que engole todos os erros
try {
  const r = await fetch(url);
  const d = await r.json();
  return d.USDBRL.bid;
} catch (e) {
  alert('Erro!'); // mensagem inutil, impossivel saber o que aconteceu
}
```

---

### 3.4 Early returns

No `converter.js`, a validacao vem **antes** da logica principal:

```javascript
function validarValor(valor) {
  if (valor === undefined) throw new Error('Informe um valor');
  if (isNaN(valor))        throw new Error('Nao e numero');
  if (valor < 0)           throw new Error('Nao pode ser negativo');
  if (valor === 0)         return 0;  // retorna cedo, sem continuar
  return valor;
}
```

**Anti-pattern:**
```javascript
function converter(valor, cotacao) {
  if (valor !== undefined) {
    if (!isNaN(valor)) {
      if (valor >= 0) {
        if (cotacao) {
          // logica real enterrada em 4 niveis de if
          return valor * cotacao.bid;
        }
      }
    }
  }
}
```

A versao com early return e plana e legivel. A versao aninhada forma uma "piramide da morte" (pyramid of doom).

---

### 3.5 Nomes descritivos em portugues

```javascript
// Bom — quem le entende imediatamente
function converterUSDparaBRL(valor, cotacao) { ... }
function formatarMoeda(valor, moeda) { ... }
function validarValor(valor) { ... }

// Ruim — abreviacoes cripticas
function conv(v, c) { ... }
function fmt(v, m) { ... }
function val(v) { ... }
```

Nomes descritivos custam zero em performance (o minificador encurta em producao) e poupam horas de confusao.

---

## 4. Tutorial passo a passo

> "Se voce fosse comecar do zero, faria assim:"

### Passo 1: Entender a API

Antes de escrever codigo, abra o navegador e acesse diretamente:

```
https://economia.awesomeapi.com.br/last/USD-BRL
```

Voce vera algo como:

```json
{
  "USDBRL": {
    "code": "USD",
    "codein": "BRL",
    "name": "Dolar Americano/Real Brasileiro",
    "high": "5.2341",
    "low": "5.1890",
    "bid": "5.2100",
    "ask": "5.2150",
    "varBid": "0.0230",
    "pctChange": "0.44",
    "timestamp": "1711900200",
    "create_date": "2024-03-31 15:30:00"
  }
}
```

**O que cada campo significa:**
- `bid` = preco de compra (o mercado paga isso por 1 USD)
- `ask` = preco de venda (voce paga isso por 1 USD)
- `high` = maior cotacao do dia
- `low` = menor cotacao do dia
- `varBid` = quanto subiu/desceu em reais hoje
- `pctChange` = quanto subiu/desceu em porcentagem hoje
- `timestamp` = quando a cotacao foi registrada (Unix timestamp)

**Dica:** Instale a extensao "JSON Viewer" no Chrome para ver o JSON formatado e colorido no navegador.

---

### Passo 2: Primeiro fetch no console

Abra o DevTools (F12) e va na aba **Console**. Cole:

```javascript
fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
  .then(r => r.json())
  .then(d => console.log(d));
```

**Resultado esperado:** Um objeto com a chave `USDBRL` contendo os dados da cotacao.

**Erros comuns:**
- Se der `TypeError: Failed to fetch` → pode ser CORS ou falta de internet
- Se o JSON estiver estranho → a API pode estar em manutencao

Tambem va na aba **Network**, filtre por "Fetch/XHR" e repita o comando. Voce vera a requisicao, o status (200), e a resposta completa.

---

### Passo 3: Criar api.js com fetch basico

Crie o arquivo `js/api.js` com a versao mais simples possivel:

```javascript
const URL_COTACAO = 'https://economia.awesomeapi.com.br/last/USD-BRL,BRL-USD';

export async function fetchCotacao() {
  const resposta = await fetch(URL_COTACAO);
  const dados = await resposta.json();
  return dados;
}
```

Para testar, crie um HTML temporario:

```html
<script type="module">
  import { fetchCotacao } from './js/api.js';
  const dados = await fetchCotacao();
  console.log(dados);
</script>
```

**Resultado esperado:** No console, o objeto completo da API.

**Erros comuns:**
- `Uncaught SyntaxError: Cannot use import statement` → esqueceu o `type="module"` no script
- O arquivo nao carrega → verifique o caminho relativo e se esta rodando com um servidor local (use a extensao Live Server do VS Code; abrir o HTML direto como arquivo nao funciona com modulos ES6)

---

### Passo 4: Adicionar tratamento de erros

Agora evolua o `api.js` com camadas de tratamento. A versao final esta no arquivo `js/api.js`, mas o raciocinio e:

1. **Envolver o fetch em try/catch** — pega erros de rede
2. **Verificar resposta.ok** — pega erros de status (404, 500, etc.)
3. **Envolver resposta.json() em try/catch** — pega JSON invalido
4. **Verificar campos esperados** — pega respostas incompletas

Para testar cada camada:
- **Erro de rede:** Desative o Wi-Fi e chame `fetchCotacao()`
- **Erro de status:** Mude a URL para uma invalida (ex: `/last/INVALIDO`)
- **Erro de JSON:** Nao da para simular facilmente, mas o tratamento esta la para seguranca

---

### Passo 5: Criar converter.js

O `converter.js` e pura matematica. Comece com o caso mais simples:

```javascript
export function converterUSDparaBRL(valor, cotacao) {
  return valor * cotacao.bid;
}
```

Teste no console:

```javascript
import { converterUSDparaBRL } from './js/converter.js';
const resultado = converterUSDparaBRL(100, { bid: 5.21 });
console.log(resultado); // 521
```

Depois, adicione validacoes (valor negativo, NaN, etc.) e enriqueca o retorno com detalhes da cotacao. A versao final esta em `js/converter.js`.

---

### Passo 6: Criar utils.js

As funcoes utilitarias podem ser testadas individualmente:

```javascript
import { formatarMoeda, formatarData, formatarVariacao } from './js/utils.js';

console.log(formatarMoeda(1234.5, 'BRL'));    // "R$ 1.234,50"
console.log(formatarMoeda(1234.5, 'USD'));    // "$ 1.234,50"
console.log(formatarData('1711900200'));       // "31/03/2024 as 14:30:00"
console.log(formatarVariacao(1.5));           // { texto: "↑ +1,50%", classe: "variacao-positiva" }
console.log(formatarVariacao(-0.3));          // { texto: "↓ -0,30%", classe: "variacao-negativa" }
```

O `debounce` precisa de um contexto interativo para testar:

```javascript
import { debounce } from './js/utils.js';

const logComDebounce = debounce((msg) => console.log(msg), 1000);

logComDebounce('a'); // nada acontece ainda
logComDebounce('b'); // cancela o anterior
logComDebounce('c'); // cancela o anterior
// Apos 1 segundo: imprime "c" (so o ultimo)
```

---

### Passo 7: Testar tudo junto

Agora juntamos as 3 camadas num teste integrado. No console ou em um script de teste:

```javascript
import { fetchCotacao } from './js/api.js';
import { converterUSDparaBRL, converterBRLparaUSD } from './js/converter.js';
import { formatarMoeda, formatarData, formatarVariacao } from './js/utils.js';

// 1. Buscar cotacao
const cotacoes = await fetchCotacao();
console.log('Cotacoes:', cotacoes);

// 2. Converter USD -> BRL
const resultadoUSD = converterUSDparaBRL(100, cotacoes.USDBRL);
console.log('100 USD =', formatarMoeda(resultadoUSD.valorConvertido, 'BRL'));

// 3. Converter BRL -> USD
const resultadoBRL = converterBRLparaUSD(500, cotacoes.USDBRL);
console.log('500 BRL =', formatarMoeda(resultadoBRL.valorConvertido, 'USD'));

// 4. Exibir detalhes
console.log('Atualizado em:', formatarData(cotacoes.USDBRL.timestamp));
console.log('Variacao:', formatarVariacao(cotacoes.USDBRL.pctChange));
```

**Resultado esperado:**
```
Cotacoes: { USDBRL: {...}, BRLUSD: {...} }
100 USD = R$ 521,00
500 BRL = $ 95,97
Atualizado em: 31/03/2026 as 15:30:00
Variacao: { texto: "↑ +0,44%", classe: "variacao-positiva" }
```

**Como testar no DevTools:**
1. Abra o site com Live Server
2. F12 → aba Console
3. Cole o codigo acima
4. Veja os resultados

**Na aba Network:**
1. F12 → aba Network
2. Filtre por "Fetch/XHR"
3. Recarregue a pagina
4. Clique na requisicao para a AwesomeAPI
5. Na aba "Response", voce ve o JSON bruto
6. Na aba "Headers", voce ve o status (200) e os headers

---

## 5. Glossario

| Termo | Definicao |
|-------|-----------|
| **API** | Interface de Programacao de Aplicacoes — contrato que permite dois sistemas se comunicarem |
| **ask** | Preco de venda — quanto o mercado cobra para vender a moeda |
| **async** | Palavra-chave que marca uma funcao como assincrona, permitindo uso de `await` dentro dela |
| **await** | Pausa a execucao da funcao ate que uma Promise seja resolvida |
| **bid** | Preco de compra — quanto o mercado paga para comprar a moeda |
| **callback** | Funcao passada como argumento para outra funcao, executada em momento posterior |
| **CORS** | Cross-Origin Resource Sharing — politica de seguranca que controla quais sites podem acessar uma API |
| **debounce** | Tecnica que adia execucao de funcao ate que chamadas consecutivas parem por um tempo |
| **DOM** | Document Object Model — representacao da pagina HTML como objetos JavaScript manipulaveis |
| **early return** | Padrao de retornar cedo de uma funcao quando condicoes nao sao atendidas, evitando aninhamento |
| **endpoint** | URL especifica de uma API que retorna um recurso (ex: `/last/USD-BRL`) |
| **ES6 modules** | Sistema nativo de modulos do JavaScript — `import`/`export` — carregado com `type="module"` |
| **fetch** | Funcao nativa do navegador para fazer requisicoes HTTP |
| **funcao pura** | Funcao que sempre retorna o mesmo resultado para os mesmos argumentos e nao causa efeitos colaterais |
| **GET** | Metodo HTTP usado para solicitar (ler) dados de um servidor |
| **high** | Maior cotacao da moeda registrada no dia |
| **HTTP** | HyperText Transfer Protocol — protocolo de comunicacao entre navegador e servidor |
| **Intl** | Objeto nativo do JavaScript para internacionalizacao (formatacao de numeros, datas, moedas por locale) |
| **JSON** | JavaScript Object Notation — formato leve de troca de dados entre sistemas |
| **low** | Menor cotacao da moeda registrada no dia |
| **modulo** | Arquivo JavaScript independente que exporta funcionalidades e importa de outros modulos |
| **over-engineering** | Adicionar complexidade desnecessaria para resolver um problema simples |
| **parseFloat** | Funcao que converte uma string em numero decimal (ponto flutuante) |
| **pctChange** | Variacao percentual da cotacao em relacao ao fechamento do dia anterior |
| **Promise** | Objeto que representa um valor que pode estar disponivel agora, no futuro, ou nunca |
| **REST** | Representational State Transfer — estilo de arquitetura para APIs web baseado em recursos e verbos HTTP |
| **Separation of Concerns** | Principio de design onde cada parte do sistema cuida de uma unica responsabilidade |
| **side effect** | Efeito colateral — qualquer alteracao de estado fora do escopo da funcao (DOM, rede, console, etc.) |
| **status code** | Codigo numerico na resposta HTTP indicando sucesso (2xx), erro do cliente (4xx) ou erro do servidor (5xx) |
| **throttle** | Tecnica que limita a frequencia maxima de execucao de uma funcao (ex: no maximo 1x por segundo) |
| **timestamp** | Numero representando um momento no tempo — geralmente segundos desde 01/01/1970 (Unix epoch) |
| **try/catch** | Estrutura para capturar e tratar erros em JavaScript |
| **TypeError** | Tipo de erro lancado quando um valor nao e do tipo esperado (comum em falhas de rede com fetch) |
| **URL** | Uniform Resource Locator — endereco que identifica um recurso na web |
| **varBid** | Variacao absoluta (em reais) do preco de compra em relacao ao fechamento anterior |
