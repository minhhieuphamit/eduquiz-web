/**
 * Determines whether a subject requires KaTeX math rendering.
 *
 * STEM subjects (Toán, Vật lí, Hóa học, Sinh học) need formula rendering.
 * Social-science subjects use plain text only.
 *
 * This is the single source of truth for the KaTeX toggle decision.
 */

export function normalizeForKatex(name: string): string {
  if (!name) return '';
  // Convert to lowercase, remove accents (NFD + regex bounds), and convert "đ/Đ" to "d"
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .trim();
}

/** Returns true if the given subject name requires KaTeX rendering/tools. */
export function shouldEnableFormulaTools(subjectName: string | null | undefined): boolean {
  if (!subjectName) return false;
  const normalized = normalizeForKatex(subjectName);
  // Use word-boundary matching to avoid false positives like "Địa lý" matching "ly"
  // STEM subjects: Toán, Vật lí/lý, Hóa (học), Sinh (học)
  return /\btoan\b/.test(normalized) ||
         /\bvat\b/.test(normalized) ||
         /\bhoa\b/.test(normalized) ||
         /\bsinh\b/.test(normalized);
}

/** Alias for shouldEnableFormulaTools to fit rendering context. */
export function shouldRenderKatex(subjectName: string | null | undefined): boolean {
  return shouldEnableFormulaTools(subjectName);
}
