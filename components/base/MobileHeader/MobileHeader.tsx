import React, { useState } from 'react'
import Link from 'next/link'

import Hamburger from 'assets/svgComponents/Hamburger'
import TernoaIcon from 'assets/svgComponents/TernoaIcon'

import SideMenu from './SideMenu'

import styles from './MobileHeader.module.scss'

const MobileHeader = () => {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)

  return (
    <>
      <nav className={`wrapper ${styles.nav}`}>
        <Link href="/">
          <a className={styles.logo} title="Bridge homepage">
            <TernoaIcon />
            <div className={styles.logoTitle}>Ternoa Bridge</div>
          </a>
        </Link>
        <button
          className={styles.expandIcon}
          onClick={() => setIsMenuExpanded((prevState) => !prevState)}
          title="Open menu"
        >
          <Hamburger />
        </button>
      </nav>

      <SideMenu isExpanded={isMenuExpanded} setIsExpanded={setIsMenuExpanded} />
    </>
  )
}

export default MobileHeader
