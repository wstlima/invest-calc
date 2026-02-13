import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { formatBRL } from "../lib/money";

export default function TaxesTable({ taxes }: { taxes: any }) {
  if (!taxes) return null;
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Impostos (renda fixa)</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-2 px-3 text-gray-600 font-medium">IOF %</td>
                  <td className="py-2 px-3 text-right text-gray-900">{taxes.iofPercent}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-600 font-medium">IOF</td>
                  <td className="py-2 px-3 text-right text-gray-900">{formatBRL(taxes.iof)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-600 font-medium">IR %</td>
                  <td className="py-2 px-3 text-right text-gray-900">{(taxes.irRate * 100)?.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-600 font-medium">IR</td>
                  <td className="py-2 px-3 text-right text-gray-900">{formatBRL(taxes.ir)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-600 font-medium">Rendimento Líquido</td>
                  <td className="py-2 px-3 text-right text-gray-900">{formatBRL(taxes.netIncome)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-blue-700 font-bold">Final Líquido</td>
                  <td className="py-2 px-3 text-right font-bold text-blue-700">{formatBRL(taxes.finalNet)}</td>
                </tr>
              </tbody>
            </table>
        </CardContent>
      </Card>
    </section>
  );
}