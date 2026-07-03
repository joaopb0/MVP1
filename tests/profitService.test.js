const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateProfit } = require('../src/services/profitService');

test('CT-01 caminho feliz com lucro', () => {
  const result = calculateProfit({
    valorBruto: 100,
    valorTaxas: 18,
    custoTotalFornecedor: 40,
    percentualComissao: 0.1
  });

  assert.equal(result.lucroLiquido, 42);
  assert.equal(result.comissaoVendedor, 4.2);
});

test('CT-02 venda com prejuizo zera comissao', () => {
  const result = calculateProfit({
    valorBruto: 50,
    valorTaxas: 15,
    custoTotalFornecedor: 40,
    percentualComissao: 0.1
  });

  assert.equal(result.lucroLiquido, -5);
  assert.equal(result.comissaoVendedor, 0);
});

test('CT-03 ponto de equilibrio zera comissao', () => {
  const result = calculateProfit({
    valorBruto: 50,
    valorTaxas: 10,
    custoTotalFornecedor: 40,
    percentualComissao: 0.1
  });

  assert.equal(result.lucroLiquido, 0);
  assert.equal(result.comissaoVendedor, 0);
});

test('CT-04 impacto de taxas fixas', () => {
  const result = calculateProfit({
    valorBruto: 20,
    valorTaxas: 9,
    custoTotalFornecedor: 8,
    percentualComissao: 0.05
  });

  assert.equal(result.lucroLiquido, 3);
  assert.equal(result.comissaoVendedor, 0.15);
});
