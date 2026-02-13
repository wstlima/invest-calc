# Plano de Ação — Calculadora de Investimentos (Next.js App Router + Route Handlers + SQLite/Prisma)
**Arquivo:** `plan-calculadora.md`  
**Inclui:** arquitetura completa, idempotência (SQLite), diferenciais, snippets coláveis (Prisma/Service/API), testes (Vitest) e **README snippet** com **PROMPTS obrigatórios** para envio junto ao projeto.

 ---

## Incrementos sugeridos (UX, Testes, Robustez)

### 10) Incremento de UI (Tailwind, gráficos reais, UX)
- Instalar e configurar Tailwind CSS
- Melhorar layout dos componentes (formulário, cards, tabela, histórico)
- Substituir gráfico placeholder por gráfico real (Recharts)
- Adicionar feedback visual (loading, erro, sucesso)
- Melhorar responsividade e acessibilidade

### 11) Testes de API/end-to-end
- Adicionar testes de API usando Vitest/supertest para endpoints `/api/simulations` e `/api/simulations/[id]`
- Cobrir casos de sucesso, erro, idempotência e validação
- (Opcional) Adicionar testes E2E com Playwright ou Cypress para fluxo completo UI+API

### 12) Validação extra de erros de API
- Melhorar mensagens de erro nos handlers (ex: campos obrigatórios, payload inválido, simulação não encontrada)
- Padronizar respostas de erro: `{ success: false, error: "Mensagem detalhada" }`
- Adicionar tratamento para erros inesperados (500)

## 0) Objetivo e critérios atendidos
Entregar uma aplicação que:
- Simula e compara **Renda Fixa vs Renda Variável**
- Persiste simulações e resultados em **SQLite local** (via Prisma + migrations)
- Possui **CRUD**: criar, listar (histórico), detalhar, excluir
- Implementa corretamente:
  - **conversão anual → mensal**
  - **juros compostos** com aportes
  - **IOF regressivo + IR por faixa** para renda fixa (**ordem correta: IOF antes do IR**)
- Possui **testes unitários do core financeiro**
- Documenta premissas, endpoints e inclui **PROMPTS de IA utilizados** (obrigatório)
- **Diferenciais**:
  - POST idempotente (operações idempotentes no SQLite)
  - Renda variável por Monte Carlo com **seed determinístico**
  - Intervalos P10/P90 (risco)
  - Persistência de inputs+outputs para reprodutibilidade

---

## 1) Stack e decisões
- **Next.js** (App Router) + **TypeScript** + **Tailwind**
- **Backend embutido** no Next.js: Route Handlers em `src/app/api/**`
- **SQLite local** via **Prisma** + migrations
- **Zod** para validação de payload
- **Vitest** para testes unitários do domínio (cálculos)
- **Recharts** para gráfico comparativo

### Arquitetura em camadas (dentro do mesmo repo)
- `src/domain/**` → regras de negócio e cálculos (funções puras, testáveis)
- `src/server/**` → DB (Prisma), services e repositories (server-only)
- `src/app/api/**` → controllers HTTP (Route Handlers)
- `src/app/**` e `src/components/**` → UI

---

## 2) Estrutura de pastas (padrão)
Crie/organize:

```
src/
  app/
    page.tsx
    simulations/
      page.tsx
      [id]/page.tsx
    api/
      simulations/
        route.ts
      simulations/[id]/
        route.ts
  components/
    SimulationForm.tsx
    ComparisonChart.tsx
    ResultsCards.tsx
    TaxesTable.tsx
    HistoryList.tsx
  lib/
    apiClient.ts
    money.ts
  server/
    db/
      prisma.ts
    simulations/
      dto.ts
      repository.ts
      service.ts
  domain/
    types.ts
    calculators/
      annualRate.ts
      fixedIncome.ts
      variableIncome.ts
      taxes.ts
      index.ts

prisma/
  schema.prisma
  migrations/...

vitest.config.ts
README.md
.env
```

---

## 3) Banco local (SQLite) + Prisma + Migrations + Idempotência
### 3.1 `.env`
Crie `.env` na raiz:

```env
DATABASE_URL="file:./dev.db"
```

