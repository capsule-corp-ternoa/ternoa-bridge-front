import React from 'react'

import Coin from 'assets/svgComponents/Coin'
import Modal from 'components/ui/Modal'

import styles from './SuccessModal.module.scss'

export interface SuccessModalProps {
  body: string
  setExpanded: (b: boolean) => void
}

const SuccessModal = ({ body, setExpanded }: SuccessModalProps) => (
  <Modal setExpanded={setExpanded}>
    <div className={styles.root}>
      <Coin />
      <div className={styles.title}>Transaction successful</div>
      <div className={styles.body}>{body}</div>
    </div>
  </Modal>
)

export default SuccessModal
