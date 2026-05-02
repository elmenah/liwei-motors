import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liwei Motors | Scooters y Triciclos Eléctricos",
  description:
    "Liwei Motors: líderes en movilidad eléctrica. Scooters y triciclos eléctricos para uso urbano, comercial e industrial.",
  keywords: "scooters eléctricos, triciclos eléctricos, movilidad eléctrica, Liwei Motors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
