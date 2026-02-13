import { MoneySeriesPoint, FixedIncomeResult } from "../types";
import { annualToMonthlyRate } from "./annualRate";

export function simulateFixedIncome({
	initialAmount,
	monthlyContribution = 0,
	months,
	annualRate,
}: {
	initialAmount: number;
	monthlyContribution?: number;
	months: number;
	annualRate: number;
}): FixedIncomeResult {
	const monthlyRate = annualToMonthlyRate(annualRate);
	let balance = initialAmount;
	let totalContributed = initialAmount;
	const series: MoneySeriesPoint[] = [];

	for (let month = 1; month <= months; month++) {
		const interest = balance * monthlyRate;
		balance += interest + monthlyContribution;
		totalContributed += monthlyContribution;
		series.push({ month, balance, contributed: totalContributed, interest });
	}

	return {
		series,
		finalGross: balance,
		totalContributed,
	};
}
