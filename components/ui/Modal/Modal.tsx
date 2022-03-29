import React from 'react'
import ClickAwayListener from 'react-click-away-listener'

import Close from 'assets/svgComponents/Close'

import styles from './Modal.module.scss'

export interface ModalProps {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>> & React.ReactNode
  setExpanded?: (b: boolean) => void
}

const Modal: React.FC<ModalProps> = ({ children, setExpanded }) => (
  <div className={styles.root}>
    <ClickAwayListener
      onClickAway={() => {
        if (setExpanded) setExpanded(false)
      }}
    >
      <div className={styles.modalContainer}>
        {setExpanded !== undefined && (
          <div className={styles.close} onClick={() => setExpanded(false)}>
            <Close />
          </div>
        )}
        {children}
      </div>
    </ClickAwayListener>
  </div>
)

export default Modal
