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
    categoria: 'Precisao',
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
  },
  {
    id: 'CT-05',
    categoria: 'Precisao',
    entrada: {
      valorBruto: 33.33,
      valorTaxas: 5,
      custoFornecedorTotal: 10,
      percentualComissao: 3.33
    },
    esperado: {
      lucroLiquido: 18.33,
      comissaoVendedor: 0.61
    }
  },
  {
    id: 'CT-06',
    categoria: 'Excecao / Input',
    entrada: {
      valorBruto: null,
      valorTaxas: 10,
      custoFornecedorTotal: 10,
      percentualComissao: 10
    },
    erroEsperado: 'Valores numericos obrigatorios'
  },
  {
    id: 'CT-07',
    categoria: 'Excecao / Input',
    entrada: {
      valorBruto: 'cem',
      valorTaxas: 10,
      custoFornecedorTotal: 10,
      percentualComissao: 10
    },
    erroEsperado: 'Input invalido. Esperado Decimal'
  },
  {
    id: 'CT-08',
    categoria: 'Limite',
    entrada: {
      valorBruto: 100,
      valorTaxas: 10,
      custoFornecedorTotal: 40,
      percentualComissao: 150
    },
    erroEsperado: 'A comissao nao pode exceder 100%'
  }
];

casos.forEach((caso) => {
  if (caso.erroEsperado) {
    assert.throws(
      () => calcularResumoPedido(caso.entrada),
      (error) => error.message === caso.erroEsperado,
      `${caso.id} erro esperado`
    );
    console.log(`${caso.id} aprovado`);
    return;
  }

  const resultado = calcularResumoPedido(caso.entrada);
  assert.equal(resultado.lucroLiquido, caso.esperado.lucroLiquido, `${caso.id} lucro liquido`);
  assert.equal(
    resultado.comissaoVendedor,
    caso.esperado.comissaoVendedor,
    `${caso.id} comissao`
  );
  console.log(`${caso.id} aprovado`);
});

console.log('Motor de lucro aprovado em todos os cenarios da matriz do PDF.');