### 3.2 `prisma/schema.prisma` (COM idempotência)
> **Idempotent SQLite operations**: Implementar idempotência no POST via tabela `IdempotencyKey` com `key UNIQUE` e `requestHash` para detectar conflito de payload.

Cole **inteiro**:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Simulation {
  id                   String   @id @default(cuid())
  name                 String

  initialAmount        Float
  monthlyContribution  Float?
  months               Int

  fixedAnnualRate      Float?   // decimal (0.12 = 12%)
  variableAnnualReturn Float?   // decimal
  variableVolatility   Float?   // decimal (0.25 = 25%)

  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  result               SimulationResult?
}

model SimulationResult {
  id                 String   @id @default(cuid())
  simulationId       String   @unique
  simulation         Simulation @relation(fields: [simulationId], references: [id], onDelete: Cascade)

  fixedSeriesJson      String
  variableSeriesJson   String

  fixedFinalGross      Float
  fixedFinalNet        Float
  variableFinalMean    Float

  taxesJson            String   // {days,grossIncome,iofPercent,iof,irRate,ir,netIncome,finalNet}
  metaJson             String   // {diffAbs,diffPercent,p10,p90,assumptions}

  createdAt           DateTime @default(now())
}

model IdempotencyKey {
  id           String   @id @default(cuid())
  key          String   @unique
  requestHash  String
  simulationId String   @unique
  createdAt    DateTime @default(now())
}
```

### 3.3 Prisma client singleton — `src/server/db/prisma.ts`
Cole:

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
```

### 3.4 Dependências + scripts
Instale:

```bash
npm i prisma @prisma/client zod
npm i -D vitest @vitest/coverage-v8
```

