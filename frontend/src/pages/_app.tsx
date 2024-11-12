import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NodeProvider } from '@/lib/NodeContext';
import { ThemeProvider } from "@/lib/ThemeProvider";
import { TabProvider } from '@/lib/TabContext';
export default function App({ Component, pageProps }: AppProps) {
    return (
        <NodeProvider>
            <TabProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Component {...pageProps} />
                </ThemeProvider>
            </TabProvider>
        </NodeProvider>
    );
}
