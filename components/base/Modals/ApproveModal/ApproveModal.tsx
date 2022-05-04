import React from 'react'

import ApproveContract from 'assets/svgComponents/ApproveContract'
import Modal from 'components/ui/Modal'

import styles from './ApproveModal.module.scss'
import Loader from 'components/ui/Loader'

export interface ApproveModalProps {
  isOpen: boolean
}

const ApproveModal = ({ isOpen }: ApproveModalProps) => {
  return (
    <Modal isClickAwayCloseAllowed={false} isClosable={false} isOpen={isOpen}>
      <div className={styles.root}>
        <h4 className={styles.title}>Approve the contract</h4>
        <ApproveContract className={styles.image} />
        <div className={styles.body}>This action will allow us to manage your funds</div>
        <Loader className={styles.loader} />
      </div>
    </Modal>
  )
}

export default ApproveModal
