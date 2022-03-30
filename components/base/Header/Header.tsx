import React from 'react'
import Link from 'next/link'

import TernoaIcon from 'assets/svgComponents/TernoaIcon'
import Button from 'components/ui/Button'

import styles from './Header.module.scss'

const Header = () => (
  <nav className={`wrapper ${styles.nav}`}>
    <Link href="/">
      <a className={styles.logo} title="Bridge homepage">
        <TernoaIcon />
        <div className={styles.logoTitle}>Ternoa Bridge</div>
      </a>
    </Link>
    <Button
      className={styles.expandIcon}
      color="gradient700"
      onClick={() => console.log('Check claim')}
      size="small"
      text="Check Claim"
      variant="rounded"
    />
  </nav>
)

export default Header
