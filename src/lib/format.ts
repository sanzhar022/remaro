const kztFormatter = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number): string {
  return kztFormatter.format(price);
}

export function formatProductCount(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  if (remainder100 >= 11 && remainder100 <= 14) return `${count} товаров`;
  if (remainder10 === 1) return `${count} товар`;
  if (remainder10 >= 2 && remainder10 <= 4) return `${count} товара`;
  return `${count} товаров`;
}
