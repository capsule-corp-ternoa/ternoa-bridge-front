import React from 'react'
import Link from 'next/link'

import TernoaIcon from 'assets/svgComponents/TernoaIcon'

import styles from './Header.module.scss'

const Header = () => (
  <nav className={`wrapper ${styles.nav}`}>
    <Link href="/">
      <a className={styles.logo} title="Bridge homepage">
        <TernoaIcon />
        <div className={styles.logoTitle}>Ternoa Bridge</div>
      </a>
    </Link>
  </nav>
)

export default Header
