import { useAddress, useUser } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import SignIn from "../components/SignIn";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();
  const { data: session } = useSession();
  const { user, isLoggedIn } = useUser();

  async function requestGrantRole() {
    // Then make a request to our API endpoint.
    try {
      const response = await fetch("/api/grant-role", {
        method: "POST",
      });
      const data = await response.json();
      console.log(data);
      alert("Check the console for the response!");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className={styles.container} style={{ marginTop: 0 }}>
        <SignIn />

        {address && isLoggedIn && session && (
          <div className={styles.collectionContainer}>
            <button className={styles.mainButton} onClick={requestGrantRole}>
              Give me the role!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
