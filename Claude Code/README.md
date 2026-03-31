# Conversor de Câmbio USD ↔ BRL

Projeto acadêmico da disciplina **AGES (Agência Experimental de Engenharia de Software)** da **PUCRS**, focado em consumo de API pública no frontend com **HTML, CSS e JavaScript vanilla**.

O site consulta a **AwesomeAPI** em tempo real para converter valores entre **dólar americano (USD)** e **real brasileiro (BRL)**, exibindo também compra, venda, máxima, mínima, variação percentual e última atualização.

## Demonstração local

Como o projeto usa módulos ES (`type="module"`), o ideal é abrir com um servidor local simples:

```bash
python3 -m http.server 4173
```

Depois, acesse:

```text
http://127.0.0.1:4173
```

Se preferir, também é possível usar uma extensão como **Live Server** no VS Code.

## Tecnologias

- HTML5 semântico
- CSS3 puro
- JavaScript vanilla com módulos ES
- `fetch()` nativo
- AwesomeAPI: `https://economia.awesomeapi.com.br/last/USD-BRL,BRL-USD`

## Estrutura

```text
.
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

## Documentação completa

A documentação principal está em [`docs/`](./docs) e foi escrita em formato didático, pensando em colegas que ainda estão aprendendo desenvolvimento web.

Ordem sugerida de leitura:

1. [`docs/00-visao-geral.md`](./docs/00-visao-geral.md)
2. [`docs/01-api-e-logica.md`](./docs/01-api-e-logica.md)
3. [`docs/02-ui-e-design.md`](./docs/02-ui-e-design.md)
4. [`docs/03-integracao-e-qa.md`](./docs/03-integracao-e-qa.md)

## Entregas adicionais

- Screenshots reais do site em [`apresentacao/screenshots/`](./apresentacao/screenshots)
- Apresentação final em PowerPoint em [`apresentacao/slides.pptx`](./apresentacao/slides.pptx)

## Créditos

- Projeto acadêmico do time AGES/PUCRS 2026/1
- Documentação e organização final consolidadas a partir do trabalho do grupo com apoio de IA
