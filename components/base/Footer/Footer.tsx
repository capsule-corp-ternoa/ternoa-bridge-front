import React from 'react'

import LinkArrow from 'assets/svgComponents/LinkArrow'
import Discord from 'assets/svgComponents/SocialMedias/Discord'
import Telegram from 'assets/svgComponents/SocialMedias/Telegram'
import Twitter from 'assets/svgComponents/SocialMedias/Twitter'
import Instagram from 'assets/svgComponents/SocialMedias/Instagram'

import styles from './Footer.module.scss'

const Footer = () => (
  <footer className={`container ${styles.root}`}>
    <div className={`wrapper ${styles.laptopFooter}`}>
      <div className={styles.top}>
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
          <a
            href="https://www.instagram.com/ternoa_/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ternoa Instagram"
          >
            <Instagram className={styles.socialLogo} />
          </a>
        </div>
        <a
          className={styles.link}
          href="https://www.ternoa.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Ternoa official website"
        >
          Ternoa
          <LinkArrow />
        </a>
      </div>
      <div className={styles.bottom}>
        <span className={styles.laptopCredentials}>© 2021 Ternoa bridge . All rights reserved.</span>
        <div className={styles.linksWrapper}>
          <a
            className={styles.footerLink}
            href="https://intercom.help/ternoa/fr/collections/2774679-legal"
            target="_blank"
            rel="noopener noreferrer"
            title="Terms"
          >
            Terms
          </a>
          <a
            className={styles.footerLink}
            href="https://intercom.help/ternoa/fr/collections/2774679-legal"
            target="_blank"
            rel="noopener noreferrer"
            title="Privacy"
          >
            Privacy
          </a>
        </div>
      </div>
    </div>
    <span className={styles.mobileCredentials}>© 2021 Ternoa bridge . All rights reserved.</span>
  </footer>
)

export default Footer
