'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import styles from '@/app/ui/styles/register.module.css'
import Link from 'next/link'

interface FormState {
  username: string
  email: string
  phone: string
  password: string
  user_type: 'user' | 'buyer' | 'seller' | 'exclusive buyer' | 'exclusive seller'
  subscribed: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    phone: '',
    password: '',
    user_type: 'user',
    subscribed: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setForm({ ...form, [target.name]: target.checked })
    } else {
      setForm({ ...form, [target.name]: target.value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      setMessage(
        'Registration successful! Check your email to verify your account.'
      )
      setForm({
        username: '',
        email: '',
        phone: '',
        password: '',
        user_type: 'user',
        subscribed: false,
      })

      setTimeout(() => {
        router.push('/auth/resend')
      }, 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <h1 className={styles.title}>Create Your Account</h1>

        {/* --- Message Area --- */}
        {message && (
          <p className={styles.message}>
            <CheckCircle size={18} style={{ marginRight: 8 }} />
            {message}
          </p>
        )}
        {error && (
          <p className={styles.error}>
            <XCircle size={18} style={{ marginRight: 8 }} />
            {error}
          </p>
        )}

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="email"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={form.phone}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (Min. 8 characters)"
            value={form.password}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="new-password"
          />

          {/* --- User Type Dropdown --- */}
          <select
            name="user_type"
            value={form.user_type}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="user">User</option>
            <legend>** Only user option is available for now</legend>
            {/* <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="exclusive buyer">Exclusive Buyer</option>
            <option value="exclusive seller">Exclusive Seller</option> */}
          </select>

          {/* --- Subscribe Checkbox --- */}
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="subscribed"
              checked={form.subscribed}
              onChange={handleChange}
            />
            Subscribe to newsletters & updates
          </label>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <span className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={20} />
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className={styles.footerLink}>
          <p>
            Already have an account? <Link href="/auth/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
