import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indemnización",
  description: "Cálculo actualizado de indemnizaciones laborales por extinción de contrato",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💸</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-zinc-50 text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
