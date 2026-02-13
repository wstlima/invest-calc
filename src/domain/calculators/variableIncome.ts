import { MoneySeriesPoint, VariableIncomeResult } from "../types";
import { annualToMonthlyRate } from "./annualRate";

// LCG para seed determinístico
function lcg(seed: number) {
	let s = seed;
	return () => {
		s = (s * 1664525 + 1013904223) % 4294967296;
		return s / 4294967296;
	};
}

function boxMuller(rand: () => number) {
	let u = 0, v = 0;
	while (u === 0) u = rand();
	while (v === 0) v = rand();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function simulateVariableIncome(
	{
		initialAmount,
		monthlyContribution = 0,
		months,
		annualReturn,
		annualVolatility,
	}: {
		initialAmount: number;
		monthlyContribution?: number;
		months: number;
		annualReturn: number;
		annualVolatility: number;
	},
	{ paths = 1000, seed = 42, returnBands = true } = {}
): VariableIncomeResult {
	const monthlyReturn = annualToMonthlyRate(annualReturn);
	const monthlyVol = annualVolatility / Math.sqrt(12);
	const allSeries: number[][] = [];

	for (let p = 0; p < paths; p++) {
		let balance = initialAmount;
		let totalContributed = initialAmount;
		const series: number[] = [];
		const rand = lcg(seed + p);
		for (let m = 1; m <= months; m++) {
			const z = boxMuller(rand);
			const ret = monthlyReturn + monthlyVol * z;
			const interest = balance * ret;
			balance += interest + monthlyContribution;
			totalContributed += monthlyContribution;
			series.push(balance);
		}
		allSeries.push(series);
	}

	// Média mês a mês
	const seriesMean: MoneySeriesPoint[] = [];
	for (let m = 0; m < months; m++) {
		const values = allSeries.map(s => s[m]);
		const mean = values.reduce((a, b) => a + b, 0) / values.length;
		seriesMean.push({ month: m + 1, balance: mean, contributed: 0, interest: 0 });
	}

	// Final
	const finals = allSeries.map(s => s[months - 1]);
	finals.sort((a, b) => a - b);
	const finalMean = seriesMean[months - 1]?.balance ?? 0;
	const p10Final = finals[Math.floor(0.1 * finals.length)];
	const p90Final = finals[Math.floor(0.9 * finals.length)];

	return {
		seriesMean,
		finalMean,
		p10Final,
		p90Final,
	};
}
