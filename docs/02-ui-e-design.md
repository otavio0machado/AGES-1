# 02 — UI & Design: Guia Completo

> Documentação didática do frontend do conversor de câmbio USD ↔ BRL.
> Escrita para estudantes de 1º semestre da disciplina AGES (PUCRS).

---

## Sumário

1. [Conceitos-chave](#1-conceitos-chave)
2. [Decisões técnicas](#2-decisões-técnicas)
3. [Melhores práticas](#3-melhores-práticas)
4. [Tutorial passo a passo](#4-tutorial-passo-a-passo)
5. [Glossário](#5-glossário)

---

## 1. Conceitos-chave

### 1.1 HTML Semântico

**O que é:** usar as tags HTML corretas para descrever o **significado** do conteúdo, não apenas sua aparência.

**Analogia:** pense em um livro. Ele tem capa, índice, capítulos, parágrafos e rodapé. Cada parte tem uma função clara. HTML semântico é a mesma ideia: cada tag diz **o que** aquele conteúdo é.

**Por que importa:**

- **SEO**: mecanismos de busca entendem melhor a estrutura da página.
- **Acessibilidade**: leitores de tela usam as tags para navegar (pessoas cegas, por exemplo, podem pular direto para o `<main>`).
- **Manutenção**: outro programador lê `<header>` e sabe que é o cabeçalho, sem precisar adivinhar o que `<div class="topo-1">` significa.

**Exemplo ruim (div soup):**

```html
<div class="topo">
  <div class="titulo">Câmbio</div>
</div>
<div class="conteudo">
  <div class="formulario">...</div>
</div>
```

**Exemplo bom (semântico):**

```html
<header>
  <h1>Câmbio USD ↔ BRL</h1>
</header>
<main>
  <section class="conversor">...</section>
</main>
```

> **Link MDN:** [HTML elements reference](https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element)

---

### 1.2 Tags Semânticas Principais

| Tag         | Quando usar                                      |
| ----------- | ------------------------------------------------ |
| `<header>`  | Cabeçalho da página ou de uma seção              |
| `<main>`    | Conteúdo principal (só pode ter UM por página)    |
| `<section>` | Agrupamento temático de conteúdo relacionado      |
| `<footer>`  | Rodapé da página ou de uma seção                 |
| `<nav>`     | Navegação principal                              |
| `<article>` | Conteúdo independente que faz sentido sozinho     |
| `<aside>`   | Conteúdo relacionado mas secundário (sidebar)     |
| `<form>`    | Formulários de entrada de dados                  |

No nosso projeto usamos `<header>`, `<main>`, `<section>` e `<footer>` porque o conversor tem uma estrutura simples e linear.

---

### 1.3 Acessibilidade Web (ARIA)

**O que é:** ARIA (Accessible Rich Internet Applications) são atributos HTML que dão informações extras para tecnologias assistivas (leitores de tela, por exemplo).

**Analogia:** imagine um prédio. As rampas e elevadores são como ARIA — não mudam a aparência do prédio, mas permitem que todas as pessoas consigam usar.

**Atributos que usamos no projeto:**

- `aria-label="Conversor de câmbio"` — descreve o propósito de uma seção quando não há texto visível claro.
- `aria-live="polite"` — avisa o leitor de tela quando o conteúdo muda (resultado apareceu).
- `aria-live="assertive"` — avisa imediatamente (erro aconteceu).
- `role="status"` — indica que o elemento mostra status (loading).
- `aria-hidden="true"` — esconde elementos decorativos do leitor de tela (setas, ícones).

**Regra de ouro:** se um controle interativo não tem texto visível, ele PRECISA de um `aria-label`.

> **Link MDN:** [ARIA](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility/ARIA)

---

### 1.4 CSS Box Model

**O que é:** todo elemento HTML é uma "caixa" com 4 camadas:

```
┌─────────────── margin (espaço externo) ───────────────┐
│ ┌─────────── border (borda) ──────────────┐           │
│ │ ┌─────── padding (espaço interno) ────┐ │           │
│ │ │ ┌─── content (conteúdo real) ──────┐ │ │           │
│ │ │ │          Texto aqui              │ │ │           │
│ │ │ └─────────────────────────────────┘ │ │           │
│ │ └─────────────────────────────────────┘ │           │
│ └─────────────────────────────────────────┘           │
└───────────────────────────────────────────────────────┘
```

**Analogia:** uma caixa de presente. O presente é o **content**, o papel de seda ao redor é o **padding**, a caixa em si é a **border**, e a distância entre caixas na prateleira é a **margin**.

**Por que `box-sizing: border-box` é importante:**

Por padrão, se você diz `width: 200px` e adiciona `padding: 20px`, o elemento fica com 240px de largura total. Com `border-box`, os 200px já incluem o padding. Muito mais intuitivo.

> **Link MDN:** [Box Model](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model)

---

### 1.5 Flexbox

**O que é:** um sistema de layout CSS para organizar elementos em **uma direção** (linha ou coluna).

**Analogia:** uma estante de livros. Você pode alinhar os livros à esquerda, ao centro, distribuí-los igualmente, ou empilhá-los de cima para baixo.

**Quando usar:** quando você precisa alinhar itens em uma linha ou coluna — menus, barras de botões, centralizações simples.

**Propriedades principais:**

```css
.container {
  display: flex;            /* Ativa o flexbox */
  flex-direction: row;      /* row (padrão) ou column */
  justify-content: center;  /* Alinhamento no eixo principal */
  align-items: center;      /* Alinhamento no eixo cruzado */
  gap: 16px;                /* Espaço entre itens */
}
```

No projeto, usamos flexbox no toggle de direção (USD→BRL / BRL→USD), no loading state e no layout do body.

> **Link MDN:** [Flexbox](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_flexible_box_layout)

---

### 1.6 CSS Grid

**O que é:** um sistema de layout CSS para organizar elementos em **duas dimensões** (linhas E colunas ao mesmo tempo).

**Analogia:** uma planilha de Excel. Você define as linhas e colunas, e coloca cada elemento na célula desejada.

**Quando usar:** quando precisa de um layout em grid (grade), como os detalhes da cotação (compra, venda, máxima, mínima organizados em 2x3).

**Diferença para Flexbox:**

- **Flexbox** = uma direção (linha OU coluna)
- **Grid** = duas direções (linhas E colunas)

```css
.detalhes-cotacao {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 2 colunas iguais */
  gap: 8px;                        /* Espaço entre células */
}
```

> **Link MDN:** [CSS Grid](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_grid_layout)

---

### 1.7 CSS Custom Properties (Variáveis)

**O que é:** variáveis definidas no CSS que podem ser reutilizadas em qualquer lugar da folha de estilo.

**Analogia:** em vez de pintar cada parede da casa com o código exato da cor (#1B3A1A), você dá um nome para a cor ("verde principal") e usa esse nome em todos os cômodos. Se quiser mudar a cor, muda em um lugar só.

```css
:root {
  --verde-escuro: #1B3A1A;
}

.botao {
  background: var(--verde-escuro);
}
```

**Por que usar:** manutenibilidade. Se precisar mudar a paleta de cores do projeto inteiro, basta alterar os valores no `:root`.

> **Link MDN:** [Custom Properties](https://developer.mozilla.org/pt-BR/docs/Web/CSS/Using_CSS_custom_properties)

---

### 1.8 Media Queries

**O que é:** regras CSS que aplicam estilos diferentes dependendo do tamanho da tela (ou outras características do dispositivo).

**Analogia:** um guarda-roupa adaptável. Dependendo do clima (tela pequena, média ou grande), você veste uma roupa diferente.

**Mobile-first vs Desktop-first:**

| Abordagem     | Como funciona                                     |
| ------------- | ------------------------------------------------- |
| Mobile-first  | Estilo base é para celular; `min-width` amplia    |
| Desktop-first | Estilo base é para desktop; `max-width` reduz     |

Neste projeto usamos **mobile-first** porque a maioria dos acessos web hoje é mobile.

```css
/* Base: mobile */
.conversor { padding: 32px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .conversor { padding: 48px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { max-width: 720px; }
}
```

> **Link MDN:** [Media Queries](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_media_queries)

---

### 1.9 Reset CSS

**O que é:** um arquivo CSS que "zera" os estilos padrão dos navegadores, garantindo que todos comecem do mesmo ponto.

**Analogia:** antes de pintar uma parede, você lixa e passa massa corrida para que a superfície fique uniforme. O reset é a massa corrida do CSS.

**Por que usar:** cada navegador (Chrome, Firefox, Safari) aplica estilos padrão diferentes. Sem reset, um botão pode parecer diferente em cada navegador.

> **Link MDN:** Não há artigo específico, mas veja [Cascade and Inheritance](https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts)

---

### 1.10 Pseudo-elements (::before e ::after)

**O que é:** "elementos fantasma" que você cria via CSS, sem precisar de HTML extra. São usados para decoração.

**Analogia:** adesivos decorativos na parede. Não fazem parte da estrutura da casa (HTML), mas embelezam (CSS).

No projeto, usamos `::before` e `::after` para:

- Linhas decorativas douradas no header
- Borda dourada no topo do card do conversor
- Pattern sutil no fundo do card

```css
.site-header::before {
  content: '';
  display: block;
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #C4A962, transparent);
  margin: 0 auto 24px;
}
```

> **Link MDN:** [Pseudo-elements](https://developer.mozilla.org/pt-BR/docs/Web/CSS/Pseudo-elements)

---

### 1.11 Transições e Animações CSS

**Transição (`transition`):** mudança suave entre dois estados (ex: hover). Precisa de um gatilho.

**Animação (`animation` + `@keyframes`):** mudança que pode rodar sozinha, com vários passos, repetir, etc.

| Característica | `transition`           | `animation`                    |
| -------------- | ---------------------- | ------------------------------ |
| Gatilho        | Precisa (hover, focus) | Pode rodar automaticamente     |
| Estados        | Só 2 (início e fim)    | Vários (@keyframes)            |
| Repetição      | Não                    | Sim (infinite)                 |

No projeto:

- **Transições**: hover no botão, foco no input, troca do toggle.
- **Animações**: spinner de loading, fade-in do resultado, pulse no valor.

> **Link MDN:** [Transitions](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_transitions) | [Animations](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_animations)

---

### 1.12 Web Fonts e Fallbacks

**O que é:** o navegador usa as fontes disponíveis no sistema do usuário. Definimos uma lista (font stack) em ordem de preferência.

```css
font-family: Georgia, 'Times New Roman', Times, serif;
```

O navegador tenta Georgia; se não tiver, vai para Times New Roman; se não tiver, vai para a genérica `serif`.

No projeto usamos três font stacks:

1. **Serifada** (títulos): dá peso e tradição, como em jornais financeiros.
2. **Monospace** (valores numéricos): alinhamento perfeito de números, como num ticker de bolsa.
3. **Sans-serif** (texto geral): legibilidade moderna para corpo de texto.

> **Link MDN:** [font-family](https://developer.mozilla.org/pt-BR/docs/Web/CSS/font-family)

---

## 2. Decisões Técnicas

### 2.1 HTML semântico vs div soup

| Abordagem                 | Prós                               | Contras                          |
| ------------------------- | ---------------------------------- | -------------------------------- |
| **HTML semântico** (adotada) | SEO, acessibilidade, clareza    | Exige conhecer as tags           |
| div soup                  | "Funciona" visualmente             | Inacessível, difícil de manter   |

**Decisão:** HTML semântico. Um `<header>` comunica intenção melhor que `<div class="header">`.

### 2.2 CSS puro vs Tailwind/Bootstrap

| Abordagem               | Prós                                  | Contras                                |
| ------------------------ | ------------------------------------- | -------------------------------------- |
| **CSS puro** (adotada)   | Aprendizado real, zero dependências   | Mais código, mais tempo                |
| Tailwind/Bootstrap       | Rápido, consistente                   | Não ensina CSS, dependência externa    |

**Decisão:** CSS puro. O objetivo é **aprender**, não entregar rápido. Dominar CSS puro permite usar qualquer framework depois.

### 2.3 Mobile-first vs Desktop-first

| Abordagem                 | Prós                              | Contras                          |
| ------------------------- | --------------------------------- | -------------------------------- |
| **Mobile-first** (adotada)| Prioriza a maioria dos usuários   | Precisa pensar "do menor"        |
| Desktop-first             | Mais natural para quem desenvolve | Resulta em CSS mais pesado       |

**Decisão:** mobile-first. Mais de 60% do tráfego web é mobile. Começar pelo menor é mais eficiente.

### 2.4 CSS Custom Properties vs valores hardcoded

| Abordagem                        | Prós                          | Contras                |
| -------------------------------- | ----------------------------- | ---------------------- |
| **Custom Properties** (adotada)  | Manutenível, consistente      | Sintaxe um pouco maior |
| Valores hardcoded                | Simples de escrever           | Nightmare para manter  |

**Decisão:** variáveis CSS. Mudar `--verde-escuro` em um lugar atualiza o site inteiro.

### 2.5 Grid + Flexbox vs só Flexbox

| Abordagem                     | Prós                             | Contras                    |
| ----------------------------- | -------------------------------- | -------------------------- |
| **Grid + Flexbox** (adotada)  | Ferramenta certa para cada caso  | Precisa aprender os dois   |
| Só Flexbox                    | Mais simples                     | Hacks para layouts 2D      |

**Decisão:** cada um no lugar certo. Flexbox para alinhamentos 1D (toggle, botões), Grid para layouts 2D (detalhes da cotação).

### 2.6 Paleta inspirada na nota de $100

A escolha da paleta não foi arbitrária. A nota de $100 americana tem:

- **Verde escuro profundo** — confiança, tradição, finanças.
- **Creme/bege** — papel envelhecido, sofisticação.
- **Dourado** — valor, prestígio, detalhe refinado.

Isso cria uma identidade visual coerente e imediatamente associável a "dinheiro" e "câmbio".

### 2.7 Tipografia serifada + monospace

- **Serifada** para títulos: remete a jornais financeiros como Financial Times e Wall Street Journal.
- **Monospace** para valores: cada dígito ocupa o mesmo espaço, facilitando a leitura de números — como um terminal de cotações.
- **Sans-serif** para corpo: legibilidade moderna em telas.

### 2.8 Textura CSS vs imagem de textura

| Abordagem                 | Prós                                | Contras                     |
| ------------------------- | ----------------------------------- | --------------------------- |
| **Textura CSS** (adotada) | Zero requisições HTTP, leve, escala | Limitada em complexidade    |
| Imagem de textura         | Mais realista                       | +1 requisição, peso extra   |

**Decisão:** textura CSS com gradientes sobrepostos. Simula linen/papel sem nenhum arquivo extra.

---

## 3. Melhores Práticas

### 3.1 Organização do CSS

O arquivo `style.css` segue uma ordem lógica:

1. **Custom Properties** — variáveis globais
2. **Layout geral** — body, container
3. **Header**
4. **Componentes** — conversor, input, toggle, botão
5. **Resultado e estados** — resultado, loading, erro
6. **Footer**
7. **Responsividade** — media queries
8. **Animações**
9. **Utilidades** — classes auxiliares (sr-only, hidden)

**Por que essa ordem?** Porque segue o fluxo natural da página (de cima para baixo) e agrupa preocupações similares. Qualquer pessoa encontra o que precisa rapidamente.

**Anti-pattern:** jogar regras CSS em qualquer ordem. Resultado: arquivo caótico onde ninguém encontra nada.

### 3.2 Naming Convention

Usamos uma convenção inspirada no BEM (Block Element Modifier):

- **Bloco:** `.conversor`, `.resultado`, `.site-header`
- **Elemento:** `.conversor__input`, `.resultado__valor`
- **Modificador:** `.resultado--visivel`, `.erro--visivel`

```
.bloco__elemento--modificador
```

**Por que?** Classes descritivas evitam conflitos e tornam o CSS previsível. Olhando `.conversor__btn`, você sabe que é o botão dentro do conversor.

**Anti-pattern:** classes genéricas como `.btn1`, `.box`, `.red-thing`. Impossível saber o que são sem contexto.

### 3.3 Acessibilidade como padrão

- Todo input tem `<label>` associado.
- Elementos decorativos têm `aria-hidden="true"`.
- Áreas dinâmicas têm `aria-live` para anunciar mudanças.
- Cores têm contraste suficiente (verde escuro sobre creme passa WCAG AA).
- Foco visível para navegação por teclado (`:focus-visible`).
- `prefers-reduced-motion` desativa animações para quem precisa.

**Anti-pattern:** ignorar acessibilidade. Resultado: parte dos usuários simplesmente não consegue usar o site.

### 3.4 Performance CSS

- Seletores simples (classes, não seletores aninhados profundos).
- Custom properties evitam repetição de valores.
- Animações usam `transform` e `opacity` (propriedades que não causam reflow).
- Zero imagens externas — tudo é CSS.

**Anti-pattern:** seletores como `body > div.container > section:nth-child(2) > div > p`. Lento para o navegador resolver e impossível de manter.

---

## 4. Tutorial Passo a Passo

### Passo 1: Criar o reset.css

**O que fazer:** criar o arquivo `css/reset.css`.

**Por quê:** sem reset, cada navegador mostra a página de um jeito diferente. O reset garante uma base uniforme.

**Código essencial:**

```css
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
  padding: 0;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

input, button, textarea, select {
  font: inherit;
}
```

**Resultado esperado:** a página fica "limpa", sem margens ou estilos padrão do navegador.

**Erro comum:** esquecer de linkar o reset.css no HTML, ou linká-lo DEPOIS do style.css (a ordem importa).

---

### Passo 2: Definir as variáveis CSS

**O que fazer:** no início do `css/style.css`, declarar as custom properties no `:root`.

**Por quê:** centralizar cores, fontes e espaçamentos permite mudar o visual inteiro alterando poucas linhas.

```css
:root {
  --verde-escuro: #1B3A1A;
  --dourado: #C4A962;
  --creme: #F5F0E8;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: Consolas, 'Courier New', monospace;
}
```

**Resultado esperado:** nada visível ainda — as variáveis ficam "prontas para uso".

**Erro comum:** esquecer `var()` na hora de usar. Escrever `color: --verde-escuro;` em vez de `color: var(--verde-escuro);`.

---

### Passo 3: HTML básico com estrutura semântica

**O que fazer:** criar `index.html` com DOCTYPE, meta tags, e a estrutura `<header>`, `<main>`, `<footer>`.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Câmbio USD ↔ BRL | AGES PUCRS</title>
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header class="site-header">...</header>
  <main>...</main>
  <footer class="site-footer">...</footer>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

**Resultado esperado:** página com estrutura visível no DevTools (Elements tab), sem conteúdo estilizado ainda.

**Erro comum:** esquecer a meta viewport — o site fica minúsculo no celular.

---

### Passo 4: Layout geral (body, container)

**O que fazer:** estilizar o body com fundo texturizado e criar a classe `.container` centralizada.

```css
body {
  font-family: var(--font-sans);
  color: var(--texto-escuro);
  background-color: var(--creme);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 16px;
}
```

**Resultado esperado:** texto centralizado na tela com fundo creme.

**Erro comum:** esquecer `margin: 0 auto` no container — o conteúdo fica colado à esquerda.

**Dica DevTools:** abra o Chrome DevTools (F12), vá em Elements, e passe o mouse sobre o `.container` para ver o box model visualmente.

---

### Passo 5: Header

**O que fazer:** estilizar o título com fonte serifada e adicionar as linhas decorativas.

O título usa `font-family: var(--font-serif)` para dar a sensação de gravura/editorial. As linhas decorativas são feitas com pseudo-elements e gradientes lineares que vão de transparente para dourado e voltam — criando um efeito elegante de "fade nas pontas".

**Resultado esperado:** título grande, serifado, verde escuro, com linhas douradas acima e abaixo.

**Erro comum:** esquecer `content: ''` no pseudo-element — sem isso, ele simplesmente não aparece.

---

### Passo 6: Formulário de conversão

**O que fazer:** estilizar o card do conversor (input, toggle, botão).

Pontos importantes:

- O input usa `font-family: var(--font-mono)` e `text-align: right` para parecer um campo financeiro.
- O toggle de direção usa radio buttons invisíveis (`.sr-only`) + labels estilizados. Quando o radio está `:checked`, o label correspondente ganha fundo verde escuro.
- O botão tem estados: normal, hover, active, disabled, focus-visible.

**Resultado esperado:** card branco elevado com input grande, toggle funcional (clicável) e botão verde.

**Erro comum:** estilizar o radio button diretamente em vez de escondê-lo e estilizar o label. Radio buttons têm aparência nativa difícil de customizar.

**Dica DevTools:** use a aba "Styles" para testar cores e espaçamentos em tempo real. Alterações no DevTools não salvam no arquivo — é só para experimentar.

---

### Passo 7: Área de resultado

**O que fazer:** criar a seção de resultado com o valor convertido grande e os detalhes em grid.

O resultado começa com `opacity: 0`, `visibility: hidden` e `transform: translateY(16px)`. Quando o JS adiciona a classe `.resultado--visivel`, ele faz um fade-in com slide-up suave.

Os detalhes da cotação usam `display: grid` com `grid-template-columns: 1fr 1fr` (duas colunas iguais no mobile, três no desktop).

**Resultado esperado:** ao adicionar `.resultado--visivel` manualmente no DevTools, o resultado aparece com animação suave.

**Erro comum:** usar `display: none` para esconder e tentar animar. `display` não é animável! Use `opacity` + `visibility` + `transform`.

---

### Passo 8: Responsividade

**O que fazer:** adicionar media queries para tablet (768px+) e desktop (1024px+).

O que muda em cada breakpoint:

- **Mobile (base):** coluna única, padding menor, fonte menor.
- **Tablet (768px+):** título maior, padding maior, input maior.
- **Desktop (1024px+):** container mais largo, detalhes em grid 3 colunas.

**Dica DevTools:** no Chrome, clique no ícone de celular no DevTools (ou Ctrl+Shift+M) para testar responsividade. Arraste as bordas para ver os breakpoints em ação.

**Erro comum:** escrever `@media (max-width: 768px)` em mobile-first. Em mobile-first, usamos `min-width` — o estilo base é para mobile, e os media queries AMPLIAM para telas maiores.

---

### Passo 9: Animações

**O que fazer:** adicionar transições nos estados interativos e animações para o resultado.

Tipos de animação no projeto:

1. **Transições** (requerem gatilho): hover em botões, foco em inputs, troca de toggle.
2. **Keyframe animations**: spinner de loading (rotação infinita), fade-in dos detalhes com delay escalonado.

```css
/* Spinner: rotação contínua */
@keyframes spinner-rotacao {
  to { transform: rotate(360deg); }
}

.loading__spinner {
  animation: spinner-rotacao 0.7s linear infinite;
}
```

**Resultado esperado:** botão muda de cor suavemente no hover; resultado aparece com animação; spinner gira.

**Erro comum:** animar propriedades que causam reflow (width, height, margin). Prefira `transform` e `opacity` — são otimizadas pelo navegador.

---

### Passo 10: Acessibilidade

**O que fazer:** revisar o HTML e garantir que:

1. Todo `<input>` tem um `<label>` associado (via `for="id"`).
2. Fieldsets têm `<legend>` (mesmo que visualmente escondido com `.sr-only`).
3. Áreas que mudam dinamicamente têm `aria-live`.
4. Elementos decorativos têm `aria-hidden="true"`.
5. O foco é visível (`:focus-visible`).
6. Animações são desativadas para `prefers-reduced-motion`.

**Como testar:** use a extensão "axe DevTools" no Chrome para escanear problemas de acessibilidade automaticamente. Ou navegue pelo site usando apenas o teclado (Tab, Enter, Espaço).

**Erro comum:** remover o outline de foco (`outline: none`) sem substituir por outro indicador visual. Pessoas que navegam por teclado ficam perdidas.

---

## 5. Glossário

| Termo                   | Definição                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **ARIA**                | Accessible Rich Internet Applications. Conjunto de atributos HTML para melhorar acessibilidade.     |
| **BEM**                 | Block Element Modifier. Convenção de nomenclatura CSS (`.bloco__elemento--modificador`).             |
| **Border-box**          | Modelo de caixa onde width/height incluem padding e border.                                         |
| **Breakpoint**          | Ponto de largura da tela onde o layout muda (ex: 768px, 1024px).                                   |
| **CSS Grid**            | Sistema de layout bidimensional (linhas e colunas).                                                 |
| **CSS Reset**           | Arquivo que zera estilos padrão dos navegadores.                                                    |
| **Custom Properties**   | Variáveis CSS definidas com `--nome` e usadas com `var(--nome)`.                                    |
| **DevTools**            | Ferramentas de desenvolvedor embutidas no navegador (F12 no Chrome).                                |
| **Div soup**            | Anti-pattern: usar `<div>` para tudo, ignorando tags semânticas.                                    |
| **Fallback**            | Valor alternativo caso o principal não esteja disponível (ex: fontes).                              |
| **Flexbox**             | Sistema de layout unidimensional (linha ou coluna).                                                 |
| **Font stack**          | Lista de fontes em ordem de preferência: `Georgia, 'Times New Roman', serif`.                       |
| **Hover**               | Estado quando o cursor do mouse está sobre um elemento.                                             |
| **Keyframes**           | Regra CSS que define os passos de uma animação.                                                     |
| **Media query**         | Regra CSS condicional baseada em características do dispositivo (largura, preferências).             |
| **Mobile-first**        | Abordagem onde o CSS base é para mobile, expandindo com `min-width`.                                |
| **Monospace**           | Fonte onde cada caractere ocupa a mesma largura (ex: Consolas, Courier).                            |
| **Opacity**             | Propriedade CSS que controla a transparência (0 = invisível, 1 = opaco).                            |
| **Pseudo-element**      | Elemento criado via CSS (`::before`, `::after`) sem existir no HTML.                                |
| **Reflow**              | Recalculação do layout pelo navegador (custoso em performance).                                     |
| **Responsividade**      | Capacidade do site de se adaptar a diferentes tamanhos de tela.                                     |
| **Sans-serif**          | Fonte sem serifas (traços decorativos nas extremidades das letras).                                 |
| **Semântico**           | Que carrega significado. Tags semânticas descrevem o conteúdo, não a aparência.                     |
| **Serifada**            | Fonte com serifas (pequenos traços nas extremidades das letras). Ex: Georgia, Times.                |
| **Sombra (box-shadow)** | Efeito de sombra aplicado a um elemento CSS.                                                        |
| **Spinner**             | Indicador visual de carregamento (geralmente um círculo girando).                                   |
| **Toggle**              | Controle que alterna entre dois estados (ex: USD→BRL / BRL→USD).                                   |
| **Transform**           | Propriedade CSS que modifica posição/escala/rotação sem causar reflow.                              |
| **Transition**          | Mudança suave entre dois estados CSS, disparada por um evento (hover, focus).                       |
| **Viewport**            | Área visível da página no navegador do usuário.                                                     |
| **WCAG**                | Web Content Accessibility Guidelines. Diretrizes internacionais de acessibilidade web.              |

---

> **Dica final:** a melhor forma de aprender CSS é experimentando. Abra o DevTools, mude valores, quebre coisas, conserte. Cada erro ensina mais que ler 10 tutoriais.
