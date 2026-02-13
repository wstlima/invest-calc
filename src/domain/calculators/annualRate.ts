export function annualToMonthlyRate(annualRate: number): number {
	return Math.pow(1 + annualRate, 1 / 12) - 1;
}
