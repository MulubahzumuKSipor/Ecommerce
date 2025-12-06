'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, User } from '@supabase/supabase-js'
import CartButton from './components/buttons/cart'
import styles from '../ui/styles/navbar.module.css'
import { supabase } from '@/lib/client'

interface DbUser {
  username: string
  email: string
  role: string
  status: string
}

export default function Nav() {
  const router = useRouter()
  const navRef = useRef<HTMLElement | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)

  const toggleMenu = (menuName: string) => setOpenMenu(prev => (prev === menuName ? null : menuName))
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
    setOpenMenu(null)
  }

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSupabaseUser(null)
    setDbUser(null)
    setOpenMenu(null)
    setIsMobileMenuOpen(false)
    router.push('/auth/login')
  }

  // Supabase Auth Listeners
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setSupabaseUser(data.session.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Fetch DB User
  useEffect(() => {
    async function fetchDbUser() {
      if (supabaseUser?.id) {
        try {
          const res = await fetch(`/api/users/${supabaseUser.id}`)
          const data = await res.json()
          if (data.user) setDbUser(data.user)
        } catch (e) {
          console.error("Error fetching user", e)
        }
      }
    }
    fetchDbUser()
  }, [supabaseUser])

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
        setIsMobileMenuOpen(false)
      }
    }
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  return (
    <nav className={styles.navbar} ref={navRef}>

      {/* Brand / Logo Area would go here */}

      {/* Hamburger Icon */}
      <button
        className={styles.hamburger}
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle navigation"
      >
        {isMobileMenuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </button>

      {/* Main Nav List */}
      <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.open : ''}`}>

        {/* Home */}
        <li className={`${styles.navItem} ${styles.mobileOnly}`}>
          <Link href="/" className={styles.link} onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
        </li>

        {/* SHOP DROPDOWN */}
        <li className={styles.navItem}>
          <button
            aria-haspopup="true"
            aria-expanded={openMenu === 'shop'}
            onClick={() => toggleMenu('shop')}
            className={styles.navButton}
          >
            Shop
            {/* Simple arrow icon */}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{transform: openMenu === 'shop' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={`${styles.megaMenu} ${openMenu === 'shop' ? styles.visible : ''}`}>
            <div className={styles.megaMenuColumn}>
              <h3>Categories</h3>
              <ul>
                <li><Link href="/shop">All Products</Link></li>
                <li><Link href="/specials">Specials</Link></li>
                <li><Link href="/arrivals">New Arrivals</Link></li>
              </ul>
            </div>
            <div className={styles.megaMenuColumn}>
              <h3>Featured</h3>
              <ul>
                <li><Link href="/bestsellers">Best Sellers</Link></li>
                <li><Link href="/sale" style={{color: '#ef4444'}}>Hot Sale 🔥</Link></li>
              </ul>
            </div>
             {/* You can add images here for visual appeal */}
             <div className={styles.megaMenuColumn}>
                {/* Placeholder for an image in the menu */}
             </div>
          </div>
        </li>

        {/* ABOUT DROPDOWN */}
        <li className={styles.navItem}>
          <button
            aria-haspopup="true"
            aria-expanded={openMenu === 'about'}
            onClick={() => toggleMenu('about')}
            className={styles.navButton}
          >
            About
             <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{transform: openMenu === 'about' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={`${styles.megaMenu} ${openMenu === 'about' ? styles.visible : ''}`}>
            <div className={styles.megaMenuColumn}>
                <h3>Company</h3>
                <ul>
                    <li><Link href="/about">Our Story</Link></li>
                    <li><Link href="/careers">Careers</Link></li>
                </ul>
            </div>
            <div className={styles.megaMenuColumn}>
                <h3>Support</h3>
                <ul>
                    <li><Link href="/contact">Contact Us</Link></li>
                    <li><Link href="/faq">FAQ</Link></li>
                </ul>
            </div>
          </div>
        </li>

        {/* AUTH SECTION */}
        {dbUser ? (
          <li className={styles.navItem}>
            <button
                aria-haspopup="true"
                aria-expanded={openMenu === 'account'}
                onClick={() => toggleMenu('account')}
                className={styles.navButton}
            >
              <span style={{maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {dbUser.username || "Account"}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>

            <div className={`${styles.megaMenu} ${styles.miniMenu} ${openMenu === 'account' ? styles.visible : ''}`}>
               <div className={styles.megaMenuColumn}>
                  <ul>
                    <li><Link href="/account/manage">Manage Account</Link></li>
                    <li><Link href="/account/orders">My Orders</Link></li>
                    <li>
                        <button onClick={handleLogout} style={{color: '#ef4444', textAlign: 'left', background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem'}}>
                            Log Out
                        </button>
                    </li>
                  </ul>
               </div>
            </div>
          </li>
        ) : (
          <>
            <li className={styles.navItem}><Link href="/auth/login" className={styles.link}>Login</Link></li>
            <li className={styles.navItem}>
                <Link href="/auth/register" className={styles.link} style={{
                    backgroundColor: 'blue',
                    color: 'white',
                    padding: '8px 20px',
                    boxShadow: '0 4px 14px 0 rgba(13, 71, 161, 0.39)'
                }}>
                    Register
                </Link>
            </li>
          </>
        )}

        {/* CART */}
        <li className={styles.navItem}>
           <CartButton />
        </li>
      </ul>
    </nav>
  )
}