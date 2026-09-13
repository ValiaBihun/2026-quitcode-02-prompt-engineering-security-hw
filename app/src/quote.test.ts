import { describe, expect, it } from "vitest";
import { estimateTotalCents, formatMoney, splitInstallments } from "./quote.js";

// Базові (happy path) тести. Навмисно неповні — розширення покриття
// це і є ваш перший промпт з cookbook (Task A).

describe("estimateTotalCents", () => {
  it("рахує суму без знижки", () => {
    expect(estimateTotalCents({ hours: 10, rateCents: 5000 })).toBe(50000);
  });

  it("застосовує знижку", () => {
    expect(estimateTotalCents({ hours: 10, rateCents: 5000, discountPercent: 10 })).toBe(45000);
  });

  it("повертає 0 при 0 годин", () => {
    expect(estimateTotalCents({ hours: 0, rateCents: 5000 })).toBe(0);
  });

  it("знижка 100% обнуляє суму", () => {
    expect(estimateTotalCents({ hours: 10, rateCents: 5000, discountPercent: 100 })).toBe(0);
  });

  it("кидає помилку, якщо знижка більша за 100%", () => {
    expect(() =>
      estimateTotalCents({ hours: 10, rateCents: 5000, discountPercent: 150 }),
    ).toThrow(RangeError);
  });

  it("кидає помилку, якщо знижка від'ємна", () => {
    expect(() =>
      estimateTotalCents({ hours: 10, rateCents: 5000, discountPercent: -20 }),
    ).toThrow(RangeError);
  });

  it("кидає помилку, якщо знижка NaN (замість тихого NaN у відповіді)", () => {
    expect(() =>
      estimateTotalCents({ hours: 10, rateCents: 5000, discountPercent: NaN }),
    ).toThrow(RangeError);
  });

  it("кидає помилку, якщо hours або rateCents не скінченні", () => {
    expect(() => estimateTotalCents({ hours: Infinity, rateCents: 5000 })).toThrow(RangeError);
    expect(() => estimateTotalCents({ hours: 10, rateCents: NaN })).toThrow(RangeError);
  });
});

describe("splitInstallments", () => {
  it("ділить суму, що ділиться націло", () => {
    expect(splitInstallments(90000, 3)).toEqual([30000, 30000, 30000]);
  });

  it("не губить і не додає центи, коли сума не ділиться націло", () => {
    const parts = splitInstallments(100, 3);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
    expect(parts).toEqual([34, 33, 33]);
  });

  it("зберігає суму й тоді, коли округлення тягне вгору", () => {
    const parts = splitInstallments(101, 2);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(101);
    expect(parts).toEqual([51, 50]);
  });

  it("кидає помилку замість тихої втрати суми при parts <= 0", () => {
    expect(() => splitInstallments(1000, 0)).toThrow(RangeError);
    expect(() => splitInstallments(1000, -2)).toThrow(RangeError);
  });

  it("кидає помилку, якщо parts не ціле число", () => {
    expect(() => splitInstallments(1000, 2.5)).toThrow(RangeError);
  });
});

describe("formatMoney", () => {
  it("форматує центи", () => {
    expect(formatMoney(123450)).toBe("$1,234.50");
  });

  it("форматує від'ємну суму зі знаком мінус", () => {
    expect(formatMoney(-105)).toBe("-$1.05");
  });

  it("доповнює нулем дробову частину менше 10 центів", () => {
    expect(formatMoney(5)).toBe("$0.05");
  });
});
