"use client";

import { useState, useMemo, useCallback } from "react";
import { calculate, formatCurrency } from "@/lib/calculations";

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function defaultEnd() {
  return formatDate(new Date());
}

function parseSalary(raw: string): number {
  const sanitized = raw.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}

function formatSalaryForDisplay(n: number): string {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Calculator() {
  const [annualSalary, setAnnualSalary] = useState(0);
  const [salaryInput, setSalaryInput] = useState("");
  const [salaryFocused, setSalaryFocused] = useState(false);
  const [startDate, setStartDate] = useState("2025-06-02");
  const [endDate, setEndDate] = useState(defaultEnd());
  const [vacationTaken, setVacationTaken] = useState(0);

  const salaryDisplay = salaryFocused
    ? salaryInput
    : formatSalaryForDisplay(annualSalary);

  const results = useMemo(
    () => calculate(annualSalary, new Date(startDate + "T00:00:00"), new Date(endDate + "T23:59:59"), vacationTaken),
    [annualSalary, startDate, endDate, vacationTaken]
  );

  const handleSalaryFocus = useCallback(() => {
    setSalaryFocused(true);
    setSalaryInput(annualSalary === 0 ? "" : annualSalary.toString().replace(".", ","));
  }, [annualSalary]);

  const handleSalaryBlur = useCallback(() => {
    setSalaryFocused(false);
    const parsed = parseSalary(salaryInput);
    setAnnualSalary(parsed);
  }, [salaryInput]);

  const handleSalaryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryInput(e.target.value);
  }, []);

  const handleVacationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!isNaN(v)) setVacationTaken(Math.max(0, v));
  }, []);

  return (
    <main className="h-screen overflow-y-auto bg-zinc-50 p-6 font-[family-name:var(--font-geist-sans),system-ui,sans-serif] select-none">
      <div className="max-w-2xl lg:max-w-3xl mx-auto flex flex-col gap-5 pb-10">

        <header>
          <h1 className="text-lg font-medium text-zinc-900 tracking-tight">
            💸 Indemnización por despido
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1">
            Según baremos del Poder Judicial
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="bg-white rounded-xl border border-zinc-200 px-4 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Salario bruto anual
            </span>
            <span className="flex items-baseline gap-1">
              <input
                type="text"
                inputMode="decimal"
                value={salaryDisplay}
                onChange={handleSalaryChange}
                onFocus={handleSalaryFocus}
                onBlur={handleSalaryBlur}
                className="w-full text-[15px] font-medium text-zinc-900 bg-transparent outline-none tabular-nums border border-zinc-200 rounded-md px-2 py-0.5 focus:border-zinc-300"
              />
              <span className="text-sm text-zinc-400 shrink-0">€</span>
            </span>
          </label>

          <label className="bg-white rounded-xl border border-zinc-200 px-4 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Vacaciones disfrutadas
            </span>
            <span className="flex items-baseline gap-1">
              <input
                type="number"
                min={0}
                value={vacationTaken}
                onChange={handleVacationChange}
                className="w-12 text-[15px] font-medium text-zinc-900 bg-transparent outline-none tabular-nums border border-zinc-200 rounded-md px-1.5 py-0.5 focus:border-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                / {results?.vacationEarned?.toFixed(1)?.replace(".", ",") ?? "0,0"} gener.
              </span>
            </span>
          </label>

          <label className="bg-white rounded-xl border border-zinc-200 px-4 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Inicio contrato
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full min-w-0 text-[15px] font-medium text-zinc-900 bg-transparent outline-none border border-zinc-200 rounded-md px-2 py-0.5 focus:border-zinc-300"
            />
          </label>

          <label className="bg-white rounded-xl border border-zinc-200 px-4 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Fin contrato
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full min-w-0 text-[15px] font-medium text-zinc-900 bg-transparent outline-none border border-zinc-200 rounded-md px-2 py-0.5 focus:border-zinc-300"
            />
          </label>
        </div>

        {results ? (
          <>
            <div className="grid grid-cols-3 text-center text-xs bg-white rounded-xl border border-zinc-200 divide-x divide-zinc-100 py-2.5">
              <span className="text-zinc-500">Salario diario <strong className="text-zinc-900 ml-1">{formatCurrency(results.dailySalary)}</strong></span>
              <span className="text-zinc-500">Días trabajados <strong className="text-zinc-900 ml-1">{results.daysWorked.toLocaleString("es-ES")}</strong></span>
              <span className="text-zinc-500">Meses comp. <strong className="text-zinc-900 ml-1">{results.monthsWorked.toLocaleString("es-ES")}</strong></span>
            </div>

            <div className="flex flex-col gap-3">

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Despido improcedente</p>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-medium text-zinc-800">Despido improcedente / voluntad del trabajador</span>
              </div>
              <span className="text-[14px] font-semibold text-zinc-700 tabular-nums ml-4 shrink-0">{formatCurrency(results.despidoImprocedente)}</span>
            </div>
            <div className="px-4 py-1.5 border-t border-zinc-50 bg-zinc-50/30">
              <p className="text-[10px] text-zinc-400">Salario diario × meses × 2,75</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Procedente</p>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-zinc-800">Causas objetivas, colectivo, geográfica, sustancial, violencia</span>
              <span className="text-[14px] font-semibold text-zinc-700 tabular-nums ml-4 shrink-0">{formatCurrency(results.extincionCausasObjetivas)}</span>
            </div>
            <div className="px-4 py-1.5 border-t border-zinc-50 bg-zinc-50/30">
              <p className="text-[10px] text-zinc-400">Salario diario × meses × 20 / 12</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Finiquito</p>
            </div>
            <div className="px-4 py-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500">Vacaciones no disfrutadas</span>
                <span className="text-[12px] text-zinc-700 tabular-nums">
                  {results.vacationUnused.toFixed(1).replace(".", ",")} días
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500">Bruto vacaciones</span>
                <span className="text-[12px] font-medium text-zinc-700 tabular-nums">{formatCurrency(results.finiquitoBruto)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-400">
                  Retención IRPF {(results.effectiveIRPFRate * 100).toFixed(1).replace(".", ",")}% estimado
                </span>
                <span className="text-[12px] text-zinc-400 tabular-nums">−{formatCurrency(results.finiquitoIRPF)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[13px] font-medium text-zinc-900">Neto estimado</span>
                <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.finiquitoNeto)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[12px] text-zinc-500">Improcedente + finiquito</span>
                <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.improcedenteFiniquito)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-500">Procedente + finiquito</span>
                <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.procedenteFiniquito)}</span>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="text-center py-16 text-zinc-400 text-sm">
            Introduce tus datos para ver los resultados
          </div>
        )}
      </div>
    </main>
  );
}
