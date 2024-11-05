import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NodeProvider } from '@/lib/NodeContext';
import { ThemeProvider } from "@/lib/ThemeProvider";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <NodeProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <Component {...pageProps} />
            </ThemeProvider>
        </NodeProvider>
    );
}
