import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useSession, signIn, signOut } from "next-auth/react";
import React from "react";
import styles from "../styles/Home.module.css";

export default function SignIn() {
  const address = useAddress();
  const { data: session } = useSession();

  // 1. The user is signed into discord and connected to wallet.
  if (session && address) {
    return (
      <div className={styles.bigSpacerTop}>
        <a onClick={() => signOut()} className={styles.secondaryButton}>
          Sign out of Discord
        </a>
      </div>
    );
  }

  // 2. Connect Wallet
  if (!address) {
    return (
      <div className={styles.main}>
        <h2 className={styles.noGapBottom}>Connect Your Wallet</h2>
        <p>Connect your wallet to check eligibility.</p>
        <ConnectWallet accentColor="#F213A4" colorMode="dark" />
      </div>
    );
  }

  // 3. Connect with Discord (OAuth)
  if (!session) {
    return (
      <div className={`${styles.main}`}>
        <h2 className={styles.noGapBottom}>Sign In with Discord</h2>
        <p>Sign In with Discord to check your eligibility for the NFT!</p>

        <button
          onClick={() => signIn("discord")}
          className={`${styles.mainButton} ${styles.spacerTop}`}
        >
          Connect Discord
        </button>
      </div>
    );
  }

  return null;
}
