"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import styles from "@/app/ui/styles/career.module.css";

const VALUES = [
  { title: "Customer First", desc: "We prioritize the shopping experience above all else." },
  { title: "Innovation", desc: "We build technology to solve real local challenges." },
  { title: "Transparency", desc: "We are honest with our vendors, customers, and each other." },
  { title: "Teamwork", desc: "We win together. Every role matters in our ecosystem." },
];

type Job = {
  id: number;
  title: string;
  department: string;
  type: string;
  location: string;
};

export default function CareerPage() {
  // Job state
  const [openPositions, setOpenPositions] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [cv, setCv] = useState<File | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch jobs from API
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/open-jobs");
        if (!res.ok) throw new Error("Failed to fetch jobs.");
        const data: Job[] = await res.json();
        setOpenPositions(data);
      } catch (err) {
        console.error(err);
        setJobsError("Unable to load job opportunities at this time.");
      } finally {
        setLoadingJobs(false);
      }
    }
    fetchJobs();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setCv(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!cv) {
      setError("Please upload your CV.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("position", position);
      formData.append("cv", cv);

      const res = await fetch("/api/submit-cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Application received! We will be in touch soon.");
        setName("");
        setEmail("");
        setPosition("");
        setCv(null);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Build the Future of Commerce in Liberia</h1>
        <p className={styles.heroSubtitle}>
          We’re building the most reliable online shopping experience.
          Join a team that values innovation, customer satisfaction, and simplicity.
        </p>
        <a href="#open-roles" className={styles.ctaButton}>View Open Positions</a>
      </section>

      {/* Mission & Values */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Values</h2>
        <div className={styles.valuesGrid}>
          {VALUES.map((val, index) => (
            <div key={index} className={styles.valueCard}>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Work With Us */}
      <section className={styles.sectionAlt}>
        <div className={styles.contentContainer}>
          <h2 className={styles.sectionTitle}>Why Work With Us?</h2>
          <ul className={styles.benefitsList}>
            <li><strong>Growth Opportunities:</strong>{" Be part of a startup where your work directly impacts the company's direction."}</li>
            <li><strong>Learn from Founders:</strong> Direct access to leadership and mentorship.</li>
            <li><strong>Flexible Environment:</strong> We value output over hours. We foster creativity and ownership.</li>
            <li><strong>Build for Liberia:</strong> Solve unique logistical and technical challenges in our local market.</li>
          </ul>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className={styles.section}>
        <h2 className={styles.sectionTitle}>Open Roles</h2>
        {loadingJobs ? (
          <p>Loading job opportunities...</p>
        ) : jobsError ? (
          <p className={styles.errorMessage}>{jobsError}</p>
        ) : openPositions.length > 0 ? (
          <div className={styles.jobsList}>
            {openPositions.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobDetails}>{job.department} • {job.location} • {job.type}</p>
                </div>
                <button
                  className={styles.applyButtonSmall}
                  onClick={() => {
                    setPosition(job.title);
                    document.getElementById("application-form")?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noJobs}>
            <p>{"No specific positions are open right now, but don't let that stop you!"}</p>
            <p>We are always looking for talent. Submit your details below to join our talent pool.</p>
          </div>
        )}
      </section>

      {/* Talent Pool / Application Form */}
      <section id="application-form" className={styles.formSection}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>General Application</h2>
          <p className={styles.formSubtitle}>
            {"Don't see a role that fits? Or applying for an open position? Fill out the form below."}
            {"We keep strong talent in our system for future opportunities."}
          </p>

          {success && <div className={styles.successMessage}>{success}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
                placeholder="John Doe"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="john@example.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Position / Skillset</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className={styles.input}
                placeholder="e.g. Frontend Developer, Logistics, Internship"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Upload CV (PDF/Doc)</label>
              <div className={styles.fileInputWrapper}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  className={styles.fileInput}
                />
                <span className={styles.fileLabel}>
                  {cv ? `Selected: ${cv.name}` : "Click to upload your CV"}
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Sending..." : "Submit Application"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer Info */}
      <section className={styles.footerInfo}>
        <div className={styles.infoBlock}>
          <h3>🎓 Internship Opportunities</h3>
          <p>{'Looking to start your career? We offer internships for students passionate about e-commerce, coding, and business management. Use the form above and mention "Internship".'}</p>
        </div>
        <div className={styles.infoBlock}>
          <h3>🌍 Diversity & Inclusion</h3>
          <p>We welcome people from all backgrounds. Whether you are self-taught or hold a degree, what matters most is your skill, character, and passion for building great things.</p>
        </div>
      </section>
    </div>
  );
}
