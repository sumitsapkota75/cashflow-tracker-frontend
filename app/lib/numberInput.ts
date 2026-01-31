export function formatNumberInput(value: string) {
  if (!value) return "";
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  const hasTrailingDot = cleaned.endsWith(".");
  const [rawInteger, rawDecimal = ""] = cleaned.split(".");
  const integer = rawInteger.replace(/^0+(?=\d)/, "");
  const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimal = rawDecimal.replace(/[^0-9]/g, "");
  if (decimal) return `${withCommas}.${decimal}`;
  if (hasTrailingDot) return `${withCommas}.`;
  return withCommas;
}

export function parseNumberInput(value: string) {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "");
  return Number(cleaned || 0);
}
