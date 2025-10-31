import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { Providers } from "./providers";
import { WalletButton } from "@/components/WalletButton";
import { TabNavigation, FaucetButton } from "@/components/TabNavigation";

export const metadata: Metadata = {
  title: "Encare - Secure Health Analysis",
  description: "Encare - Privacy-preserving health risk assessment powered by FHE technology",
  icons: {
    icon: "/logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="bg-primary text-foreground antialiased" suppressHydrationWarning>
        <div className="fixed inset-0 w-full h-full bg-primary z-[-20] min-w-[850px]" />
        
        <main className="flex flex-col w-full min-h-screen" suppressHydrationWarning>
          <Providers>
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-fit py-2.5 flex justify-center items-center bg-header text-gray-900 z-50 border-b border-custom">
              <div className="w-[90%] flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 h-[42px]">
                    <Image src="/logo.svg" alt="Encare Logo" width={42} height={42} className="h-[42px] w-auto" />
                    <h1 className="text-[32px] font-bold text-gray-900">
                      Encare
                    </h1>
                  </div>
                  <TabNavigation />
                </div>
                <div className="flex items-center gap-4">
                  <FaucetButton />
                  <WalletButton />
                </div>
              </div>
            </header>

            {/* Main */}
            <div className="main flex-1 w-full overflow-y-auto pt-20 bg-primary">
              <div className="w-[80%] mx-auto px-3 md:px-6">
                {children}
              </div>
            </div>
          </Providers>
        </main>
      </body>
    </html>
  );
}
