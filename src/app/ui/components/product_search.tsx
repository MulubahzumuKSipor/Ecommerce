"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
        if (e instanceof Error) setError(e.message);
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
    <div ref={containerRef} style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
      {/* Search input */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          aria-label="Search products"
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          className="input"

        />

        {query ? (
          <button
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              setShowSuggestions(false);
            }}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="34"
            viewBox="0 0 24 24"
            style={{ cursor: "pointer" }}
          >
            <g fill="none">
              <path d="M0 0h24v24H0z" />
              <path
                fill="currentColor"
                d="M10.5 2a8.5 8.5 0 0 1 6.676 13.762l3.652 3.652a1 1 0 0 1-1.414 1.414l-3.652-3.652A8.5 8.5 0 1 1 10.5 2m0 2a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13m0 1a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11"
              />
            </g>
          </svg>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          role="listbox"
          className="listbox"
        >
          {error && <div style={{ color: "crimson", padding: 12 }}>Error: {error}</div>}

          {filtered.length > 0 ? (
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
              {filtered.map((p) => {
                const key = p.product_id ?? p.id ?? p.sku;
                const title = p.title ?? p.name ?? "Untitled product";
                const imageUrl = p.images?.[0]?.image_url;

                return (
                  <li key={String(key)} role="option" style={{ marginBottom: 0 }}>
                    <Link
                      href={`/shop/${p.product_id ?? p.id}`}
                      onClick={() => handleSelect(p)}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: 10,
                        borderBottom: "1px solid #f1f1f1",
                        alignItems: "center",
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          background: "#f6f6f6",
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={title}
                            width={64}
                            height={64}
                            style={{ objectFit: "cover", borderRadius: 6 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 64,
                              height: 64,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#999",
                            }}
                          >
                            No image
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontWeight: 600 }}>{title}</div>
                          <div style={{ minWidth: 90, textAlign: "right" }}>
                            ${safeFormatPrice(p.price)}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
                          {p.brand ? `by ${p.brand}` : p.sku ? `sku: ${p.sku}` : null} •
                          Stock: {p.stock_quantity ?? "N/A"}
                        </div>
                        {p.description && (
                          <div style={{ marginTop: 6, color: "#444", fontSize: 13 }}>
                            {String(p.description).slice(0, 120)}
                            {String(p.description).length > 120 ? "…" : ""}
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: 13, color: "#0066cc" }}>View →</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ padding: 12, color: "#666" }}>No results</div>
          )}

          {productsToSearch.length > limit && filtered.length >= limit && (
            <div style={{ marginTop: 10, padding: 10 }}>
              <Link href={`/search?query=${encodeURIComponent(query)}`}>
                See more results →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
