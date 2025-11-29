"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/search.module.css"

export type Product = {
  product_id?: number | string;
  id?: number | string;
  title?: string;
  name?: string;
  brand?: string;
  sku?: string;
  price?: number | string;
  stock_quantity?: number;
  rating?: number;
  description?: string;
  images?: { image_url?: string }[];
  categories?: { name?: string }[];
};

type Props = {
  products?: Product[];
  apiUrl?: string;
  onSelect?: (product: Product) => void;
  placeholder?: string;
  debounceMs?: number;
  limit?: number;
};

const safeFormatPrice = (v: unknown) => {
  if (v == null || v === "") return "N/A";
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (Number.isNaN(n)) return "N/A";
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
};

export default function ProductSearch({
  products: controlledProducts,
  apiUrl = "/api/products",
  onSelect,
  placeholder = "Search products by name, brand, sku, category...",
  debounceMs = 250,
  limit = 7,
}: Props) {
  const [internalProducts, setInternalProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch products if not controlled
  useEffect(() => {
    if (controlledProducts) {
      setInternalProducts(controlledProducts);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: Product[] = Array.isArray(json?.products)
          ? json.products
          : Array.isArray(json)
          ? json
          : json?.productsList ?? [];
        if (!cancelled) {
          setInternalProducts(data);
          setError(null);
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") {
          /* aborted during cleanup */
        } else if (e instanceof Error) setError(e.message);
        else setError("Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [controlledProducts, apiUrl]);

  // Debounce search input
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), debounceMs);
    return () => window.clearTimeout(id);
  }, [query, debounceMs]);

  // Click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const productsToSearch = controlledProducts ?? internalProducts ?? [];

  const filtered = useMemo(() => {
    if (!debouncedQuery) return productsToSearch.slice(0, limit);
    const q = debouncedQuery;
    const out = productsToSearch.filter((p) => {
      const fields = [
        p.title,
        p.name,
        p.brand,
        p.sku,
        p.description,
        ...(p.categories?.map((c) => c.name) ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(q);
    });
    return limit ? out.slice(0, limit) : out;
  }, [productsToSearch, debouncedQuery, limit]);

  const handleSelect = (p: Product) => {
    if (onSelect) onSelect(p);
    setShowSuggestions(false);
  };

  return (
      // Only applied to outer container
      <div ref={containerRef} className={styles.searchBar}>

        {/* Changed class to inputWrapper */}
        <div className={styles.inputWrapper}>
          <input
            className={styles.input}
            aria-label="Search products"
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                setShowSuggestions(false);
              }
            }}
          />

          {query ? (
            <button
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setDebouncedQuery("");
                setShowSuggestions(false);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
            {/* Simple X icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div
            role="listbox"
            aria-label="Product suggestions"
            className={styles.suggestionsDropdown}
          >
            {error && <div style={{ color: "crimson", padding: 12 }}>Error: {error}</div>}

            {loading && !productsToSearch.length ? (
              <div style={{ padding: "16px", color: "#64748b", textAlign: "center" }}>Loading...</div>
            ) : filtered.length > 0 ? (
              <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
                {filtered.map((p) => {
                  const key = p.product_id ?? p.id ?? p.sku ?? Math.random();
                  const title = p.title ?? p.name ?? "Untitled product";
                  const imageUrl = p.images?.[0]?.image_url;

                  return (
                    <li key={String(key)} role="option" style={{ marginBottom: 0 }}>
                      <Link
                        href={`/shop/${p.product_id ?? p.id}`}
                        onClick={() => handleSelect(p)}
                        className={styles.suggestionItem}
                      >
                        <div className={styles.images}>
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={title}
                              width={56}
                              height={56}
                              style={{ objectFit: "cover", display: "block" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                backgroundColor: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#cbd5e1",
                                fontSize: "10px"
                              }}
                            >
                              NO IMG
                            </div>
                          )}
                        </div>

                        <div className={styles.format}>
                          <div className={styles.titlePrice}>
                            <span className={styles.priceTitle}>{title}</span>
                            <span className={styles.price}>
                              ${safeFormatPrice(p.price)}
                            </span>
                          </div>

                          <div className={styles.brand}>
                            {p.brand || p.categories?.[0]?.name || "Generic"}
                            {p.stock_quantity && p.stock_quantity < 5 && (
                              <span style={{color: '#ef4444', marginLeft: '6px'}}>Only {p.stock_quantity} left</span>
                            )}
                          </div>

                          {p.description && (
                            <div className={styles.description}>
                              {p.description}
                            </div>
                          )}
                        </div>
                        <div className={styles.view}>View</div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>
                  {`No results found for ${query}`}
              </div>
            )}

            {productsToSearch.length > (filtered.length ?? 0) && (
              <div className={styles.seeMore}>
                <Link href={`/search?query=${encodeURIComponent(query)}`}>See all {productsToSearch.length} results</Link>
              </div>
            )}
          </div>
        )}
      </div>
    );
}