Adicione scripts no `package.json`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "coverage": "vitest run --coverage"
  }
}
```

### 3.5 Migrations
Rodar:

```bash
npx prisma migrate dev --name init
```

---

## 4) Domínio (cálculos puros e testáveis)
### 4.1 Tipos — `src/domain/types.ts`
Definir tipos de série e payloads (MoneySeriesPoint etc.).

### 4.2 Conversão anual → mensal
Implementar:

- `annualToMonthlyRate(annualRateDecimal): number`
- Fórmula: `(1 + annualRate)^(1/12) - 1`

### 4.3 Renda fixa (juros compostos + aportes)
Implementar:

- `simulateFixedIncome({ initialAmount, monthlyContribution, months, annualRate })`
- Loop mensal:
  - `interest = balance * taxaMensal`
  - `balance = balance + interest + aporte`
- Retornar:
  - `series[]`
  - `finalGross`
  - `totalContributed`

### 4.4 Impostos renda fixa (IOF + IR) — ORDEM CORRETA
Premissa de dias:
- `days = months * 30` (**documentar no README**)

Regras:
- **IOF regressivo** (1..30 dias) sobre o rendimento bruto
  - Dia 1 = 96%, Dia 2 = 93% ... Dia 29 = 12%, Dia 30+ = 0%
- **IR por faixa**:
  - Até 180 dias: 22,5%
  - 181..360: 20%
  - 361..720: 17,5%
  - >720: 15%
- **Ordem obrigatória**:
  1) IOF sobre rendimento bruto
  2) IR sobre (rendimento bruto - IOF)

### 4.5 Renda variável (Monte Carlo) — diferencial
Implementar:
- `simulateVariableIncome(input, { paths=1000, seed=42, returnBands=true })`
- Retorno esperado:
  - Série média mês a mês (`seriesMean`)
  - Final médio (`finalMean`)
  - Diferencial: P10 e P90 finais (`p10Final`, `p90Final`)
- Seed determinístico para reprodutibilidade e testes.

### 4.6 Comparação
Calcular:
- `diffAbs = variableFinalMean - fixedFinalNet`
- `diffPercent = diffAbs / fixedFinalNet * 100`

---

## 5) Server Layer (DTO + Repository + Service) — com Idempotency
### 5.1 DTO (Zod) — `src/server/simulations/dto.ts`
Regras:
- `name` 1..120
- `initialAmount` > 0
- `monthlyContribution` >= 0 (default 0)
- `months` inteiro > 0
- Taxas em decimal

Exemplo (colável):
```ts
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
```

### 5.2 Service idempotente (transaction + sha256) — `src/server/simulations/service.ts`
**Contrato de idempotência (POST):**
- Header **obrigatório**: `Idempotency-Key: <uuid>`
- Se já existe:
  - `requestHash` igual ⇒ retornar resultado existente (**replay**, sem duplicar)
  - `requestHash` diferente ⇒ `409 Conflict`

Cole este snippet base (ajuste imports/paths conforme seu projeto):

```ts
import crypto from "crypto";
import { prisma } from "../db/prisma";
import { SimulationCreateSchema } from "./dto";
import { simulateFixedIncome } from "@/domain/calculators/fixedIncome";
import { applyFixedIncomeTaxes } from "@/domain/calculators/taxes";
import { simulateVariableIncome } from "@/domain/calculators/variableIncome";

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

  return prisma.$transaction(async (tx) => {
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
```

---

## 6) API (Route Handlers) — POST idempotente + CRUD
### 6.1 POST /api/simulations — `src/app/api/simulations/route.ts`
Respostas:
- 201 created (novo)
- 200 replay
- 409 conflict (key com payload diferente)

```ts
import { NextResponse } from "next/server";
import { createSimulationIdempotent } from "@/server/simulations/service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = req.headers.get("Idempotency-Key") || "";

    const { simulation, replay } = await createSimulationIdempotent(body, key);

    return NextResponse.json(
      { success: true, data: simulation },
      { status: replay ? 200 : 201 }
    );
  } catch (err: any) {
    const status = err?.status ?? 400;
    return NextResponse.json(
      { success: false, error: err?.message ?? "Erro ao criar simulação" },
      { status }
    );
  }
}
```

### 6.2 GET /api/simulations (histórico)
Implementar no mesmo arquivo:
- buscar no Prisma, ordenar por createdAt desc, retornar resumo (id, name, createdAt, fixedFinalNet, variableFinalMean).

### 6.3 GET/DELETE /api/simulations/:id — `src/app/api/simulations/[id]/route.ts`
- GET detalhe
- DELETE excluir (204)

---

## 7) UI
- Form gera UUID para `Idempotency-Key` e previne double submit.
- Exibir cards, impostos e gráfico.
- Diferencial: exibir P10/P90.

---

## 8) Testes (Vitest)
- Criar `vitest.config.ts`
- Cobrir domínio:
  - annualToMonthlyRate
  - taxes (iof/ir/apply com exemplo numérico)
  - fixedIncome
  - variableIncome determinístico (seed)
  - p10 <= mean <= p90

---

## 9) README snippet (para Copilot gerar o README.md) — COM prompts obrigatórios
> Copie este bloco e mande o Copilot gerar `README.md` (com ferramentas e prompts):

```md
# Calculadora de Investimentos — Next.js + Route Handlers + SQLite (Prisma)

Projeto de simulação e comparação entre **Renda Fixa** e **Renda Variável**, com persistência local (SQLite) e backend embutido no Next.js via Route Handlers.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Route Handlers (`/app/api/**`)
- SQLite local via Prisma (migrations versionadas)
- Zod (validação)
- Vitest (testes unitários do core)
- Recharts (gráficos)

## Arquitetura
- `src/domain/**`: cálculos e regras (funções puras e testáveis)
- `src/server/**`: Prisma + services + repos (server-only)
- `src/app/api/**`: endpoints (Route Handlers)
- `src/app/**` e `src/components/**`: UI

## Como rodar
```bash
npm i
npx prisma migrate dev --name init
npm run dev
npm run test
```

Crie `.env`:
```env
DATABASE_URL="file:./dev.db"
```

## API
### POST /api/simulations (idempotente)
Header obrigatório:
- `Idempotency-Key: <uuid>`

Respostas:
- 201: criou novo
- 200: replay idempotente (mesma key + mesmo payload)
- 409: mesma key com payload diferente

### GET /api/simulations
Lista histórico

### GET /api/simulations/:id
Detalhe

### DELETE /api/simulations/:id
Exclui

## Premissas e regras
### Anual → mensal
`rm = (1 + taxaAnual)^(1/12) - 1`

