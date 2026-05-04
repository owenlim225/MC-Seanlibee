export function MoneyText({ cents }: { cents: number }) {
  const amount = (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
  return <span className="tabular-nums">{amount}</span>;
}
