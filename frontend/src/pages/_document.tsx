import { Html, Head, Main, NextScript } from "next/document";
import { ThemeProvider } from "@/lib/ThemeProvider";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
