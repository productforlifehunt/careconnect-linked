/** Old line-only positions need corroborating visible text: a line number alone can move. */
export function matchingLegacyLabel(saved: string, current: string): boolean {
  const normal = (label: string) => {
    const body = label.replace(/^<[^>]+>\s*/, "");
    const [value, ...context] = body.split(" · ");
    // Old bindings often captured a rendered count ("0"), while the current
    // page has a live count ("1"). Keep any descriptive words and the stable
    // component context, but discard the numeric display value.
    const descriptiveValue = (value || "").replace(
      /^\s*[\d.,—-]+\s*/u,
      "",
    );
    const genericContext = new Set([
      "card",
      "cardcontent",
      "div",
      "span",
      "button",
      "p",
    ]);
    const normalizedContext = context
      .join(" ")
      .toLocaleLowerCase()
      .replace(/[\d\s\p{P}\p{S}]+/gu, "");
    // A bare number plus a generic wrapper name does not identify one element;
    // it is exactly the kind of old binding that must stay unconfirmed.
    if (!descriptiveValue.trim() && genericContext.has(normalizedContext))
      return "";
    return [descriptiveValue, ...context]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .replace(/[\d\s\p{P}\p{S}]+/gu, "");
  };
  const a = normal(saved);
  const b = normal(current);
  return a.length >= 2 && a === b;
}
