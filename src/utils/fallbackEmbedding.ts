const TOKEN_ALIASES: Record<string, string> = {
  auto: "car",
  automobile: "car",
  cars: "car",
  vehicle: "car",
  vehicles: "car",
  gasoline: "fuel",
  petrol: "fuel",
  gas: "fuel",
  refuel: "fuel",
  fueling: "fuel",
  trip: "travel",
  trips: "travel",
  journey: "travel",
  journeys: "travel",
  voyage: "travel",
  route: "travel",
  routes: "travel",
  highway: "travel",
  highways: "travel",
  roadtrip: "travel",
  departure: "travel",
  depart: "travel",
};

function normalizeToken(token: string): string {
  const lowered = token.toLowerCase();
  return TOKEN_ALIASES[lowered] ?? lowered;
}

export function normalizeSemanticTokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(normalizeToken);
}

export function generateFallbackEmbedding(text: string, dim: number): Float32Array {
  const vector = new Float32Array(dim);
  const tokens = normalizeSemanticTokens(text);

  for (const token of tokens) {
    let hash = 0;
    for (let index = 0; index < token.length; index += 1) {
      hash = ((hash << 5) - hash + token.charCodeAt(index)) | 0;
    }
    vector[Math.abs(hash) % dim] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude > 0) {
    for (let index = 0; index < dim; index += 1) {
      vector[index] /= magnitude;
    }
  }

  return vector;
}