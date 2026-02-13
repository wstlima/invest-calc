export type MoneySeriesPoint = {
	month: number;
	balance: number;
	contributed: number;
	interest: number;
};

export type FixedIncomeResult = {
	series: MoneySeriesPoint[];
	finalGross: number;
	totalContributed: number;
};

export type VariableIncomeResult = {
	seriesMean: MoneySeriesPoint[];
	finalMean: number;
	p10Final: number;
	p90Final: number;
};

export type FixedIncomeTaxes = {
	days: number;
	grossIncome: number;
	iofPercent: number;
	iof: number;
	irRate: number;
	ir: number;
	netIncome: number;
	finalNet: number;
};
