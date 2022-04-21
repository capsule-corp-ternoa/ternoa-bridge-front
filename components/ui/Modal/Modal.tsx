import React, { useEffect } from 'react'
import ClickAwayListener from 'react-click-away-listener'

import Close from 'assets/svgComponents/Close'

import styles from './Modal.module.scss'

export interface ModalProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>> & React.ReactNode
  handleClose?: () => void
  isClickAwayCloseAllowed?: boolean
  isClosable?: boolean
  isOpen: boolean
}

const Modal: React.FC<ModalProps> = ({
  children,
  handleClose,
  isClickAwayCloseAllowed = true,
  isClosable = true,
  isOpen,
}) => {
  useEffect(() => {
    const body = document.querySelector('body')
    if (body) {
      if (isOpen) body.style.overflow = 'hidden'
      else body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.root}>
      <ClickAwayListener
        onClickAway={() => {
          if (isClickAwayCloseAllowed && handleClose !== undefined) handleClose()
        }}
      >
        <div className={styles.modalContainer}>
          {isClosable && (
            <div className={styles.close} onClick={handleClose}>
              <Close />
            </div>
          )}
          {children}
        </div>
      </ClickAwayListener>
    </div>
  )
}

export default Modal
