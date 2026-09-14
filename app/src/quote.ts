/**
 * Розрахунок кошторису для проєкту автоматизації.
 * Усі суми — у центах (цілі числа), щоб уникнути похибок float.
 *
 * Це навчальний модуль-ціль для промптів з `prompts/`.
 * Він НАВМИСНЕ недосконалий — саме це ви і знайдете добре сформульованим
 * промптом з acceptance criteria (Task A).
 */

/** Скільки центів в одному доларі — для форматування сум людині. */
const CENTS_PER_DOLLAR = 100;

/** Знижка у відсотках рахується як частка від 100. */
const PERCENT_SCALE = 100;

export interface QuoteInput {
  /** Оцінка робіт у годинах */
  hours: number;
  /** Ставка за годину, у центах (напр. 5000 = $50.00) */
  rateCents: number;
  /** Знижка у відсотках, 0..100 */
  discountPercent?: number;
}

/** Ціна проєкту в центах з урахуванням знижки. */
export function estimateTotalCents(input: QuoteInput): number {
  const { hours, rateCents, discountPercent = 0 } = input;
  if (!Number.isFinite(hours) || !Number.isFinite(rateCents)) {
    throw new RangeError(`hours and rateCents must be finite numbers, got hours=${hours}, rateCents=${rateCents}`);
  }
  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new RangeError(`discountPercent must be a finite number between 0 and 100, got ${discountPercent}`);
  }
  const gross = hours * rateCents;
  const discount = (gross * discountPercent) / PERCENT_SCALE;
  return Math.round(gross - discount);
}

/**
 * Розбити суму на `parts` рівних платежів (у центах).
 * Повертає масив довжиною `parts`.
 */
export function splitInstallments(totalCents: number, parts: number): number[] {
  if (!Number.isInteger(totalCents)) {
    throw new RangeError(`totalCents must be an integer, got ${totalCents}`);
  }
  if (!Number.isInteger(parts) || parts <= 0) {
    throw new RangeError(`parts must be a positive integer, got ${parts}`);
  }
  const base = Math.floor(totalCents / parts);
  const remainder = totalCents - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** Форматування центів у рядок на кшталт "$1,234.50". */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / CENTS_PER_DOLLAR).toLocaleString("en-US");
  const frac = String(abs % CENTS_PER_DOLLAR).padStart(2, "0");
  return `${sign}$${whole}.${frac}`;
}
