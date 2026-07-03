const DEFAULT_COMMISSION_PERCENTAGE = 0.1;

function normalizarNumero(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0;
  }

  const normalizado = String(valor ?? '0').trim().replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

function arredondarMoeda(valor) {
  const numero = normalizarNumero(valor);
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

function normalizarPercentual(valor) {
  const percentual = normalizarNumero(valor);
  if (percentual <= 0) return 0;
  return percentual > 1 ? percentual / 100 : percentual;
}

function calcularLucroLiquido(valorBruto, custoFornecedorTotal, valorTaxas) {
  return arredondarMoeda(
    normalizarNumero(valorBruto) -
      normalizarNumero(custoFornecedorTotal) -
      normalizarNumero(valorTaxas)
  );
}

function calcularComissao(lucroLiquido, percentualComissao) {
  const lucro = arredondarMoeda(lucroLiquido);
  if (lucro <= 0) return 0;

  // Trava academica da POC: pedidos sem lucro real nao geram comissao.
  return arredondarMoeda(lucro * normalizarPercentual(percentualComissao));
}

function calcularResumoPedido({
  valorBruto,
  custoFornecedorTotal,
  valorTaxas,
  percentualComissao = DEFAULT_COMMISSION_PERCENTAGE
}) {
  const lucroLiquido = calcularLucroLiquido(valorBruto, custoFornecedorTotal, valorTaxas);
  const percentualNormalizado = normalizarPercentual(percentualComissao);

  return {
    lucroLiquido,
    comissaoVendedor: calcularComissao(lucroLiquido, percentualNormalizado),
    percentualComissao: percentualNormalizado
  };
}

module.exports = {
  DEFAULT_COMMISSION_PERCENTAGE,
  arredondarMoeda,
  calcularComissao,
  calcularLucroLiquido,
  calcularResumoPedido,
  normalizarNumero,
  normalizarPercentual
};
