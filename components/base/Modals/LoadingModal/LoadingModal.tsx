import React from 'react'

import Loader from 'components/ui/Loader'
import Modal from 'components/ui/Modal'

import styles from './LoadingModal.module.scss'

interface Props {
  isOpen: boolean
}

const LoadingModal = ({ isOpen }: Props) => (
  <Modal isClosable={false} isClickAwayCloseAllowed={false} isOpen={isOpen}>
    <div className={styles.root}>
      <Loader useLottie />
      <div className={styles.body}>Transfer in progress...</div>
    </div>
  </Modal>
)

export default LoadingModal
