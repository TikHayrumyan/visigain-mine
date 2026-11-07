/** Integer cents as the visitor's locale writes money: 9900 usd -> "$99" (no cents when there are none). */
export function formatMoney(amountCents: number, currency: string, locale = "en-US"): string {
  const whole = amountCents % 100 === 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}
