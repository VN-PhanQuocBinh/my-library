function magnitude(a: number[]) {
  return Math.sqrt(a.reduce((s, x) => s + x * x, 0));
}

function normalize(a: number[]) {
  const mag = magnitude(a);
  return mag === 0 ? a.slice() : a.map((x) => x / mag);
}

export function calculateCosineSimilarity(
  vecA: number[] = [],
  vecB: number[] = []
) {
  if (vecA.length !== vecB.length) {
    console.log("Vectors have different lengths:", vecA.length, vecB.length);
    throw new Error("Vectors must be of the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];

    if (a === undefined || b === undefined || a === null || b === null) {
      console.log(vecA[i], vecB[i]);
      throw new Error("Vectors must not contain undefined or null values");
    }

    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  const magnitudeProduct = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (magnitudeProduct === 0) {
    throw new Error("Magnitude of one or both vectors is zero");
  }

  return dotProduct / magnitudeProduct;
}
