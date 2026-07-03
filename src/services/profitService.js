const DEFAULT_COMMISSION_PERCENTAGE = 0.1;

function toNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value || '0').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function toMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateProfit({
  valorBruto,
  valorTaxas,
  custoTotalFornecedor,
  percentualComissao = DEFAULT_COMMISSION_PERCENTAGE
}) {
  const gross = toNumber(valorBruto);
  const fees = toNumber(valorTaxas);
  const supplierCost = toNumber(custoTotalFornecedor);
  const percentage = toNumber(percentualComissao);

  const lucroLiquido = toMoney(gross - (fees + supplierCost));
  const comissaoVendedor = lucroLiquido > 0 ? toMoney(lucroLiquido * percentage) : 0;

  return {
    lucroLiquido,
    comissaoVendedor
  };
}

module.exports = {
  DEFAULT_COMMISSION_PERCENTAGE,
  calculateProfit,
  toMoney,
  toNumber
};
