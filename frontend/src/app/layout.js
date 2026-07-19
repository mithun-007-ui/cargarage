import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "src/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "AutoCare Pro | Premium Vehicle Service & Management",
  description: "Experience transparent, high-quality, and hassle-free automotive servicing. Get real-time health reports, instant approvals, and expert maintenance for your vehicle.",
  keywords: "car repair, vehicle service, auto maintenance, oil change, brake repair, car health report",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
