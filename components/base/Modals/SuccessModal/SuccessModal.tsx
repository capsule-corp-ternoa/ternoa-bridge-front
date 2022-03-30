import React from 'react'

import Coin from 'assets/svgComponents/Coin'
import Modal from 'components/ui/Modal'

import styles from './SuccessModal.module.scss'

export interface SuccessModalProps {
  body: string
  link?: string
  setExpanded: (b: boolean) => void
}

const SuccessModal = ({ body, link, setExpanded }: SuccessModalProps) => (
  <Modal setExpanded={setExpanded}>
    <div className={styles.root}>
      <Coin />
      <div className={styles.title}>Transaction successful</div>
      <div className={styles.body}>{body}</div>
      {link && link.length > 0 && (
        <div className={styles.body}>
          View transaction on :
          <a href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
        </div>
      )}
    </div>
  </Modal>
)

export default SuccessModal
