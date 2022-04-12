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
    <div className={styles.networkPill}>
      <div className={styles.connectIndicator}>
        <div className={styles.outterIndicator} />
        <div className={styles.innerIndicator} />
      </div>
      <small className={styles.networkEnv}>Mainnet</small>
    </div>
  </nav>
)

export default Header
