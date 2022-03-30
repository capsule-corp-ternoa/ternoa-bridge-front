import React from 'react'

import Loader from 'components/ui/Loader'
import Modal from 'components/ui/Modal'

import styles from './LoadingModal.module.scss'

const LoadingModal = () => (
  <Modal>
    <div className={styles.root}>
      <Loader />
      <div className={styles.body}>The transfer is in progress</div>
    </div>
  </Modal>
)

export default LoadingModal
