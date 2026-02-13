import { describe, it, expect } from "vitest";
import { annualToMonthlyRate } from "../annualRate";
import { simulateFixedIncome } from "../fixedIncome";
import { getIofPercent, getIrRate, applyFixedIncomeTaxes } from "../taxes";
import { simulateVariableIncome } from "../variableIncome";

describe("annualToMonthlyRate", () => {
  it("converte corretamente", () => {
    expect(annualToMonthlyRate(0.12)).toBeCloseTo(0.009488, 5);
  });
});

describe("taxes", () => {
  it("IOF regressivo e IR por faixa", () => {
    expect(getIofPercent(1)).toBe(96);
    expect(getIofPercent(10)).toBe(69);
    expect(getIofPercent(29)).toBe(12);
    expect(getIofPercent(30)).toBe(0);
    expect(getIrRate(100)).toBe(0.225);
    expect(getIrRate(400)).toBe(0.175);
    expect(getIrRate(800)).toBe(0.15);
  });

  it("aplica IOF antes do IR", () => {
    const taxes = applyFixedIncomeTaxes({ finalGross: 1100, totalContributed: 1000, days: 10 });
    expect(taxes.iofPercent).toBe(69);
    expect(taxes.iof).toBeCloseTo(69, 1);
    expect(taxes.irRate).toBe(0.225);
    expect(taxes.ir).toBeGreaterThan(0);
    expect(taxes.finalNet).toBeLessThan(1100);
  });
});

describe("fixedIncome", () => {
  it("simula série de renda fixa", () => {
    const res = simulateFixedIncome({ initialAmount: 1000, monthlyContribution: 100, months: 12, annualRate: 0.12 });
    expect(res.series.length).toBe(12);
    expect(res.finalGross).toBeGreaterThan(res.totalContributed);
  });
});

describe("variableIncome", () => {
  it("simula Monte Carlo determinístico", () => {
    const res = simulateVariableIncome({ initialAmount: 1000, monthlyContribution: 100, months: 12, annualReturn: 0.12, annualVolatility: 0.25 }, { seed: 42, paths: 1000 });
    expect(res.seriesMean.length).toBe(12);
    expect(res.finalMean).toBeGreaterThan(0);
    expect(res.p10Final).toBeLessThanOrEqual(res.finalMean);
    expect(res.p90Final).toBeGreaterThanOrEqual(res.finalMean);
  });
});
