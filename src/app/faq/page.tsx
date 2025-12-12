
"use client";

import { useEffect, useState } from "react";
import styles from "@/app/ui/styles/faq.module.css";

type FAQ = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFAQs() {
      try {
        const res = await fetch("/api/faqs");
        const data = await res.json();
        setFaqs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFAQs();
  }, []);

  const toggleAccordion = (id: number) => {
    setActiveId(activeId === id ? null : id);
  };

  // Group FAQs by category
  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.heroTitle}>Frequently Asked Questions</h1>
      {loading ? (
        <p>Loading FAQs...</p>
      ) : (
        categories.map((cat) => (
          <section key={cat} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{cat}</h2>
            <div className={styles.accordionContainer}>
              {faqs
                .filter(f => f.category === cat)
                .map(faq => (
                  <div key={faq.id} className={styles.accordionItem}>
                    <button
                      className={styles.accordionButton}
                      onClick={() => toggleAccordion(faq.id)}
                    >
                      {faq.question}
                      <span className={styles.accordionIcon}>
                        {activeId === faq.id ? "-" : "+"}
                      </span>
                    </button>
                    {activeId === faq.id && (
                      <div className={styles.accordionContent}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
