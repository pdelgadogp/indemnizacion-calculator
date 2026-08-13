export interface Results {
  dailySalary: number;
  daysWorked: number;
  monthsWorked: number;
  vacationEarned: number;
  vacationUnused: number;
  effectiveIRPFRate: number;
  despidoImprocedente: number;
  extincionVoluntadTrabajador: number;
  extincionCausasObjetivas: number;
  despidoColectivoProcedente: number;
  movilidadGeografica: number;
  modificacionSustancial: number;
  violenciaGenero: number;
  extincionContratoTemporal: number;
  vacacionesBruto: number;
  pagaVerano: number;
  pagaNavidad: number;
  pagasExtra: number;
  finiquitoBruto: number;
  finiquitoIRPF: number;
  finiquitoNeto: number;
  improcedenteFiniquito: number;
  procedenteFiniquito: number;
}

function dateDiffDays(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function daysInYear(date: Date): number {
  const y = date.getFullYear();
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
}

function calcEffectiveIRPFRate(annualSalary: number): number {
  const brackets = [
    { limit: 12450, rate: 0.18 },
    { limit: 20200, rate: 0.2285 },
    { limit: 35200, rate: 0.2835 },
    { limit: 60000, rate: 0.3575 },
    { limit: 300000, rate: 0.4375 },
    { limit: Infinity, rate: 0.50 },
  ];

  let remaining = annualSalary;
  let totalTax = 0;
  let prevLimit = 0;

  for (const b of brackets) {
    const amountInBracket = Math.min(remaining, b.limit - prevLimit);
    if (amountInBracket <= 0) break;
    totalTax += amountInBracket * b.rate;
    remaining -= amountInBracket;
    prevLimit = b.limit;
  }

  return Math.round((totalTax / annualSalary) * 10000) / 10000;
}

function calcPagasExtra(endDate: Date, pagaMonto: number): { verano: number; navidad: number } {
  const y = endDate.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const jun30 = new Date(y, 5, 30);
  const jul1 = new Date(y, 6, 1);
  const dec31 = new Date(y, 11, 31);

  const sem1 = dateDiffDays(jan1, jun30) + 1;
  const sem2 = dateDiffDays(jul1, dec31) + 1;

  let verano = 0;
  let navidad = 0;

  if (endDate.getTime() <= jun30.getTime()) {
    verano = (dateDiffDays(jan1, endDate) + 1) / sem1;
  } else {
    verano = 1;
    navidad = (dateDiffDays(jul1, endDate) + 1) / sem2;
  }

  return { verano: pagaMonto * verano, navidad: pagaMonto * navidad };
}

export function calculate(
  annualSalary: number,
  startDate: Date,
  endDate: Date,
  vacationTaken: number,
  numPagas: number = 14,
  vacacionesAnuales: number = 30,
  cobradaVerano: boolean = false,
  cobradaNavidad: boolean = false
): Results | null {
  if (annualSalary < 0 || !startDate || !endDate) return null;
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

  const daysWorked = dateDiffDays(startDate, endDate) + 1;
  if (daysWorked <= 0) return null;

  const dailySalary = annualSalary / 365;
  const monthsWorked = Math.ceil(daysWorked / 30);

  const despidoImprocedente = dailySalary * monthsWorked * 2.75;
  const extincionVoluntadTrabajador = dailySalary * monthsWorked * 2.75;
  const fProcedente = dailySalary * monthsWorked * (20 / 12);
  const extincionContratoTemporal = dailySalary * daysWorked * (12 / 365);

  const currentYearDays = dateDiffDays(new Date(endDate.getFullYear(), 0, 1), endDate) + 1;
  const yearTotalDays = daysInYear(endDate);
  const vacationEarned = (currentYearDays / yearTotalDays) * vacacionesAnuales;
  const vacationUnused = Math.max(0, vacationEarned - vacationTaken);
  const vacacionesBruto = dailySalary * vacationUnused;

  const pagaExtraMonto = annualSalary / numPagas;
  const { verano, navidad } = numPagas > 12 ? calcPagasExtra(endDate, pagaExtraMonto) : { verano: 0, navidad: 0 };
  const pagaVerano = cobradaVerano ? 0 : verano;
  const pagaNavidad = cobradaNavidad ? 0 : navidad;
  const pagasExtra = pagaVerano + pagaNavidad;
  const finiquitoBruto = vacacionesBruto + pagasExtra;

  const effectiveIRPFRate = calcEffectiveIRPFRate(annualSalary);
  const finiquitoIRPF = finiquitoBruto * effectiveIRPFRate;
  const finiquitoNeto = finiquitoBruto - finiquitoIRPF;

  const r = (n: number) => Math.round(n * 100) / 100;

  return {
    dailySalary: r(dailySalary),
    daysWorked,
    monthsWorked,
    vacationEarned: r(vacationEarned),
    vacationUnused: r(vacationUnused),
    effectiveIRPFRate,
    despidoImprocedente: r(despidoImprocedente),
    extincionVoluntadTrabajador: r(extincionVoluntadTrabajador),
    extincionCausasObjetivas: r(fProcedente),
    despidoColectivoProcedente: r(fProcedente),
    movilidadGeografica: r(fProcedente),
    modificacionSustancial: r(fProcedente),
    violenciaGenero: r(fProcedente),
    extincionContratoTemporal: r(extincionContratoTemporal),
    vacacionesBruto: r(vacacionesBruto),
    pagaVerano: r(pagaVerano),
    pagaNavidad: r(pagaNavidad),
    pagasExtra: r(pagasExtra),
    finiquitoBruto: r(finiquitoBruto),
    finiquitoIRPF: r(finiquitoIRPF),
    finiquitoNeto: r(finiquitoNeto),
    improcedenteFiniquito: r(despidoImprocedente + finiquitoNeto),
    procedenteFiniquito: r(fProcedente + finiquitoNeto),
  };
}

export function formatCurrency(n: number): string {
  if (isNaN(n)) n = 0;
  const sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  const intPart = Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = Math.round((n - Math.floor(n)) * 100).toString().padStart(2, "0");
  return sign + intPart + "," + decPart + " €";
}

export function formatInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("es-ES").format(n);
}
