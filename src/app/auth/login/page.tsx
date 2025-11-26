"use client";

import { useState } from "react";
import styles from "@/app/ui/styles/login.module.css";
import { useRouter } from "next/navigation";
import error from "next/error";
import Link from "next/link";

// --- Interfaces ---
interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user?: {
    id: number;
    email: string;
  };
  token?: string; // Should ideally be set via HTTP-Only Cookie
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // New state for success

  // Destructure form for cleaner usage in JSX/logic
  const { email, password } = form;

  // --- Handle input change ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Handle form submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null); // Clear success message

    // 1. Basic Client-Side Validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        // Throw the error message from the backend response
        throw new Error(data.message || "Login failed due to an unknown error.");
      }

      // 2. Save JWT (RECOMMENDATION: Use HTTP-Only Cookies for security)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // 3. Success Feedback and Redirection
      setSuccess("Login successful! Redirecting...");

      // Delay redirection slightly to allow success message to display (optional)
      setTimeout(() => {
        router.push("/");
      }, 500);

    } catch (err: unknown) {
      // 4. Improved Error Handling
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected network error occurred during login.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className={styles.login}>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
            <legend className={styles.title}><h1>Login Form</h1></legend>
            <input
          type="email"
          name="email"
          placeholder="Email"
          value={email} // Use destructured variable
          onChange={handleChange}
          className={styles.input}
          aria-label="Email"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password} // Use destructured variable
          onChange={handleChange}
          className={styles.input}
          aria-label="Password"
          required
        />

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className={styles.footer}>
            If you do not have an account | <Link href={'/auth/register'}>Sign Up</Link>
        </p>
        </form>

    </div>
  );
}


