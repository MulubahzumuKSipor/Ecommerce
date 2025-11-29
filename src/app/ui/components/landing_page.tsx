"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/Landing.module.css";
import { Product } from "@/app/types/product";
import { getRandomProducts } from "@/app/utilities/fetchRandom";
import LandingPageSkeleton from "../skeletons/landing_page";

export default function Landing() {
  const api = "/api/products";

  const [products, setProducts] = useState<Product[]>([]);
  const [current, setCurrent] = useState(0);
  const [slideIn, setSlideIn] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(api);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        if (!Array.isArray(json)) {
          throw new Error("Invalid data format: expected an array of products.");
        }

        const data: Product[] = getRandomProducts(json, 5);
        setProducts(data);
      } catch (e) {
        console.log(e instanceof Error ? e.message : "An unknown error occurred.");
      }
    };

    fetchProducts();
  }, []);

  // Slider logic
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setSlideIn(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % products.length);
        setSlideIn(true);
      }, 500); // match CSS transition
    }, 30000);

    return () => clearInterval(interval);
  }, [products]);

  const currentProduct = products[current];
  if (!currentProduct) return <LandingPageSkeleton />;

  return (
    <div className={styles.landing}>
      <div className={styles.hero} key={currentProduct.product_id}>
        <div className={`${styles.heroLeft} ${slideIn ? styles.slideIn : styles.slideOut}`}>
          {currentProduct.images?.[0]?.image_url ? (
            <Image
              src={currentProduct.images[0].image_url}
              alt={currentProduct.title}
              width={350}
              height={300}
              className={styles.heroImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.placeholderImage}>No Image</div>
          )}
        </div>

        <div className={`${styles.textBackground} ${styles.heroRight} ${slideIn ? styles.slideIn : styles.slideOut}`}>
          <h1 className={styles.heroTitle} style={{ color: "white" }}>
            {currentProduct.title.length > 20
              ? currentProduct.title.slice(0, 20) + "…"
              : currentProduct.title}
          </h1>
          <p className={styles.heroDescription} style={{ color: "white" }}>
            {currentProduct.description}
          </p>
          <button className={styles.heroButton} style={{ backgroundColor: "gray" }}>
            Shop Now
          </button>
        </div>
      </div>
      {/* <div className={styles.bottom_links}>
        <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#4267B2" viewBox="0 0 24 24">
            <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .733.592 1.324 1.325 1.324h11.495v-9.294h-3.13v-3.622h3.13v-2.671c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.294h6.116c.733 0 1.325-.591 1.325-1.324v-21.35c0-.733-.592-1.325-1.325-1.325z"/>
            </svg>
        </a>
        <a href="https://twitter.com/yourpage" target="_blank" rel="noopener noreferrer" title="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#1DA1F2" viewBox="0 0 24 24">
            <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.865 9.865 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.384 4.482 13.944 13.944 0 0 1-10.125-5.14 4.822 4.822 0 0 0-.664 2.475 4.916 4.916 0 0 0 2.188 4.096 4.903 4.903 0 0 1-2.228-.616v.062a4.917 4.917 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.084 4.923 4.923 0 0 0 4.596 3.417 9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.068a13.945 13.945 0 0 0 7.557 2.212c9.054 0 14-7.496 14-13.986 0-.21 0-.423-.015-.634a10.025 10.025 0 0 0 2.46-2.548l.002-.003z"/>
            </svg>
        </a>
        <a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#C13584" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.347 3.608 1.322.975.975 1.26 2.242 1.322 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.347 2.633-1.322 3.608-.975.975-2.242 1.26-3.608 1.322-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.347-3.608-1.322-.975-.975-1.26-2.242-1.322-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.347-2.633 1.322-3.608.975-.975 2.242-1.26 3.608-1.322 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.257 0-3.667.012-4.947.072-1.517.065-2.872.345-3.91 1.383-1.038 1.038-1.318 2.393-1.383 3.91-.06 1.28-.072 1.69-.072 4.947s.012 3.667.072 4.947c.065 1.517.345 2.872 1.383 3.91 1.038 1.038 2.393 1.318 3.91 1.383 1.28.06 1.69.072 4.947.072s3.667-.012 4.947-.072c1.517-.065 2.872-.345 3.91-1.383 1.038-1.038 1.318-2.393 1.383-3.91.06-1.28.072-1.69.072-4.947s-.012-3.667-.072-4.947c-.065-1.517-.345-2.872-1.383-3.91-1.038-1.038-2.393-1.318-3.91-1.383-1.28-.06-1.69-.072-4.947-.072z"/>
            <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998z"/>
            <circle cx="18.406" cy="5.594" r="1.44"/>
            </svg>
        </a>

        <a href="https://linkedin.com/yourpage" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#0077B5" viewBox="0 0 24 24">
            <path d="M22.23 0H1.77C.792 0 0 .774 0 1.728v20.543C0 23.226.792 24 1.77 24h20.46C23.206 24 24 23.226 24 22.271V1.728C24 .774 23.206 0 22.23 0zM7.12 20.452H3.558V9.036H7.12v11.416zM5.34 7.634c-1.137 0-2.057-.926-2.057-2.064 0-1.14.92-2.065 2.057-2.065 1.14 0 2.057.926 2.057 2.065 0 1.138-.918 2.064-2.057 2.064zm14.794 12.818h-3.56v-5.568c0-1.328-.026-3.036-1.85-3.036-1.85 0-2.133 1.444-2.133 2.934v5.67h-3.562V9.036h3.419v1.561h.048c.477-.901 1.637-1.85 3.368-1.85 3.6 0 4.267 2.37 4.267 5.455v6.25z"/>
            </svg>
        </a>

        <a href="https://youtube.com/yourpage" target="_blank" rel="noopener noreferrer" title="Youtube">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FF0000" viewBox="0 0 24 24">
            <path d="M23.498 6.186a2.998 2.998 0 0 0-2.11-2.116C19.274 3.5 12 3.5 12 3.5s-7.274 0-9.388.57a2.998 2.998 0 0 0-2.11 2.116C0 8.305 0 12 0 12s0 3.695.502 5.814a2.998 2.998 0 0 0 2.11 2.116C4.726 20.5 12 20.5 12 20.5s7.274 0 9.388-.57a2.998 2.998 0 0 0 2.11-2.116C24 15.695 24 12 24 12s0-3.695-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
        </a>
      </div> */}
    </div>
  );
}
