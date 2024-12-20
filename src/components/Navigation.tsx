'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '@/styles/Navigation.module.css'

export default function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          Fleet Manager
        </Link>
        <div className={styles.navLinks}>
          <Link
            href="/vehicles"
            className={`${styles.navLink} ${
              pathname === '/vehicles' ? styles.activeLink : ''
            }`}
          >
            Vehicles
          </Link>
          <Link
            href="/projects"
            className={`${styles.navLink} ${
              pathname === '/projects' ? styles.activeLink : ''
            }`}
          >
            Projects
          </Link>
        </div>
      </div>
    </nav>
  )
} 