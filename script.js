const selectOrigem = document.getElementById("moedaOrigem");
const selectDestino = document.getElementById("moedaDestino");
const inputValor = document.getElementById("valor");
const resultado = document.getElementById("resultado");

let moedas = {}; 

async function carregarMoedas() {
  
    selectOrigem.disabled = true;
    selectDestino.disabled = true;
    inputValor.disabled = true;
    resultado.textContent = "Carregando moedas...";

    try {
       
        const res = await fetch("https://open.er-api.com/v6/latest" );
        if (!res.ok) {
            throw new Error(`Erro ao carregar moedas: ${res.status}`);
        }
        const dados = await res.json();

        if (dados.rates) {
            for (let codigo in dados.rates) {
                moedas[codigo] = {
                    nome: codigo 
                };
            }
        }
        
        preencherSelects();
        
        selectOrigem.disabled = false;
        selectDestino.disabled = false;
        inputValor.disabled = false;
        resultado.textContent = "Resultado aparecerá aqui...";
        
        converter(); 

    } catch (error) {
        console.error("Erro ao carregar moedas:", error);
        resultado.textContent = "Não foi possível carregar as moedas. Tente novamente mais tarde.";
    }
}

function preencherSelects() {
    selectOrigem.innerHTML = '';
    selectDestino.innerHTML = '';

    const sortedMoedas = Object.keys(moedas).sort(); 

    sortedMoedas.forEach(codigo => {
        const opt1 = document.createElement("option");
        opt1.value = codigo;
        opt1.textContent = `${codigo}`;
        selectOrigem.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = codigo;
        opt2.textContent = `${codigo}`;
        selectDestino.appendChild(opt2);
    });

    selectOrigem.value = "BRL";
    selectDestino.value = "USD";
}

async function converter() {
    const valor = parseFloat(inputValor.value); 
    const origem = selectOrigem.value;
    const destino = selectDestino.value;

    if (isNaN(valor) || valor <= 0) {
        resultado.textContent = "Digite um valor válido!";
        return;
    }

    try {
       
        const url = `https://open.er-api.com/v6/latest?base=${origem}`;
        const res = await fetch(url );
        if (!res.ok) {
            throw new Error(`Erro na conversão: ${res.status}`);
        }
        const dados = await res.json();

        if (!dados.rates || !dados.rates[destino]) {
            throw new Error("Taxa de câmbio não encontrada.");
        }

        const taxa = dados.rates[destino];
        const convertido = valor * taxa;

        if (isNaN(convertido)) {
            resultado.textContent = "Erro no cálculo da conversão.";
            return;
        }

        // Exibe o resultado formatado com duas casas decimais
        resultado.innerHTML = `
            ${valor.toFixed(2)} ${origem} =   

            <strong>${convertido.toFixed(2)} ${destino}</strong>
        `;
    } catch (error) {
        console.error("Erro na conversão:", error);
        resultado.textContent = `Erro ao converter: ${error.message}`;
    }
}

inputValor.addEventListener("input", converter);
selectOrigem.addEventListener("change", converter);
selectDestino.addEventListener("change", converter);

carregarMoedas();
