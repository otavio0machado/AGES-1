# 00 — Visão Geral do Projeto

> Documento de entrada do projeto.
> Leia este arquivo primeiro para entender o contexto, o objetivo pedagógico e o mapa de leitura dos demais materiais.

---

## 1. O que é este projeto?

Este repositório contém um **site de conversão de câmbio USD ↔ BRL** feito para a disciplina **AGES (Agência Experimental de Engenharia de Software)** do curso de **Engenharia de Software da PUCRS**.

Em termos simples, o site permite:

- digitar um valor em dólar ou em real;
- escolher a direção da conversão;
- consultar a cotação atual na **AwesomeAPI**;
- exibir o valor convertido;
- mostrar detalhes da cotação usada;
- tratar erros de rede ou de resposta da API com mensagens claras.

O projeto foi construído com um objetivo pedagógico muito específico: **aprender a consumir APIs externas em um frontend puro**, sem frameworks e sem backend.

---

## 2. Objetivo pedagógico

Mais do que “fazer um site bonito”, este trabalho serve para treinar fundamentos que aparecem em quase todo projeto web moderno:

- consumo de API pública com `fetch()`;
- leitura e interpretação de JSON;
- programação assíncrona com `async/await`;
- manipulação do DOM;
- organização de código em módulos;
- acessibilidade e estrutura semântica;
- responsividade;
- documentação técnica voltada para aprendizado.

Em outras palavras: o projeto é pequeno o suficiente para caber em uma disciplina, mas rico o bastante para ensinar conceitos que continuam valendo em sistemas maiores.

---

## 3. Escopo funcional

O sistema entrega os seguintes comportamentos:

### Conversão principal

- USD → BRL
- BRL → USD

### Informações complementares

- cotação de compra (`bid`);
- cotação de venda (`ask`);
- máxima do dia (`high`);
- mínima do dia (`low`);
- variação percentual (`pctChange`);
- horário da última atualização (`timestamp`).

### Tratamento de erro

- internet offline;
- falha da AwesomeAPI;
- resposta fora do formato esperado;
- valor inválido digitado pelo usuário.

---

## 4. Arquitetura do sistema

O projeto segue uma separação simples e didática de responsabilidades:

```text
Usuário digita valor
        ↓
app.js escuta evento do formulário / input
        ↓
api.js busca cotação na AwesomeAPI
        ↓
converter.js calcula o valor convertido
        ↓
utils.js formata moeda, data e variação
        ↓
app.js atualiza o DOM no index.html
```

### Por que essa arquitetura é boa para um projeto acadêmico?

Porque cada arquivo responde a uma pergunta diferente:

- `api.js`: como falar com a API?
- `converter.js`: como fazer a conta da conversão?
- `utils.js`: como formatar o que será mostrado?
- `app.js`: como conectar dados e interface?
- `index.html` + `css/`: como a experiência aparece para o usuário?

Isso reduz confusão mental. Quando algo quebra, fica mais fácil saber **onde** procurar.

---

## 5. Estrutura de arquivos

```text
/
├── index.html
├── README.md
├── css/
│   ├── reset.css
│   └── style.css
├── js/
│   ├── api.js
│   ├── app.js
│   ├── converter.js
│   └── utils.js
├── docs/
│   ├── 00-visao-geral.md
│   ├── 01-api-e-logica.md
│   ├── 02-ui-e-design.md
│   └── 03-integracao-e-qa.md
└── apresentacao/
    ├── slides.pptx
    └── screenshots/
```

### Leitura humana da estrutura

- `index.html`: a página principal do site.
- `css/reset.css`: zera inconsistências entre navegadores.
- `css/style.css`: visual principal do projeto.
- `js/api.js`: fala com a AwesomeAPI.
- `js/converter.js`: contém as regras de conversão.
- `js/utils.js`: reúne funções utilitárias.
- `js/app.js`: liga interface, eventos, API e renderização.
- `docs/`: documentação didática completa.
- `apresentacao/`: materiais visuais para entrega/apresentação.

---

## 6. Como rodar o projeto localmente

Como o JavaScript foi organizado em **módulos ES**, o jeito mais seguro de abrir o projeto é com um servidor local.

### Opção 1 — Python (mais simples)

No terminal, dentro da pasta do projeto:

```bash
python3 -m http.server 4173
```

Depois abra no navegador:

```text
http://127.0.0.1:4173
```

### Opção 2 — Live Server no VS Code

1. Instale a extensão **Live Server**.
2. Clique com o botão direito em `index.html`.
3. Escolha **Open with Live Server**.

### O que esperar ao abrir

Você deve ver:

- um cabeçalho com “USD ↔ BRL”;
- um cartão principal de conversão;
- um campo para digitar o valor;
- um seletor de direção da conversão;
- um botão “Converter”;
- uma área de resultado que aparece após a consulta.

### Erros comuns ao abrir

#### “Nada acontece quando clico em Converter”

Possíveis causas:

- o arquivo foi aberto via `file:///` e o navegador bloqueou módulos;
- houve erro de rede ao consultar a API;
- o valor digitado está inválido.

#### “O layout aparece sem estilo”

Verifique:

- se a pasta `css/` está no mesmo nível do `index.html`;
- se os links do `<head>` não foram alterados.

---

## 7. Mapa de leitura da documentação

Os documentos foram escritos para serem lidos em sequência:

### `00-visao-geral.md`

Explica o panorama do projeto, estrutura, execução local e roteiro de leitura.

### `01-api-e-logica.md`

Ensina a parte de consumo da API, programação assíncrona, JSON, conversão de moedas e utilitários.

### `02-ui-e-design.md`

Mostra como a interface foi montada com HTML semântico, CSS puro, responsividade e identidade visual inspirada na nota de 100 dólares.

### `03-integracao-e-qa.md`

Explica como tudo foi ligado no `app.js`, como o estado da interface é controlado e como os testes manuais foram organizados.

---

## 8. Como usar esta documentação para aprender de verdade

Uma boa estratégia é:

1. Ler o `00` para entender o todo.
2. Abrir o projeto no navegador.
3. Ler o `01` e comparar com `js/api.js`, `js/converter.js` e `js/utils.js`.
4. Ler o `02` com o DevTools aberto, inspecionando o HTML e o CSS.
5. Ler o `03` e acompanhar os eventos no `js/app.js`.

Essa sequência ajuda porque respeita o fluxo real da aplicação:

```text
estrutura → dados → interface → integração → testes
```

---

## 9. Materiais de apresentação

Além do site e da documentação, o projeto também inclui:

- screenshots reais do site em `apresentacao/screenshots/`;
- apresentação em PowerPoint em `apresentacao/slides.pptx`.

Esses materiais foram pensados para apoiar a apresentação oral do projeto e também mostrar o processo de desenvolvimento com agentes especializados.

---

## 10. Créditos do time

### Contexto humano

- Trabalho desenvolvido para a disciplina AGES/PUCRS.
- Time com 3 integrantes.
- Frontend conduzido por Otávio.

### Complemento de documentação

Esta versão final organiza e consolida o trabalho com apoio de IA, mantendo o foco didático do projeto: ensinar como construir e explicar uma aplicação web simples que consome uma API pública.

Se o grupo quiser, esta seção pode ser complementada depois com os nomes completos de todos os integrantes.
