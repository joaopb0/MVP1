const DEFAULT_COMMISSION_PERCENTAGE = 0.1;

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || String(valor).trim() === '') {
    throw new Error('Valores numericos obrigatorios');
  }

  if (typeof valor === 'boolean') {
    throw new Error('Input invalido. Esperado Decimal');
  }

  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) {
      throw new Error('Input invalido. Esperado Decimal');
    }

    return valor;
  }

  if (typeof valor !== 'string') {
    throw new Error('Input invalido. Esperado Decimal');
  }

  const normalizado = valor.trim().replace(',', '.');
  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) {
    throw new Error('Input invalido. Esperado Decimal');
  }

  return numero;
}

function arredondarMoeda(valor) {
  const numero = normalizarNumero(valor);
  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

function normalizarPercentual(valor) {
  const percentual = normalizarNumero(valor);
  if (percentual <= 0) return 0;

  const percentualNormalizado = percentual > 1 ? percentual / 100 : percentual;
  if (percentualNormalizado > 1) {
    throw new Error('A comissao nao pode exceder 100%');
  }

  return percentualNormalizado;
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
