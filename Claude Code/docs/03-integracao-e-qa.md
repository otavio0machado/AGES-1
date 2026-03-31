# 03 — Integração, QA e Documentação da Camada Final

> **Teammate 3 — Integração, QA & Docs**
> Este documento mostra como ligar a camada de API com a interface, como pensar o estado da aplicação e como testar o resultado de forma organizada.

---

## Sumário

1. [Conceitos-chave](#1-conceitos-chave)
2. [Decisões técnicas](#2-decisões-técnicas)
3. [Melhores práticas aplicadas](#3-melhores-práticas-aplicadas)
4. [Tutorial passo a passo](#4-tutorial-passo-a-passo)
5. [Glossário](#5-glossário)

---

## 1. Conceitos-chave

Antes de conectar qualquer botão, input ou API, precisamos entender alguns conceitos fundamentais.

### 1.1 O que é o DOM?

DOM significa **Document Object Model**.

**Analogia:** imagine que o HTML é a planta baixa de uma casa. O DOM é a versão “viva” dessa planta dentro do navegador, onde cada porta, janela e parede virou um objeto manipulável.

Exemplo:

```html
<p id="mensagem">Olá</p>
```

No JavaScript:

```javascript
const mensagem = document.getElementById('mensagem');
mensagem.textContent = 'Olá, mundo!';
```

O navegador pega o elemento `<p>` e deixa você alterá-lo por código.

**Referência:** [MDN — Introdução ao DOM](https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model/Introduction)

---

### 1.2 O que são event listeners?

Um **event listener** é um “ouvinte” de eventos.

**Analogia:** pense em um interfone. Ele fica parado, mas quando alguém toca, ele reage. O `addEventListener()` faz a mesma coisa com a interface.

Exemplo:

```javascript
botao.addEventListener('click', () => {
  console.log('O botão foi clicado');
});
```

Eventos comuns no projeto:

- `submit` no formulário;
- `input` no campo numérico;
- `change` no seletor de direção;
- `online` na janela do navegador.

**Referência:** [MDN — EventTarget.addEventListener()](https://developer.mozilla.org/pt-BR/docs/Web/API/EventTarget/addEventListener)

---

### 1.3 Event delegation

Event delegation é uma técnica em que um elemento “pai” escuta eventos de elementos “filhos”.

**Analogia:** em vez de colocar um vigia em cada porta de um prédio, você coloca um vigia no hall principal e ele observa quem entrou por qualquer porta.

Neste projeto, não precisamos muito disso porque a interface é pequena e os elementos interativos principais são poucos. Mesmo assim, vale conhecer o conceito para projetos maiores.

**Quando usar:** listas dinâmicas, tabelas, menus com muitos itens, interfaces onde elementos são criados depois do carregamento inicial.

**Referência:** [MDN — Event bubbling](https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Scripting/Event_bubbling)

---

### 1.4 Estado da aplicação

Estado da aplicação é o conjunto de informações que define **como a interface deve estar agora**.

No nosso `app.js`, o estado inclui:

- as cotações mais recentes;
- o instante do último fetch;
- a sequência da requisição atual.

**Analogia:** pense em um placar esportivo. O placar na tela depende do estado atual do jogo: tempo, pontuação, jogador da vez. A interface mostra o que o estado diz.

No projeto, a tela muda dependendo de perguntas como:

- há valor digitado?
- existe uma requisição em andamento?
- já temos cotação válida?
- ocorreu um erro?

Se você não controla o estado com clareza, a interface começa a “mentir”: spinner preso, erro antigo aparecendo, resultado de uma requisição velha sobrescrevendo a nova etc.

---

### 1.5 Fluxo de dados

O fluxo de dados deste projeto é linear e fácil de visualizar:

```text
Usuário digita valor
        ↓
app.js captura o evento
        ↓
app.js pede dados ao api.js
        ↓
api.js consulta a AwesomeAPI
        ↓
converter.js calcula o resultado
        ↓
utils.js formata textos
        ↓
app.js atualiza o DOM
```

**Analogia:** é como uma linha de produção. Cada etapa faz uma parte do trabalho e passa adiante. Se cada etapa mistura funções demais, a fábrica vira bagunça.

---

### 1.6 Loading state

Loading state é o estado visual de “estou trabalhando nisso”.

**Analogia:** quando você pede um café em uma cafeteria, ver o barista preparando a bebida te tranquiliza. Se ninguém fala nada, você fica inseguro e pensa que seu pedido foi esquecido.

No nosso projeto, o loading state:

- mostra um spinner;
- desabilita temporariamente o botão;
- troca o texto do botão para “Consultando...”;
- marca o formulário com `aria-busy="true"`.

Isso melhora a experiência e reduz cliques repetidos.

---

### 1.7 Testes manuais

Teste manual é quando você mesmo executa cenários na interface para verificar se ela se comporta como esperado.

**Analogia:** antes de entregar um trabalho impresso, você lê página por página para ver se não faltou nada. Testar software também é isso: conferir o comportamento real, não só acreditar no código.

Neste projeto, os testes manuais são importantes porque:

- o sistema depende de interface visual;
- a API externa pode oscilar;
- o comportamento responsivo precisa ser visto, não só imaginado.

---

### 1.8 Acessibilidade web

Acessibilidade significa garantir que pessoas com diferentes necessidades consigam usar o sistema.

No contexto deste projeto, isso inclui:

- labels corretos em inputs;
- foco visível;
- navegação por teclado;
- mensagens com `aria-live`;
- contraste visual suficiente;
- respeito a `prefers-reduced-motion`.

**Analogia:** construir um site acessível é como projetar uma biblioteca com rampa, elevador, boa sinalização e corredores amplos. Mais pessoas conseguem usar com menos atrito.

**Referência:** [MDN — Acessibilidade](https://developer.mozilla.org/pt-BR/docs/Learn/Accessibility)

---

## 2. Decisões técnicas

### 2.1 `app.js` separado vs JavaScript inline no HTML

**Escolha:** usar um arquivo dedicado chamado `js/app.js`.

**Alternativa:** colocar toda a lógica dentro de `<script>` no `index.html`.

**Por que a escolha foi melhor aqui:**

- mantém o HTML focado em estrutura;
- facilita leitura e manutenção;
- deixa mais claro o papel de cada camada;
- reduz a chance de misturar DOM, fetch e cálculo no mesmo lugar.

**Resumo:** inline funciona para demos muito pequenas. Para um projeto acadêmico que quer ensinar organização, `app.js` separado é muito melhor.

---

### 2.2 Escutar o formulário com `submit` vs escutar só o clique do botão

**Escolha:** o formulário escuta `submit`.

**Alternativa:** ouvir apenas `click` no botão “Converter”.

**Por que a escolha foi melhor aqui:**

- permite converter ao apertar `Enter`;
- respeita o comportamento nativo de formulários;
- melhora a acessibilidade;
- centraliza a ação principal em um evento mais semântico.

**Resumo:** se existe um formulário, o evento natural dele é `submit`.

---

### 2.3 Atualização automática com `input` + debounce vs converter só no botão

**Escolha:** manter o botão e também converter automaticamente enquanto o usuário digita, com debounce.

**Alternativas:**

- converter apenas no clique;
- converter a cada tecla sem debounce.

**Por que a escolha foi melhor aqui:**

- o botão mantém um fluxo explícito e acessível;
- a atualização automática deixa a experiência mais fluida;
- o debounce evita requisições desnecessárias.

**Resumo:** ganhamos conforto sem sacrificar desempenho.

---

### 2.4 Cache curto de cotações vs novo fetch em toda ação

**Escolha:** guardar a cotação por alguns segundos (`CACHE_TTL_MS = 30000`).

**Alternativa:** sempre fazer um fetch novo a cada alteração.

**Por que a escolha foi melhor aqui:**

- evita repetição inútil de requests quando o usuário troca de direção logo após digitar;
- diminui carga sobre a API pública;
- mantém a sensação de dado recente.

**Importante:** isso não transforma o projeto em “tempo real streaming”. É apenas um cache curto para evitar desperdício.

---

### 2.5 Guardar a sequência da requisição vs confiar que a última resposta sempre chega por último

**Escolha:** usar um contador (`sequenciaRequisicao`) para ignorar respostas antigas.

**Alternativa:** simplesmente aceitar qualquer resposta que chegar.

**Por que a escolha foi melhor aqui:**

Imagine este cenário:

1. o usuário digita `1`;
2. uma requisição é enviada;
3. ele rapidamente muda para `100`;
4. uma nova requisição é enviada;
5. a resposta antiga chega depois da nova.

Se você não se protege, a tela pode mostrar o resultado velho por cima do novo.

Com o contador de sequência, o `app.js` sabe qual resposta ainda é válida.

---

### 2.6 Manipulação direta do DOM vs mini-framework reativo

**Escolha:** manipulação direta do DOM.

**Alternativas:** usar um mini-framework, criar um sistema de render, ou introduzir uma biblioteca reativa.

**Por que a escolha foi melhor aqui:**

- o objetivo da disciplina é aprender base;
- a interface é pequena e controlável;
- adicionar um framework aumentaria a complexidade sem necessidade;
- ver o DOM sendo atualizado manualmente é ótimo para aprendizado.

**Resumo:** para um projeto simples e didático, o DOM direto é mais transparente.

---

## 3. Melhores práticas aplicadas

### 3.1 Separação entre dados e apresentação

No `app.js`, a lógica ficou dividida em funções pequenas com responsabilidade clara:

- buscar e validar dados;
- decidir a direção da conversão;
- atualizar o resultado principal;
- atualizar detalhes da cotação;
- mostrar loading;
- mostrar erro.

**Anti-pattern:** uma função gigante chamada `converterTudo()` que busca API, faz conta, formata texto e escreve no DOM de uma vez.

Quando tudo fica misturado, qualquer ajuste vira um risco.

---

### 3.2 Nomes de handlers descritivos

Exemplos reais:

- `lidarComMudancaNoInput()`
- `lidarComMudancaNaDirecao()`
- `executarConversao()`
- `atualizarResultadoNaTela()`

Esses nomes explicam intenção.

**Anti-pattern:** nomes genéricos como `handle()`, `run()`, `doIt()`, `muda()`.

Código legível é código que explica o que está acontecendo sem exigir adivinhação.

---

### 3.3 Early return para estados simples

Exemplo:

```javascript
if (valorBruto === '') {
  limparEstadosVisuais();
  return;
}
```

Em vez de criar grandes blocos aninhados, o código sai cedo quando uma condição simples já resolve o problema.

**Benefício:** menos indentação, menos confusão, leitura mais reta.

---

### 3.4 Feedback visual em todas as etapas

O usuário recebe sinais claros de que o sistema está funcionando:

- spinner ao buscar cotação;
- botão desabilitado durante a requisição;
- animação suave quando o resultado chega;
- bloco de erro quando algo falha.

**Anti-pattern:** clicar em “Converter” e a tela não mudar em nada por 1 segundo. Isso parece travamento.

---

### 3.5 Falhas antigas não sobrescrevem o estado atual

O uso da `sequenciaRequisicao` evita um problema clássico de aplicações assíncronas: **corrida entre respostas**.

Esse tipo de cuidado costuma passar despercebido em projetos pequenos, mas é uma excelente prática de engenharia, porque mostra que a interface foi pensada para o comportamento real da rede, não para um mundo ideal.

---

### 3.6 Falha silenciosa apenas no pré-aquecimento

No início da página, o app tenta buscar a cotação uma vez para deixar a primeira conversão mais rápida.

Se essa tentativa falhar, o erro não é mostrado automaticamente. O usuário só recebe a mensagem quando realmente tenta converter.

**Por que isso é bom?**

Porque evita abrir o site já “gritando erro” antes de qualquer ação do usuário.

---

## 4. Tutorial passo a passo

### Passo 1: Mapear os elementos do HTML

O primeiro trabalho do `app.js` é encontrar os elementos com que ele vai conversar.

```javascript
const elementos = {
  form: document.getElementById('form-conversor'),
  input: document.getElementById('valor-input'),
  botao: document.getElementById('btn-converter'),
  loading: document.getElementById('loading'),
  resultado: document.getElementById('resultado'),
  erro: document.getElementById('erro'),
};
```

**O que fazer:** criar um objeto com todas as referências de DOM em um só lugar.

**Por que isso ajuda:** evita sair chamando `document.getElementById()` espalhado em 20 pontos diferentes.

**Resultado esperado:** o resto do código consegue usar `elementos.input`, `elementos.botao` e assim por diante.

**Erro comum:** buscar elementos antes de o HTML existir. Neste projeto isso é evitado porque o `<script type="module">` está no fim do `body`.

---

### Passo 2: Criar um estado mínimo da aplicação

```javascript
const estado = {
  cotacoes: null,
  ultimoFetch: 0,
  sequenciaRequisicao: 0,
};
```

**O que fazer:** guardar as informações que não pertencem ao HTML, mas que a interface precisa para funcionar.

**Por que isso importa:** sem um estado central, você começa a depender de “pistas” espalhadas na tela.

**Resultado esperado:** o app sabe se já tem cotação, se ela ainda é recente e qual requisição é a mais atual.

---

### Passo 3: Ler e validar a entrada do usuário

Antes de chamar a API, verifique se faz sentido continuar.

```javascript
function obterValorBruto() {
  return elementos.input.value.trim().replace(',', '.');
}

function validarEntradaAntesDoFetch(valorBruto) {
  const valorNumerico = Number(valorBruto);

  if (Number.isNaN(valorNumerico)) {
    throw new Error('O valor informado nao e um numero valido.');
  }
}
```

**O que fazer:** ler o valor, aceitar vírgula como decimal e rejeitar entradas inválidas.

**Por que isso é importante:** evita gastar request de rede quando o problema já está no input.

**Erros comuns:**

- esquecer de tratar string vazia;
- deixar passar número negativo;
- confiar só no `min="0"` do HTML e não validar no JavaScript.

---

### Passo 4: Criar funções pequenas para estados visuais

```javascript
function alternarLoading(ativo) {
  elementos.loading.classList.toggle('loading--visivel', ativo);
  elementos.botao.disabled = ativo;
}

function exibirErro(mensagem) {
  elementos.erroMensagem.textContent = mensagem;
  elementos.erro.classList.add('erro--visivel');
}
```

**O que fazer:** encapsular loading, erro e resultado em funções claras.

**Por que isso ajuda:** sempre que você precisar mostrar erro, chama `exibirErro()`. Sempre que precisar mostrar loading, chama `alternarLoading()`.

**Resultado esperado:** a interface fica consistente.

**Anti-pattern:** espalhar `classList.add()` e `textContent = ...` por todo o arquivo sem padrão nenhum.

---

### Passo 5: Buscar a cotação no momento certo

```javascript
async function obterCotacoesAtualizadas({ forcarAtualizacao = false } = {}) {
  const cotacoesAindaValidas =
    estado.cotacoes !== null && Date.now() - estado.ultimoFetch < 30000;

  if (!forcarAtualizacao && cotacoesAindaValidas) {
    return estado.cotacoes;
  }

  const cotacoes = await fetchCotacao();
  estado.cotacoes = cotacoes;
  estado.ultimoFetch = Date.now();
  return cotacoes;
}
```

**O que fazer:** centralizar a busca da API em uma única função de alto nível.

**Por que isso ajuda:** toda a política de cache e atualização fica em um lugar só.

**Resultado esperado:** o app usa dado recente sem bater na API sem necessidade.

---

### Passo 6: Montar a função principal de conversão

Esta é a função “orquestradora”:

```javascript
async function executarConversao() {
  const valorBruto = obterValorBruto();
  const direcaoSelecionada = obterDirecaoSelecionada();
  const cotacoes = await obterCotacoesAtualizadas();

  const resultado =
    direcaoSelecionada === 'BRL-USD'
      ? converterBRLparaUSD(valorBruto, cotacoes.USDBRL)
      : converterUSDparaBRL(valorBruto, cotacoes.USDBRL);

  atualizarResultadoNaTela(resultado, cotacoes.USDBRL);
}
```

**O que fazer:** orquestrar as etapas em ordem.

**Ordem correta:**

1. ler input;
2. validar;
3. buscar cotação;
4. calcular;
5. renderizar.

**Erro comum:** renderizar antes de terminar a requisição, ou misturar formatação com cálculo dentro da mesma linha.

---

### Passo 7: Proteger o app contra respostas antigas

```javascript
const sequenciaAtual = ++estado.sequenciaRequisicao;

const cotacoes = await obterCotacoesAtualizadas();

if (sequenciaAtual !== estado.sequenciaRequisicao) {
  return;
}
```

**O que fazer:** numerar a requisição atual e ignorar respostas atrasadas.

**Por que isso importa:** a rede não obedece a ordem em que o usuário digitou.

**Resultado esperado:** a interface mostra sempre a resposta mais recente.

---

### Passo 8: Conectar os eventos certos

```javascript
elementos.form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  executarConversao({ forcarAtualizacao: true });
});

elementos.input.addEventListener('input', lidarComMudancaNoInput);

elementos.radiosDirecao.forEach((radio) => {
  radio.addEventListener('change', lidarComMudancaNaDirecao);
});
```

**O que fazer:** decidir quem escuta o quê.

**Neste projeto:**

- `submit`: intenção explícita de converter;
- `input`: atualização automática com debounce;
- `change`: troca da direção da moeda.

**Erro comum:** colocar tudo em `click` e perder o comportamento nativo do formulário.

---

### Passo 9: Adicionar debounce no input

```javascript
const executarConversaoComDebounce = debounce(() => {
  executarConversao({ forcarAtualizacao: true });
}, 450);
```

**O que fazer:** envolver a chamada de conversão com debounce.

**Por que isso ajuda:** evita requisições em excesso enquanto a pessoa ainda está digitando.

**Resultado esperado:** experiência fluida e menos chamadas à API.

---

### Passo 10: Renderizar resultado e detalhes

Depois da conversão, o `app.js` precisa atualizar o HTML.

Exemplo simplificado:

```javascript
elementos.resultadoLabel.textContent = 'Conversao USD → BRL';
elementos.resultadoDescricao.textContent = '...';
elementos.detalheCompra.textContent = formatarMoeda(cotacao.bid, 'BRL');
elementos.detalheTimestamp.textContent = formatarData(cotacao.timestamp);
```

**O que fazer:** preencher cada área da interface com o dado certo.

**Boa prática:** separar “resultado principal” de “detalhes de cotação”.

**Resultado esperado:** a tela fica clara e organizada.

---

### Passo 11: Criar um checklist de testes manuais

Se você fosse testar este projeto de forma sistemática, faria algo assim:

| Cenário | Entrada | Resultado esperado |
|--------|---------|-------------------|
| USD → BRL | `100` | valor convertido em reais + detalhes da cotação |
| BRL → USD | `500` | valor convertido em dólares + detalhes |
| Valor zero | `0` | resultado `0,00` sem quebra |
| Valor negativo | `-10` | mensagem de erro clara |
| Valor inválido | letras ou formato quebrado | mensagem de erro clara |
| Sem internet | API indisponível | bloco de erro visível |
| Troca de direção | mudar USD→BRL para BRL→USD | resultado recalculado |
| Navegação por teclado | `Tab`, `Enter`, `Espaço` | fluxo utilizável sem mouse |
| Mobile | viewport estreito | layout sem estouro |

---

### Passo 12: Testar com DevTools

#### Para simular erro de rede

No Chrome:

1. Abra o DevTools (`F12`).
2. Vá à aba **Network**.
3. No seletor de throttling/rede, escolha **Offline**.
4. Tente converter um valor.

**Resultado esperado:** o bloco de erro deve aparecer com uma mensagem amigável.

#### Para debugar o JavaScript

Você pode usar:

```javascript
console.log({ valorBruto, direcaoSelecionada, cotacoes });
```

Ou colocar breakpoints na aba **Sources** do navegador.

---

### Passo 13: Validar acessibilidade

Checklist rápido:

1. Navegue só com `Tab`.
2. Confira se o foco visual aparece.
3. Use `Enter` para converter.
4. Verifique se o input possui label associado.
5. Confirme que áreas dinâmicas usam `aria-live`.
6. Rode uma extensão como **axe DevTools**.

**O que esperar:** ninguém deve ficar dependente exclusivamente de mouse ou visão perfeita para usar a aplicação.

---

### Passo 14: Resultados de QA executados neste projeto

Na consolidação final, os seguintes cenários foram validados em navegador automatizado:

- conversão desktop USD → BRL;
- conversão mobile BRL → USD;
- erro de rede simulado com bloqueio da AwesomeAPI.

Os screenshots gerados foram salvos em:

- `apresentacao/screenshots/site-desktop-usd-brl.png`
- `apresentacao/screenshots/site-mobile-brl-usd.png`
- `apresentacao/screenshots/site-erro-rede.png`

Esses arquivos servem como evidência visual do funcionamento da interface.

---

## 5. Glossário

| Termo | Definição |
|-------|-----------|
| **Acessibilidade** | Prática de tornar a interface utilizável por mais pessoas, incluindo quem usa tecnologias assistivas |
| **addEventListener** | Método do JavaScript usado para registrar uma função que reage a um evento |
| **aria-busy** | Atributo que informa a tecnologias assistivas que uma região ainda está sendo atualizada |
| **aria-live** | Atributo que avisa ao leitor de tela que um conteúdo pode mudar dinamicamente |
| **Cache** | Armazenamento temporário de dados para evitar trabalho repetido |
| **DOM** | Representação da página HTML como objetos que o JavaScript pode ler e modificar |
| **Event delegation** | Técnica em que um elemento pai escuta eventos disparados por filhos |
| **Event listener** | Função registrada para reagir a um evento |
| **Estado da aplicação** | Conjunto de dados que define como a interface deve estar em um dado momento |
| **Feedback visual** | Resposta visível da interface ao usuário, como spinner, animação ou mensagem |
| **Handler** | Função responsável por tratar um evento |
| **Loading state** | Estado visual que indica carregamento em andamento |
| **Network panel** | Aba do DevTools usada para inspecionar requisições HTTP |
| **Offline** | Modo de teste em que a rede é simulada como indisponível |
| **Race condition** | Situação em que duas operações assíncronas competem e podem gerar ordem inesperada |
| **Renderizar** | Atualizar o que aparece na tela com base em dados |
| **Responsividade** | Capacidade da interface de se adaptar a diferentes tamanhos de tela |
| **Sequência de requisição** | Número usado para identificar qual resposta ainda é a mais recente e válida |
| **submit** | Evento disparado quando um formulário é enviado |
| **Throttle** | Técnica que limita a frequência de uma execução |
| **Toggle** | Controle que alterna entre dois estados |

---

> Dica final: integrar um projeto pequeno com capricho ensina mais do que “dar um jeito de funcionar”. Quando você cuida de estado, feedback, acessibilidade e teste, o projeto deixa de ser só um exercício e começa a parecer software de verdade.
