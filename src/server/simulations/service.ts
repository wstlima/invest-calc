import crypto from "crypto";
import { prisma } from "../db/prisma";
import { SimulationCreateSchema } from "./dto";
import { simulateFixedIncome } from "../../domain/calculators/fixedIncome";
import { applyFixedIncomeTaxes } from "../../domain/calculators/taxes";
import { simulateVariableIncome } from "../../domain/calculators/variableIncome";

function hashPayload(payload: unknown) {
  const normalized = JSON.stringify(payload);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function createSimulationIdempotent(rawBody: unknown, idempotencyKey: string) {
  if (!idempotencyKey) {
    const err: any = new Error("Idempotency-Key header é obrigatório");
    err.status = 400;
    throw err;
  }

  const input = SimulationCreateSchema.parse(rawBody);
  const requestHash = hashPayload(input);

  return prisma.$transaction(async (tx: any) => {
    const existingKey = await tx.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      if (existingKey.requestHash !== requestHash) {
        const err: any = new Error("Idempotency-Key já utilizada com payload diferente");
        err.status = 409;
        throw err;
      }

      const existingSimulation = await tx.simulation.findUnique({
        where: { id: existingKey.simulationId },
        include: { result: true },
      });

      return { simulation: existingSimulation, replay: true };
    }

    // ======= CÁLCULOS =======
    const fixed = simulateFixedIncome({
      initialAmount: input.initialAmount,
      monthlyContribution: input.monthlyContribution,
      months: input.months,
      annualRate: input.fixedAnnualRate,
    });

    const days = input.months * 30;

    const taxes = applyFixedIncomeTaxes({
      finalGross: fixed.finalGross,
      totalContributed: fixed.totalContributed,
      days,
    });

    const variable = simulateVariableIncome(
      {
        initialAmount: input.initialAmount,
        monthlyContribution: input.monthlyContribution,
        months: input.months,
        annualReturn: input.variableAnnualReturn,
        annualVolatility: input.variableVolatility,
      },
      { seed: 42, paths: 1000, returnBands: true }
    );

    const fixedFinalNet = taxes.finalNet;
    const variableFinalMean = variable.finalMean;

    const diffAbs = variableFinalMean - fixedFinalNet;
    const diffPercent = fixedFinalNet !== 0 ? (diffAbs / fixedFinalNet) * 100 : 0;

    // ======= PERSISTÊNCIA =======
    const created = await tx.simulation.create({
      data: {
        name: input.name,
        initialAmount: input.initialAmount,
        monthlyContribution: input.monthlyContribution,
        months: input.months,
        fixedAnnualRate: input.fixedAnnualRate,
        variableAnnualReturn: input.variableAnnualReturn,
        variableVolatility: input.variableVolatility,
        result: {
          create: {
            fixedSeriesJson: JSON.stringify(fixed.series),
            variableSeriesJson: JSON.stringify(variable.seriesMean),
            fixedFinalGross: fixed.finalGross,
            fixedFinalNet,
            variableFinalMean,
            taxesJson: JSON.stringify(taxes),
            metaJson: JSON.stringify({
              diffAbs,
              diffPercent,
              p10: variable.p10Final,
              p90: variable.p90Final,
              assumptions: {
                daysApprox: "months*30",
                variableModel: "Monte Carlo Normal (retMensal, volMensal)",
                paths: 1000,
                seed: 42,
              },
            }),
          },
        },
      },
      include: { result: true },
    });

    await tx.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        requestHash,
        simulationId: created.id,
      },
    });

    return { simulation: created, replay: false };
  });
}
