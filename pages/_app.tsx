import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { SessionProvider } from "next-auth/react";
import ThirdwebGuideFooter from "../components/ThirdwebGuideFooter";
import "../styles/globals.css";

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
        <ThirdwebGuideFooter />
      </SessionProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
