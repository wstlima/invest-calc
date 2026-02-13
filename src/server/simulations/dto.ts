import { z } from "zod";

export const SimulationCreateSchema = z.object({
	name: z.string().min(1).max(120),
	initialAmount: z.number().positive(),
	monthlyContribution: z.number().min(0).optional().default(0),
	months: z.number().int().positive(),

	fixedAnnualRate: z.number().min(0).default(0.12),
	variableAnnualReturn: z.number().default(0.12),
	variableVolatility: z.number().min(0).default(0.25),
});

export type SimulationCreateInput = z.infer<typeof SimulationCreateSchema>;
