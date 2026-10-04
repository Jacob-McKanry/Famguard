// Splits a list of ids into price set A and B (spec section 10).
// Shuffle randomly, then alternate A, B, A, B so the groups stay the same size.
// `random` can be swapped in tests.
export function assignPriceSets(ids: string[], random: () => number = Math.random): Record<string, "A" | "B"> {
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result: Record<string, "A" | "B"> = {};
  shuffled.forEach((id, i) => {
    result[id] = i % 2 === 0 ? "A" : "B";
  });
  return result;
}
