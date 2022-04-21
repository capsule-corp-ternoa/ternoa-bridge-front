import React from 'react'

import Coin from 'assets/svgComponents/Coin'
import Warning from 'assets/svgComponents/Warning'
import Modal from 'components/ui/Modal'

import styles from './ResultModal.module.scss'

export interface ResultModalProps {
  body: string
  handleClose: () => void
  isError?: boolean
  isOpen: boolean
  link?: string
}

const ResultModal = ({ body, handleClose, isError, isOpen, link }: ResultModalProps) => (
  <Modal handleClose={handleClose} isOpen={isOpen}>
    <div className={styles.root}>
      {isError ? (
        <Warning className={styles.warning} />
      ) : (
        <div className={styles.coinIcon}>
          <Coin />
        </div>
      )}
      <div className={styles.title}>{isError ? 'Transaction rejected' : 'Transaction successful'}</div>
      <div className={styles.body}>{body}</div>
      {link && link.length > 0 && (
        <a className={styles.link} href={link} target="_blank" rel="noreferrer">
          View transaction
        </a>
      )}
    </div>
  </Modal>
)

export default ResultModal
