"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/ui/styles/account.module.css";
import { supabase } from "@/lib/client";

interface UpdateForm {
  username: string;
  email: string;
  phone: string;
  password?: string; // new password
  subscribed: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateForm>({
    username: "",
    email: "",
    phone: "",
    password: "",
    subscribed: false,
  });
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // load session + profile
  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Supabase session error:", sessionError);
          router.push("/auth/login");
          return;
        }

        if (!session?.user) {
          router.push("/auth/login");
          return;
        }

        if (mounted) setUserId(session.user.id);

        const res = await fetch(`/api/users/${session.user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          console.warn("Failed to fetch user row:", await res.text());
          router.push("/auth/login");
          return;
        }

        const data = await res.json();
        const user = data.user ?? data;

        if (mounted) {
          setForm({
            username: user.username ?? "",
            email: user.email ?? session.user.email ?? "",
            phone: user.phone ?? "",
            password: "",
            subscribed: Boolean(user.subscribed),
          });
        }
      } catch (err) {
        console.error("Account load error:", err);
        router.push("/auth/login");
      } finally {
        if (mounted) setFetching(false);
      }
    }

    checkUser();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked } as UpdateForm));
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as UpdateForm));
    }
  };

  // submit: verify old password if changing password, update auth (password/email), then update profile server-side
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!userId) {
      setError("User not found");
      setLoading(false);
      return;
    }

    try {
      // get current session & email
      const sessionResp = await supabase.auth.getSession();
      const currentSession = sessionResp.data.session ?? null;
      const currentEmail = currentSession?.user?.email ?? form.email;

      // 1) If changing password -> require oldPassword and re-authenticate
      if (form.password) {
        if (!oldPassword) {
          setError("Please enter your current password to change it.");
          setLoading(false);
          return;
        }

        const signInResp = await supabase.auth.signInWithPassword({
          email: currentEmail!,
          password: oldPassword,
        });

        if (signInResp.error) {
          // incorrect current password
          setError("Current password is incorrect.");
          setLoading(false);
          return;
        }

        // update password in Supabase Auth
        const updatePwResp = await supabase.auth.updateUser({
          password: form.password,
        });

        if (updatePwResp.error) {
          setError(updatePwResp.error.message || "Failed to update password.");
          setLoading(false);
          return;
        }
      }

      // 2) If email changed, update it in Supabase Auth (will trigger verification email)
      // Use the session's email as the canonical current email
      if (form.email && currentEmail && form.email !== currentEmail) {
        const updateEmailResp = await supabase.auth.updateUser({
          email: form.email,
        });

        if (updateEmailResp.error) {
          setError(updateEmailResp.error.message || "Failed to update email.");
          setLoading(false);
          return;
        }

        // Inform user they may need to verify new email
        setSuccess("Email change initiated — please check your new email to verify.");
      }

      // 3) grab fresh access token after possible auth changes
      const refreshed = await supabase.auth.getSession();
      const accessToken = refreshed.data.session?.access_token ?? "";

      // 4) update server-side profile (no passwords)
      const res = await fetch("/api/users/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          phone: form.phone,
          subscribe: form.subscribed,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to update profile");
      } else {
        // If we already set a success message (email changed), keep it, otherwise show generic message
        if (!success) setSuccess(result.message || "Profile updated successfully");
        setForm((prev) => ({ ...prev, password: "" }));
        setOldPassword("");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle}>Account Management</h1>
        <p>Loading your account…</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Account Management</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {success && <div className={styles.successMessage}>{success}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="username">Full Name</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+231-886-678-786"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="oldPassword">Old Password (required to change password)</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter old password"
            disabled={!form.password}
            required={!!form.password}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </div>

        <div className={styles.field}>
          <label>
            <input
              type="checkbox"
              name="subscribed"
              checked={form.subscribed}
              onChange={handleChange}
            />{" "}
            Subscribe to updates
          </label>
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
