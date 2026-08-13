"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { calculate, formatCurrency, formatInt } from "@/lib/calculations";

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
  const intPart = Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = Math.round((n - Math.floor(n)) * 100).toString().padStart(2, "0");
  return intPart + "," + decPart;
}

export default function Calculator() {
  const [annualSalary, setAnnualSalary] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("salario");
      if (saved) return parseFloat(saved) || 0;
    }
    return 0;
  });
  const [salaryInput, setSalaryInput] = useState("");
  const [salaryFocused, setSalaryFocused] = useState(false);
  const [startDate, setStartDate] = useState("2025-06-02");
  const [endDate, setEndDate] = useState(defaultEnd());
  const [vacationTaken, setVacationTaken] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vacaciones");
      if (saved) return parseInt(saved, 10) || 0;
    }
    return 0;
  });
  const [numPagas, setNumPagas] = useState(14);
  const [vacacionesAnuales, setVacacionesAnuales] = useState(30);
  const [cobradaVerano, setCobradaVerano] = useState(false);
  const [cobradaNavidad, setCobradaNavidad] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("salario", annualSalary.toString());
  }, [annualSalary]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("vacaciones", vacationTaken.toString());
  }, [vacationTaken]);

  const salaryDisplay = salaryFocused
    ? salaryInput
    : formatSalaryForDisplay(annualSalary);

  const results = useMemo(
    () => calculate(
      annualSalary,
      new Date(startDate + "T00:00:00"),
      new Date(endDate + "T23:59:59"),
      vacationTaken,
      numPagas,
      vacacionesAnuales,
      cobradaVerano,
      cobradaNavidad
    ),
    [annualSalary, startDate, endDate, vacationTaken, numPagas, vacacionesAnuales, cobradaVerano, cobradaNavidad]
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

  const handleVacacionesAnualesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (!isNaN(v)) setVacacionesAnuales(Math.max(0, v));
  }, []);

  return (
    <main className="h-screen overflow-y-auto bg-zinc-50 p-6 font-[family-name:var(--font-geist-sans),system-ui,sans-serif]">
      <div className="max-w-2xl lg:max-w-4xl mx-auto flex flex-col gap-5 pb-10">

        <header>
          <h1 className="text-lg font-medium text-zinc-900 tracking-tight">
            💸 Indemnización por despido
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1">
            Según baremos del Poder Judicial
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <label className="bg-white rounded-xl border border-zinc-200 px-2 lg:px-3 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all overflow-hidden lg:overflow-visible">
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
                className="w-full text-[14px] font-medium text-zinc-900 bg-transparent outline-none tabular-nums border border-zinc-200 rounded-md px-2 py-1 focus:border-zinc-300 h-9 box-border"
              />
              <span className="text-[14px] text-zinc-400 shrink-0">€</span>
            </span>
          </label>

          <label className="bg-white rounded-xl border border-zinc-200 px-2 lg:px-3 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all overflow-hidden lg:overflow-visible">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Vacaciones <span className="lg:hidden">disfr.</span><span className="hidden lg:inline">disfrutadas</span>
            </span>
            <span className="flex items-baseline gap-1">
              <input
                type="number"
                min={0}
                value={vacationTaken}
                onChange={handleVacationChange}
                className="w-12 text-[14px] font-medium text-zinc-900 bg-transparent outline-none tabular-nums border border-zinc-200 rounded-md px-1.5 py-1 focus:border-zinc-300 h-9 box-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                / {results?.vacationEarned?.toFixed(1)?.replace(".", ",") ?? "0,0"} gener.
              </span>
            </span>
          </label>

          <label className="bg-white rounded-xl border border-zinc-200 px-2 lg:px-3 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all overflow-hidden lg:overflow-visible">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Inicio contrato
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
className="w-full min-w-0 text-xs lg:text-[15px] font-medium text-zinc-900 bg-transparent outline-none truncate ring-1 ring-inset ring-zinc-200 rounded px-1 py-0.5 lg:ring-0 lg:border lg:border-zinc-200 lg:rounded-md lg:px-2 lg:py-1 lg:h-9 lg:box-border lg:appearance-none lg:focus:border-zinc-300"
              />
          </label>

          <label className="bg-white rounded-xl border border-zinc-200 px-2 lg:px-3 py-3 focus-within:border-zinc-300 focus-within:shadow-sm transition-all overflow-hidden lg:overflow-visible">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              Fin contrato
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
className="w-full min-w-0 text-xs lg:text-[15px] font-medium text-zinc-900 bg-transparent outline-none truncate ring-1 ring-inset ring-zinc-200 rounded px-1 py-0.5 lg:ring-0 lg:border lg:border-zinc-200 lg:rounded-md lg:px-2 lg:py-1 lg:h-9 lg:box-border lg:appearance-none lg:focus:border-zinc-300"
              />
          </label>
        </div>

        {results ? (
          <>
        <div className="grid grid-cols-2 lg:grid-cols-5 text-center text-xs bg-white rounded-xl border border-zinc-200 divide-x divide-zinc-100 py-2.5 [&>span]:flex [&>span]:flex-col [&>span]:items-center [&>span]:justify-center [&>span]:gap-0.5">
          <span className="text-zinc-500">Salario diario <strong className="text-zinc-900 text-[14px] font-semibold">{formatCurrency(results.dailySalary)}</strong></span>
          <span className="text-zinc-500">Días trabajados <strong className="text-zinc-900 text-[14px] font-semibold">{formatInt(results.daysWorked)}</strong></span>
          <span className="text-zinc-500"><span className="lg:hidden">Meses comp.</span><span className="hidden lg:inline">Meses computables</span> <strong className="text-zinc-900 text-[14px] font-semibold">{formatInt(results.monthsWorked)}</strong></span>
          <span className="text-zinc-500">
            Nº pagas
            <select
              value={numPagas}
              onChange={(e) => setNumPagas(Number(e.target.value))}
              className="text-[14px] font-medium text-zinc-900 bg-transparent outline-none border border-zinc-200 rounded-md px-1.5 py-0.5 focus:border-zinc-300"
            >
              <option value={12}>12</option>
              <option value={14}>14</option>
            </select>
          </span>
          <span className="text-zinc-500">
            Vacaciones/año
            <input
              type="number"
              min={0}
              value={vacacionesAnuales}
              onChange={handleVacacionesAnualesChange}
              className="w-12 text-center text-[14px] font-medium text-zinc-900 bg-transparent outline-none border border-zinc-200 rounded-md px-1 py-0.5 focus:border-zinc-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </span>
        </div>

            <div className="flex flex-col gap-3">

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/80">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Despido improcedente</p>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-medium text-zinc-800">Despido improcedente / extinción por incumplimiento del empresario</span>
              </div>
              <span className="text-[14px] font-semibold text-zinc-700 tabular-nums ml-4 shrink-0">
                {formatCurrency(results.despidoImprocedente)}
              </span>
            </div>
            <div className="px-4 py-2 border-t border-zinc-50 space-y-2">
              <p className="text-[11px] leading-relaxed text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Sin acto de conciliación, la indemnización puede tributar a IRPF. Se asume que se acude a conciliación.
              </p>
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
                <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.vacacionesBruto)}</span>
              </div>
              {numPagas > 12 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-zinc-500">Paga verano (ene–jun)</span>
                    <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.pagaVerano)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-zinc-500">Paga navidad (jul–dic)</span>
                    <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.pagaNavidad)}</span>
                  </div>
                  <div className="pt-1.5 flex flex-col gap-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cobradaVerano}
                        onChange={(e) => setCobradaVerano(e.target.checked)}
                        className="h-3.5 w-3.5 accent-zinc-600"
                      />
                      <span className="text-[12px] text-zinc-600">Ya cobrada la paga de verano</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cobradaNavidad}
                        onChange={(e) => setCobradaNavidad(e.target.checked)}
                        className="h-3.5 w-3.5 accent-zinc-600"
                      />
                      <span className="text-[12px] text-zinc-600">Ya cobrada la paga de navidad</span>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-zinc-500">Pagas extra en finiquito</span>
                    <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.pagasExtra)}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-400">
                  Retención IRPF {(results.effectiveIRPFRate * 100).toFixed(1).replace(".", ",")}% estimado
                </span>
                <span className="text-[14px] font-semibold text-zinc-400 tabular-nums">−{formatCurrency(results.finiquitoIRPF)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[13px] font-medium text-zinc-900">Neto estimado</span>
                <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">{formatCurrency(results.finiquitoNeto)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[12px] text-zinc-500">Improcedente + finiquito</span>
                <span className="text-[14px] font-semibold text-zinc-700 tabular-nums">
                  {formatCurrency(results.improcedenteFiniquito)}
                </span>
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
