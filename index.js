const { readFileSync } = require('fs');

function formatarMoeda(valor) {
      return new Intl.NumberFormat("pt-BR",
        { style: "currency", currency: "BRL",
          minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(apre, pecas) {
    return pecas[apre.id];
}

function calcularCredito(apre, pecas) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(apre, pecas).tipo === "comedia") 
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function calcularTotalCreditos(pecas, apresentacoes){
  let creditos = 0;
  for (let apre of apresentacoes){
    creditos += calcularCredito(apre, pecas);
  }
  return creditos;
}

function calcularTotalApresentacao(apre, pecas){
  let total = 0;

  switch (getPeca(apre, pecas).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
    break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
    break;
    default:
      throw new Error(`Peça desconhecia: ${getPeca(apre, pecas).tipo}`);
  }
  return total;
}

function calcularTotalFatura(pecas, apresentacoes){
  let total = 0;
  for (let apre of apresentacoes){
    total += calcularTotalApresentacao(apre, pecas);
  }
  return total;
}


function gerarFaturaStr (fatura, pecas) {        
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre, pecas).nome}: ${formatarMoeda(calcularTotalApresentacao(apre, pecas))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
  return faturaStr;
  }

function gerarFaturaHTML(fatura, pecas) {
  let faturaHTML = `<html>\n`
  faturaHTML += `<p> Fatura ${fatura.cliente} </p>\n<ul>\n`

  for (let apre of fatura.apresentacoes) {
    faturaHTML += `<li>  ${getPeca(apre, pecas).nome}: ${formatarMoeda(calcularTotalApresentacao(apre, pecas))} (${apre.audiencia} assentos) </li>\n`;
  }
  faturaHTML += `</ul>\n<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  faturaHTML += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  faturaHTML += `</html>`
  return faturaHTML;

}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaStr);
console.log(faturaHTML);