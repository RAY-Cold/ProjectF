import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/providers/WalletProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fortify DeFi - Risk-aware DeFi with built-in insurance',
  description: 'Unified DeFi protocol combining yield vaults, lending, and on-chain insurance with shared risk engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <WalletProvider>
          <ThemeProvider>
            <ToastProvider>
              <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </WalletProvider>
      </body>
    </html>
  );
}

