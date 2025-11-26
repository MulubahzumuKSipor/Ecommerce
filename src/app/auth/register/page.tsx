'use client';
import { useState, FormEvent, ChangeEvent } from 'react';
import styles from '@/app/ui/styles/register.module.css';

// Define the type for the actual API response structure expected from /api/register
interface RegisterResponse {
    message: string;
    user: {
        id: number;
        email: string;
    };
    token: string;
}

// --- Constants ---
const REGISTER_API_URL = '/api/register';
const AUTH_TOKEN_KEY = 'ecommerce_auth_token'; // Key for storing the JWT token

// --- RegisterPage Component ---

export default function RegisterPage() {
    // Note: The 'name' state is mapped to 'username' in the API call
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>(''); // Added for backend requirement
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Mock the router hook for demonstration of client-side navigation
    const router = {
        push: (path: string) => {
            console.log(`[Navigation] Redirecting to: ${path}`);
            window.location.href = path;
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            // Call the real API endpoint
            const response = await fetch(REGISTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send data required by the backend API: email, password, username, and phone
                body: JSON.stringify({
                    email,
                    password,
                    username: name,
                    phone,
                }),
            });
            
            // Parse response body. The data structure matches the RegisterResponse interface.
            const data: RegisterResponse = await response.json();

            if (!response.ok) {
                // Throw an error if the status is not 2xx (e.g., 409 Conflict, 400 Bad Request)
                throw new Error(data.message || 'Registration failed due to an unknown error.');
            }

            // Successful registration
            // 1. Save the token for persistent login
            localStorage.setItem(AUTH_TOKEN_KEY, data.token);

            console.log('Registration successful, token saved:', data.token);

            // 2. Redirect to the homepage
            router.push('/');

        } catch (err: unknown) {
            // Handle network errors or API-specific errors (like user already exists)
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during registration.');
            localStorage.removeItem(AUTH_TOKEN_KEY); // Clear potentially stale token
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerWrapper}>
                <h2 className={styles.title}>
                    Create a new account
                </h2>
                <p className={styles.subtitle}>
                    Already have an account?
                    <a href="/auth/login" className={styles.link}>
                        Sign in
                    </a>
                </p>
            </div>

            <div className={styles.formWrapper}>
                <div className={styles.formBox}>
                    <form className={styles.form} onSubmit={handleSubmit}>

                        {/* Name/Username Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>
                                Full Name / Username
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={styles.input}
                                    placeholder="Jane Doe"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email address
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="phone" className={styles.label}>
                                Phone Number
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={styles.input}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.label}>
                                Password
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="•••••••• (Min 6 characters)"
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Confirm Password
                            </label>
                            <div className={styles.inputWrapper}>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={styles.error} role="alert">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${styles.button} ${loading ? styles.buttonDisabled : ""}`}
                            >
                                {loading ? (
                                    <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Register Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
