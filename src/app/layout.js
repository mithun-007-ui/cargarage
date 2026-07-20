import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "src/context/AuthContext";
import { BookingProvider } from "src/context/BookingContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Bug Slayers | Premium Car Service Garage",
  description: "Experience transparent, high-quality, and hassle-free automotive servicing. Get real-time health reports, instant approvals, and expert maintenance for your vehicle.",
  keywords: "car repair, vehicle service, auto maintenance, oil change, brake repair, car health report, Bug Slayers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F5F0] text-[#202020] font-sans">
        <AuthProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
