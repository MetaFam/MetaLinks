"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Inter as FontSans } from "next/font/google";
import { client } from "@/services/apollo";
import { ApolloProvider } from "@apollo/client";
import { cn } from "@/lib/utils";
import "./globals.css";
import Script from "next/script";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, polygon],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MAINNET}`
      ),
      [polygon.id]: http(
        `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_POLYGON}`
      ),
    },

    // Required API Keys
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

    // Required App Info
    appName: "MetaLinks",

    // Optional App Info
    appDescription: "A great app",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();

  return (
    <html lang="en">
      <ApolloProvider client={client}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Script
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GAID}`}
                  strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                  {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${process.env.NEXT_PUBLIC_GAID}', {
                page_path: window.location.pathname,
              });
            `}
                </Script>
                <body
                  className={cn("font-sans antialiased", fontSans.variable)}
                >
                  {/* <Navbar /> */}
                  {children}
                </body>
              </ThemeProvider>
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ApolloProvider>
    </html>
  );
}
