import React from 'react'

import Coin from 'assets/svgComponents/Coin'
import Modal from 'components/ui/Modal'

import styles from './ResultModal.module.scss'

export interface ResultModalProps {
  body: string
  isError?: boolean
  link?: string
  setExpanded: (b: boolean) => void
}

const ResultModal = ({ body, isError, link, setExpanded }: ResultModalProps) => (
  <Modal setExpanded={setExpanded}>
    <div className={styles.root}>
      {isError ? (
        <div className={styles.warningEmoji}>⚠️</div>
      ) : (
        <div className={styles.coinIcon}>
          <Coin />
        </div>
      )}
      <div className={styles.title}>{isError ? 'Transaction rejected' : 'Transaction successful'}</div>
      <div className={styles.body}>{body}</div>
      {link && link.length > 0 && (
        <>
          <div className={styles.linkLabel}>View transaction on :</div>
          <a className={styles.link} href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        </>
      )}
    </div>
  </Modal>
)

export default ResultModal
