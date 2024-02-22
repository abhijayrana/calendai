
"use client";
import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        console.log(result);
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
      }
    } catch (err:any) {
      console.error("error", err.errors[0].longMessage);
    }
  };

  // Inline styles for components
  const styles = {
    main: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%',
      background: '#f0f2f5',
      color: '#333',
    },
    formContainer: {
      background: '#fff',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: '1px solid #ccc',
      boxSizing: 'border-box', // Fixes padding and border issue
    },
    label: {
      display: 'block',
      marginBottom: '5px',
    },
    button: {
      width: '100%',
      padding: '10px',
      margin: '20px 0',
      borderRadius: '5px',
      border: 'none',
      color: '#fff',
      background: '#007bff',
      cursor: 'pointer',
    }
  };

  return (
    <main style={styles.main}>
      <div style={styles.formContainer}>
        <form>
          <div>
            <label htmlFor="email" style={styles.label}>Email or Username</label>
            <input
              style={styles.input}
              onChange={(e) => setEmailAddress(e.target.value)}
              id="email"
              name="email"
              type="email"
            />
          </div>
          <div>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              type="password"
            />
          </div>
          <button type="submit" onClick={handleSubmit} style={styles.button}>Sign In</button>
        </form>
      </div>
    </main>
  );
}