### Renda fixa
Juros compostos com aporte mensal, série mês a mês.

### Impostos (renda fixa)
Premissa de dias: `days = months * 30`  
IOF regressivo (1..30 dias) e IR por faixa.
Ordem: **IOF sobre rendimento bruto → IR sobre (rendimento - IOF)**.

### Renda variável (Monte Carlo)
Monte Carlo com distribuição Normal mensal:
- `retMensal = (1 + retAnual)^(1/12) - 1`
- `volMensal = volAnual / sqrt(12)`
Seed determinístico para reprodutibilidade.
Diferencial: P10/P90.

## Idempotência (Idempotent SQLite operations)
Para evitar duplicidade no POST, foi implementada idempotência baseada em:
- Header `Idempotency-Key`
- Tabela `IdempotencyKey` com `key UNIQUE` e `requestHash`
- Mesma key + payload igual => retorna o mesmo resultado
- Mesma key + payload diferente => 409 Conflict

## Diferenciais
- Idempotência no POST com constraints no SQLite/Prisma
- Monte Carlo seed determinístico
- P10/P90 (risco)
- Persistência completa (inputs + outputs)
- Core isolado + testes Vitest

## Ferramentas de IA/LLM utilizadas
- **ChatGPT (Copilot Chat / ChatGPT-4.1)**: usado para acelerar a definição de arquitetura, geração dos módulos de domínio (cálculos), implementação da idempotência e estruturação dos testes unitários.
- **GitHub Copilot**: usado como assistente inline para boilerplate (DTOs, repositories, componentes UI) e refactors.

⚠️ **OBRIGATÓRIO:** os prompts utilizados estão listados abaixo e devem ser enviados junto com o projeto.

## PROMPTS de IA utilizados (OBRIGATÓRIO)

### Prompt 1 — Prisma + SQLite + schema + IdempotencyKey
Configure Prisma com SQLite no Next.js App Router:
- `.env` com DATABASE_URL=file:./dev.db
- `prisma/schema.prisma` com models Simulation, SimulationResult e IdempotencyKey (key UNIQUE, requestHash, simulationId UNIQUE)
- `src/server/db/prisma.ts` singleton
- scripts no package.json: prisma:generate, prisma:migrate, prisma:studio

### Prompt 2 — Domínio (annualRate + fixedIncome + taxes + variableIncome)
Implemente em `src/domain/**`:
- annualToMonthlyRate
- simulateFixedIncome (série mensal)
- getIofPercent, getIrRate, applyFixedIncomeTaxes (IOF antes do IR)
- simulateVariableIncome Monte Carlo (Normal Box-Muller) com seed determinístico (LCG), retornando média e P10/P90
Exporte tudo em `src/domain/calculators/index.ts`.

### Prompt 3 — Service idempotente (transaction + sha256)
Crie `src/server/simulations/service.ts`:
- Ler header Idempotency-Key
- Calcular requestHash (sha256 do payload)
- Em transaction:
  - Se key existe e hash bate => replay (200) retornando registro existente
  - Se key existe e hash diferente => 409 Conflict
  - Se key não existe => criar simulation + result + registrar idempotencyKey
Persistir series/taxes/meta como JSON string.

### Prompt 4 — Route Handlers (CRUD + status codes)
Implemente:
- `src/app/api/simulations/route.ts` (POST idempotente e GET list)
- `src/app/api/simulations/[id]/route.ts` (GET detail e DELETE)
Retornar 201/200/409/404/204 corretamente e padronizar `{ success, data }`.

### Prompt 5 — UI (form + resultados + gráfico + histórico)
Implemente:
- Form que gera uuid para Idempotency-Key e previne double submit
- Cards (fixedNet, variableMean, diff%)
- TaxesTable (IOF/IR)
- Chart (fixo vs variável) e exibir P10/P90
- Páginas `/`, `/simulations`, `/simulations/[id]`

### Prompt 6 — Vitest (core financeiro)
Configure Vitest e crie testes:
- annualToMonthlyRate
- taxes (iof/ir/apply) com exemplo numérico validando ordem IOF→IR
- fixedIncome
- variableIncome determinístico por seed + validação P10 <= mean <= P90
Scripts: test, test:watch, coverage
```