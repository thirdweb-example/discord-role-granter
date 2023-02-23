import { useAddress, useUser } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import SignIn from "../components/SignIn";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();
  const { data: session } = useSession();
  const { isLoggedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const requestGrantRole = async () => {
    // Then make a request to our API endpoint.
    try {
      setLoading(true);
      const response = await fetch("/api/grant-role", {
        method: "POST",
      });
      const data = await response.json();
      console.log(data);
      setMessage(data.message || data.error);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.container} style={{ marginTop: 0 }}>
        <SignIn />

        {address && isLoggedIn && session && (
          <div className={styles.collectionContainer}>
            <button className={styles.mainButton} onClick={requestGrantRole}>
              {loading ? "Loading..." : "Give me the role"}
            </button>
          </div>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Home;
