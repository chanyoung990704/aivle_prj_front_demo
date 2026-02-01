import type { Metadata } from "next";
import { Newsreader, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/shared/Sidebar";

const newsreader = Newsreader({
    subsets: ["latin"],
    variable: "--font-newsreader",
    display: "swap",
    style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

export const metadata: Metadata = {
    title: "SENTINEL | Financial Analytics",
    description: "Advanced financial data visualization platform",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <body
            className={`
          ${newsreader.variable} ${spaceGrotesk.variable} 
          font-sans antialiased 
          bg-paper text-ink min-h-screen
          bg-paper-gradient
        `}
        >
        <AuthProvider>
            <div className="flex">
                <Sidebar />
                <div className="flex-1 md:ml-64">
                    <div className="mx-auto max-w-[1200px] p-6 md:p-10">
                        {children}
                    </div>
                </div>
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}