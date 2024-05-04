import React from 'react'
import Link from 'next/link'

import Discord from 'assets/svgComponents/SocialMedias/Discord'
import Telegram from 'assets/svgComponents/SocialMedias/Telegram'
import Twitter from 'assets/svgComponents/SocialMedias/Twitter'
import Instagram from 'assets/svgComponents/SocialMedias/Instagram'
import Close from 'assets/svgComponents/Close'
import TernoaIcon from 'assets/svgComponents/TernoaIcon'
import { AnchorButton } from 'components/ui/Button'

import navStyles from './MobileHeader.module.scss'
import styles from './SideMenu.module.scss'

type ExpandedNominalSetState = React.Dispatch<React.SetStateAction<boolean>>

interface Props {
  isExpanded: boolean
  setIsExpanded: ExpandedNominalSetState
}

const SideMenu = ({ isExpanded, setIsExpanded }: Props) => (
  <aside className={['container', `${styles.root}`, `${isExpanded ? styles.expanded : ''}`].join(' ')}>
    <div className={styles.radialGradientBg}>
      <div>
        <div className={`wrapper ${navStyles.nav}`}>
          <Link legacyBehavior href="/">
            <a className={navStyles.logo} title="Bridge homepage">
              <TernoaIcon />
              <div className={navStyles.logoTitle}>Ternoa Bridge</div>
            </a>
          </Link>
          <button className={navStyles.expandIcon} onClick={() => setIsExpanded((prevState) => !prevState)} title="Close menu">
            <Close />
          </button>
        </div>
        <div className={`wrapper ${styles.links}`}>
          <AnchorButton color="dark" href="https://www.ternoa.com" size="medium" variant="rectangle" text="Back to Ternoa" title="Ternoa website" />
          <AnchorButton
            color="dark"
            href="https://github.com/chainsulting/Smart-Contract-Security-Audits/blob/master/Ternoa/02_Architecture_Audit_Ternoa_Bridge_Relayer.pdf"
            size="medium"
            variant="rectangle"
            text="Smart Contract Audit"
            title="Smart Contract Audit"
          />
          <AnchorButton
            color="dark"
            href="https://intercom.help/ternoa/fr/collections/2774679-legal"
            size="medium"
            variant="rectangle"
            text="Terms"
            title="Terms"
          />
          <AnchorButton
            color="dark"
            href="https://intercom.help/ternoa/fr/collections/2774679-legal"
            size="medium"
            variant="rectangle"
            text="Privacy"
            title="Privacy"
          />
        </div>
      </div>
      <div className="wrapper">
        <div className={styles.footer}>
          <div className={styles.socials}>
            <a href="https://discord.gg/cNZTGtGJNR" target="_blank" rel="noopener noreferrer" title="Ternoa Discord">
              <Discord className={styles.socialLogo} />
            </a>
            <a href="https://t.me/ternoadiscussions" target="_blank" rel="noopener noreferrer" title="Ternoa Telegram">
              <Telegram className={styles.socialLogo} />
            </a>
            <a href="https://twitter.com/ternoa_" target="_blank" rel="noopener noreferrer" title="Ternoa Twitter">
              <Twitter className={styles.socialLogo} />
            </a>
            <a href="https://www.instagram.com/ternoa_/" target="_blank" rel="noopener noreferrer" title="Ternoa Instagram">
              <Instagram className={styles.socialLogo} />
            </a>
          </div>
          <span className={styles.credentials}>{`© ${new Date().getFullYear()} Ternoa bridge . All rights reserved.`}</span>
        </div>
      </div>
    </div>
  </aside>
)

export default SideMenu
