import React from 'react'

import Coin from 'assets/svgComponents/Coin'
import Warning from 'assets/svgComponents/Warning'
import Modal from 'components/ui/Modal'

import styles from './ResultModal.module.scss'

export interface ResultModalProps {
  body: string
  isError?: boolean
  link?: string
  setExpanded: (b: boolean) => void
  setResponse: (
    response: { message: string; newBalance?: number; txLink: string; isError: boolean } | undefined
  ) => void
}

const ResultModal = ({ body, isError, link, setExpanded, setResponse }: ResultModalProps) => {
  const handleClose = (value: boolean) => {
    setExpanded(value)
    setResponse(undefined)
  }

  return (
    <Modal setExpanded={handleClose}>
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
}

export default ResultModal
