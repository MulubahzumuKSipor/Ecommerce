'use client'

import Image from 'next/image'
import styles from '@/app/ui/styles/about.module.css'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Connecting You to Quality Products</h1>
          <p>We bring the best brands and local artisans straight to your doorstep.</p>
          <Link href="/shop" className={styles.ctaButton}>Explore Our Shop</Link>
        </div>
        <div className={styles.heroImage}>
          {/* <Image src="/images/hero-about.jpg" alt="About Hero" fill priority className={styles.image} /> */}
        </div>
      </section>

      {/* Our Story */}
      <section className={styles.story}>
        <div className={styles.storyImage}>
          {/* <Image src="/images/team.jpg" alt="Our Team" width={500} height={400} /> */}
        </div>
        <div className={styles.storyContent}>
          <h2>Our Journey</h2>
          <p>
            Founded in 2025, our platform exists to simplify online shopping while supporting local brands.
            We are passionate about quality, reliability, and customer satisfaction.
          </p>
          <p>
            From humble beginnings to a growing e-commerce platform, we prioritize trust and transparency
            in everything we do.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className={styles.values}>
        <h2>Our Mission & Values</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 20 20"><path fill="currentColor" d="M17 8h1v11H2V8h1V6c0-2.76 2.24-5 5-5c.71 0 1.39.15 2 .42A4.9 4.9 0 0 1 12 1c2.76 0 5 2.24 5 5zM5 6v2h2V6c0-1.13.39-2.16 1.02-3H8C6.35 3 5 4.35 5 6m10 2V6c0-1.65-1.35-3-3-3h-.02A4.98 4.98 0 0 1 13 6v2zm-5-4.22C9.39 4.33 9 5.12 9 6v2h2V6c0-.88-.39-1.67-1-2.22"/></svg>
            <h3>Quality Products</h3>
            <p>We handpick products to ensure only the best reach your doorstep.</p>
          </div>
          <div className={styles.valueCard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path fill="currentColor" d="M49.725 16.293c-.027.27-.043.578-.05.912l-3.834 1.831c-.537-.088-3.2.067-7.172-1.893c-1.007-.497-1.991-.761-2.936-.761a5.4 5.4 0 0 0-2.459.595c-1.003-.217-2.448-.773-3.293-.771c-1.912.01-6.259 1.567-7.463 1.7c-1.178.129-2.391.453-3.612.969c-2.219-.646-5.001-1.701-6.491-2.284L2 9v24.41l7.654 3.642c.111-.13.238-.33.376-.578l.237.11q.174.45.384.896c-.84 1.414-.94 3.007-.269 4.392c.575 1.185 1.646 2.017 2.839 2.25c.065.738.313 1.452.731 2.071c.75 1.107 1.942 1.768 3.191 1.768q.17 0 .338-.018c.178.481.439.929.778 1.317c.754.867 1.81 1.364 2.896 1.364q.12 0 .237-.008c.138.524.373 1.02.701 1.462c.755 1.02 1.92 1.627 3.118 1.627c.744 0 1.455-.228 2.082-.655c1.212.778 2.266 1.325 3.201 1.661c.469.191.957.289 1.455.289c1.178 0 2.321-.55 3.137-1.512c.303-.358.549-.758.729-1.186a3.8 3.8 0 0 0 1.087.162c1.252 0 2.439-.613 3.26-1.685a4.7 4.7 0 0 0 .83-1.711q.129.009.256.009c1.447 0 2.832-.849 3.611-2.216a4.74 4.74 0 0 0 .629-2.336c1.43-.213 2.689-1.23 3.302-2.713c.604-1.461.44-3.073-.403-4.417l3.895-2.195c.1.342.198.657.293.913L62 31.098V10.642zm-.001 3.037c.062 1.082.175 2.305.321 3.582c-.8-1.344-1.81-1.957-3.064-2.262zm-5.228 23.756c-2.148-.739-6.619-5.995-6.619-5.995h.088c.455-.032 1.438-.511 2.541-.282c-1.732-1.488-3.637-.229-4.934-1c.301.965 1.748 1.269 2.119 1.281l4.284 4.982c1.94 2.255.589 5.045-1.356 5.489c-1.305-.635-4.99-5.018-4.99-5.018c.126-.023.873-.257 1.634-.157c-1.757-1.314-3.749-.174-4.931-.999c.67 1.655 2.877 1.231 3.108 1.191l2.292 2.926c1.834 2.34.393 5.043-1.555 5.409c-1.727-.607-2.848-2.767-2.848-2.767c.174-.028.756-.287 1.584-.167c-1.473-1.291-3.188-.12-4.219-.855c.637 1.388 2.225 1.072 2.314 1.062c1.588 2.501-.059 5.109-2.027 5.187h-.002l-.002.001c-1.182-.205-2.42-1.15-3.818-2.12c.48-.532.904-1.467.904-1.467c1.404-2.542-.418-4.79-2.299-4.597c1.526.417 2.67 2.365 1.479 4.528l-.523.88c-.568 1.035-1.455 1.66-2.107 1.583c-1.004-.122-2.419-1.588-1.824-3.656c.23-.21 2.448-3.603 2.448-3.603c1.525-2.456-.187-4.807-2.073-4.727c1.502.507 2.555 2.521 1.26 4.611l-1.803 2.811c-.615.994-1.411 1.557-2.17 1.453c-1.178-.16-2.004-1.597-1.815-3.08c-.01.009 1.298-1.454 1.298-1.454c1.738-2.271.25-4.807-1.633-4.94c1.447.674 2.309 2.798.832 4.731l-.638.782c-.7.918-1.543 1.385-2.281 1.201c-1.288-.323-1.958-2.733-1.349-3.39c.479-.517 1.824-2.154 1.824-2.154c1.737-2.272.251-4.807-1.634-4.942c1.448.676 2.31 2.8.833 4.734l-.638.78c-.704.926-1.55 1.391-2.293 1.202c-1.548-.392-2.321-2.782-.84-4.722c0 0-.503-1.598-.73-2.281l-.746-.346c1.749-4.075 4.391-13.069 4.513-16.057c1.288.459 4.688 1.437 5.049 1.439l-.002.002c3.66-1.15 7.496-1.023 9.246-1.699c.567-.216 1.695-.23 2.891.454c-.747.655-1.453 1.435-2.186 2.162c-1.752 1.739-8.266 4.451-7.01 7.303c1.084 2.461 4.137 4.979 9.258 1.026l2.88-.396l4.479 2.21l5.74 5.895c2.047 2.098.888 4.946-1.003 5.556m1.44-6.495c-.658-1.23-2.709-3.247-4.645-4.896l-.012-.012c.893.036 1.83-1.402 3.041-1.513c-.846-.646-2.248.1-2.685.218c-2.409.648-6.153-2.383-6.153-2.383l-3.582.516s-4.26 5.199-7.849.916c-1.949-2.326 5.114-5.364 6.854-7.093c2.229-2.215 4.215-4.925 7.882-3.079c3.046 1.536 4.246 1.441 8.332 2.152c1.218.213 2.062.771 2.967 1.86c.426 3.584 1.115 7.559 1.776 10.325c-.341.287-3.264 2.253-5.926 2.989"/></svg>
            <h3>Ethical Sourcing</h3>
            <p>We collaborate with responsible brands and artisans.</p>
          </div>
          <div className={styles.valueCard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M16 1.2c-1 0-1.8.8-1.8 1.8S15 4.8 16 4.8S17.8 4 17.8 3S17 1.2 16 1.2m-3.6 2.9c-.47 0-.9.19-1.2.5L7.5 8.29C7.19 8.6 7 9 7 9.5c0 .63.33 1.16.85 1.47L11.2 13v5H13v-6.5l-2.25-1.65l2.32-2.35L14.8 10H19V8.2h-3.2l-1.94-3.27c-.29-.5-.86-.83-1.46-.83M10 3H3c-.55 0-1-.45-1-1s.45-1 1-1h9.79c-.21.34-.38.71-.47 1.11c-.86.02-1.67.34-2.32.89m-5 9c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m0 8.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5M19 12c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m0 8.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5M5.32 11H1c-.552 0-1-.45-1-1s.448-1 1-1h4.05c-.02.16-.05.33-.05.5c0 .53.12 1.04.32 1.5M6 7H2c-.55 0-1-.45-1-1s.45-1 1-1h5.97L6.09 6.87C6.05 6.91 6 6.96 6 7"/></svg>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable shipping so you never wait too long.</p>
          </div>
          <div className={styles.valueCard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><path fill="currentColor" d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93c0 3.21-1.92 6-4.72 7.28L13 17v5h5l-1.22-1.22C19.91 19.07 22 15.76 22 12c0-5.18-3.95-9.45-9-9.95M11 2c-1.95.2-3.8.96-5.32 2.21L7.1 5.63A8.2 8.2 0 0 1 11 4zM4.2 5.68C2.96 7.2 2.2 9.05 2 11h2c.19-1.42.75-2.77 1.63-3.9zM6 8v2h3v1H8c-1.1 0-2 .9-2 2v3h5v-2H8v-1h1c1.11 0 2-.89 2-2v-1a2 2 0 0 0-2-2zm6 0v5h3v3h2v-3h1v-2h-1V8h-2v3h-1V8zM2 13c.2 1.95.97 3.8 2.22 5.32l1.42-1.42A8.2 8.2 0 0 1 4 13zm5.11 5.37l-1.43 1.42A10.04 10.04 0 0 0 11 22v-2a8.06 8.06 0 0 1-3.89-1.63"/></svg>
            <h3>24/7 Support</h3>
            <p>Our team is here to assist you whenever you need us.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.team}>
        <h2>Meet the Team</h2>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <Image src="/CEO.jpg" alt="Founder" width={150} height={150} className={styles.teamImage} />
            <h3>Mulubahzumu Kemmeh Sipor</h3>
            <p>Founder & CEO</p>
          </div>
          {/* <div className={styles.teamMember}>
            <Image src="/images/team-member.jpg" alt="Team Member" width={150} height={150} className={styles.teamImage} />
            <h3></h3>
            <p>Marketing Lead</p>
          </div>
          <div className={styles.teamMember}>
             <Image src="/images/team-member2.jpg" alt="Team Member" width={150} height={150} className={styles.teamImage} />
            <h3>Mike Lee</h3>
            <p>Product Manager</p>
          </div> */}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <h3>Browse Products</h3>
            <p>Discover products curated for your lifestyle.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <h3>Add to Cart</h3>
            <p>Choose your favorites and add them to your cart with ease.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <h3>Checkout</h3>
            <p>Securely complete your order using our simple checkout.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <h3>Fast Delivery</h3>
            <p>Your products arrive quickly and safely at your door.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to shop?</h2>
        <Link href="/shop" className={styles.ctaButton}>Start Shopping Now</Link>
      </section>
    </main>
  )
}
