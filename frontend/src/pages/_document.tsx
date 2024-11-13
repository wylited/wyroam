import { Html, Head, Main, NextScript } from "next/document";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
        <Toaster />
      </body>
    </Html>
  );
}
