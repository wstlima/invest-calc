import { FixedIncomeTaxes } from "../types";

export function getIofPercent(days: number): number {
	if (days > 30) return 0;
	// Regra do enunciado: IOF% = 96 - ((dias - 1) * 3), até 30 dias.
	// Ex.: dia 1 = 96, dia 10 = 69, dia 29 = 12, dia 30 = 0
	const pct = 96 - (days - 1) * 3;
	return Math.max(0, Math.min(96, pct));
}

export function getIrRate(days: number): number {
	if (days <= 180) return 0.225;
	if (days <= 360) return 0.20;
	if (days <= 720) return 0.175;
	return 0.15;
}

export function applyFixedIncomeTaxes({ finalGross, totalContributed, days }: {
	finalGross: number;
	totalContributed: number;
	days: number;
}): FixedIncomeTaxes {
	const grossIncome = finalGross - totalContributed;
	const iofPercent = getIofPercent(days);
	const iof = grossIncome * (iofPercent / 100);
	const irRate = getIrRate(days);
	const ir = (grossIncome - iof) * irRate;
	const netIncome = grossIncome - iof - ir;
	const finalNet = totalContributed + netIncome;
	return {
		days,
		grossIncome,
		iofPercent,
		iof,
		irRate,
		ir,
		netIncome,
		finalNet,
	};
}
