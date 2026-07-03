const assert = require('node:assert/strict');
const { calcularResumoPedido } = require('../services/LucroService');

const casos = [
  {
    id: 'CT-01',
    entrada: {
      valorBruto: 100,
      valorTaxas: 18,
      custoFornecedorTotal: 40,
      percentualComissao: 10
    },
    esperado: {
      lucroLiquido: 42,
      comissaoVendedor: 4.2
    }
  },
  {
    id: 'CT-02',
    entrada: {
      valorBruto: 50,
      valorTaxas: 15,
      custoFornecedorTotal: 40,
      percentualComissao: 10
    },
    esperado: {
      lucroLiquido: -5,
      comissaoVendedor: 0
    }
  },
  {
    id: 'CT-03',
    entrada: {
      valorBruto: 50,
      valorTaxas: 10,
      custoFornecedorTotal: 40,
      percentualComissao: 10
    },
    esperado: {
      lucroLiquido: 0,
      comissaoVendedor: 0
    }
  },
  {
    id: 'CT-04',
    entrada: {
      valorBruto: 20,
      valorTaxas: 9,
      custoFornecedorTotal: 8,
      percentualComissao: 5
    },
    esperado: {
      lucroLiquido: 3,
      comissaoVendedor: 0.15
    }
  }
];

casos.forEach((caso) => {
  const resultado = calcularResumoPedido(caso.entrada);
  assert.equal(resultado.lucroLiquido, caso.esperado.lucroLiquido, `${caso.id} lucro liquido`);
  assert.equal(
    resultado.comissaoVendedor,
    caso.esperado.comissaoVendedor,
    `${caso.id} comissao`
  );
  console.log(`${caso.id} aprovado`);
});

console.log('Motor de lucro aprovado em todos os cenarios da POC.');
