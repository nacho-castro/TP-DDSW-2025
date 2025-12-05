export function formatPrice(precio: number, moneda: string): string {
  const formattedNumber = precio.toLocaleString('es-AR', {
    minimumFractionDigits: precio % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  });

  switch (moneda) {
    case "PESO_ARG":
      return `$${formattedNumber} ARS`;
    case "DOLAR_USA":
      return `US$${formattedNumber}`;
    case "REAL":
      return `R$${formattedNumber}`;
    default:
      return `$${formattedNumber}`;
  }
}

export function formatNumber(numero: number): string {
  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: numero % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2
  });
}
