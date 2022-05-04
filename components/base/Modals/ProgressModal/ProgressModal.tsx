import React from 'react'

import Coin from 'assets/svgComponents/Coin'
import Warning from 'assets/svgComponents/Warning'
import Loader from 'components/ui/Loader'
import Modal from 'components/ui/Modal'
import { IResponse, ITx, TransactionLifeCycleStatus } from 'interfaces'
import { middleEllipsis } from 'utils/strings'

import styles from './ProgressModal.module.scss'
import { RELAYER_THRESHOLD } from 'helpers/bridge'

enum StepperStatus {
  CURRENT = 'current',
  DONE = 'done',
  FAILED = 'failed',
  VOID = 'void',
}

export interface ProgressModalProps {
  handleClose: () => void
  isOpen: boolean
  response: IResponse
}

const ProgressModal = ({ handleClose, isOpen, response }: ProgressModalProps) => {
  const { body, isTxSubmitted, status, tx, voteTxs } = response
  const stepper1Status = (status: TransactionLifeCycleStatus, tx?: ITx) => {
    if (tx === undefined) {
      if (status === TransactionLifeCycleStatus.TX_FAILED) {
        return StepperStatus.FAILED
      }
      return StepperStatus.CURRENT
    } else if (tx.isError) {
      return StepperStatus.FAILED
    } else {
      return StepperStatus.DONE
    }
  }

  const stepper2Status = (status: TransactionLifeCycleStatus, voteTxs: ITx[], tx?: ITx) => {
    if (stepper1Status(status, tx) === StepperStatus.DONE) {
      if (status === TransactionLifeCycleStatus.TX_FAILED && voteTxs.length < RELAYER_THRESHOLD) {
        return StepperStatus.FAILED
      } else if (voteTxs.length < RELAYER_THRESHOLD) {
        return StepperStatus.CURRENT
      } else {
        return StepperStatus.DONE
      }
    } else {
      return StepperStatus.VOID
    }
  }

  const stepper3Status = () => {
    if (status === TransactionLifeCycleStatus.TX_SUCCESS) {
      return StepperStatus.DONE
    } else {
      return StepperStatus.VOID
    }
  }

  return (
    <Modal
      handleClose={handleClose}
      isClickAwayCloseAllowed={false}
      isClosable={status === TransactionLifeCycleStatus.TX_SUCCESS || status === TransactionLifeCycleStatus.TX_FAILED}
      isOpen={isOpen}
    >
      <div className={styles.root}>
        {status === TransactionLifeCycleStatus.TX_PENDING && (
          <>
            <Loader useLottie />
            <div className={styles.title}>Pending transfer...</div>
          </>
        )}
        {status === TransactionLifeCycleStatus.TX_FAILED && (
          <>
            <Warning className={styles.warning} />
            <div className={styles.title}>Transaction rejected</div>
          </>
        )}
        {status === TransactionLifeCycleStatus.TX_SUCCESS && (
          <>
            <div className={styles.coinIcon}>
              <Coin />
            </div>
            <div className={styles.title}>Transfer success</div>
          </>
        )}
        {isTxSubmitted && (
          <ul className={styles.progressList}>
            <li className={[`${styles.step}`, `${styles[stepper1Status(status, tx)]}`].join(' ')}>
              <div className={styles.stepTitle}>
                {stepper1Status(status, tx) === StepperStatus.DONE
                  ? 'Tx approved'
                  : stepper1Status(status, tx) === StepperStatus.FAILED
                  ? 'Tx rejected'
                  : 'Tx pending...'}
              </div>
              {tx &&
                (tx.link.length > 0 ? (
                  <a className={styles.link} href={tx.link} target="_blank" rel="noreferrer">
                    {middleEllipsis(tx.hash, 16)}
                  </a>
                ) : (
                  middleEllipsis(tx.hash, 16)
                ))}
            </li>
            {voteTxs && (
              <li className={[`${styles.step}`, `${styles[stepper2Status(status, voteTxs, tx)]}`].join(' ')}>
                <div className={[`${styles.stepTitle}`, `${styles[stepper2Status(status, voteTxs, tx)]}`].join(' ')}>
                  {stepper2Status(status, voteTxs, tx) === StepperStatus.VOID
                    ? `Relayers will start voting on tx approved`
                    : stepper2Status(status, voteTxs, tx) === StepperStatus.FAILED
                    ? 'An error is encountered during contract execution'
                    : `Waiting for vote proposals... (${voteTxs.length}/${RELAYER_THRESHOLD})`}
                </div>
                <ul>
                  {voteTxs.map((voteTx, index) => (
                    <li key={index} className={styles.stepLabel}>
                      <span>{`Vote proposal ${index + 1} (`}</span>
                      <span>
                        {voteTx.link.length > 0 ? (
                          <a className={styles.link} href={voteTx.link} target="_blank" rel="noreferrer">
                            {middleEllipsis(voteTx.hash, 16)}
                          </a>
                        ) : (
                          `${middleEllipsis(voteTx.hash, 16)}`
                        )}
                      </span>
                      <span>{')'}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )}
            <li className={[`${styles.step}`, `${styles[stepper3Status()]}`].join(' ')}>
              {status === TransactionLifeCycleStatus.TX_PENDING && <div className={styles.stepTitle}>Transaction execution...</div>}
              {status === TransactionLifeCycleStatus.TX_FAILED && <div className={styles.stepTitle}>Transaction failed</div>}
              {status === TransactionLifeCycleStatus.TX_SUCCESS && <div className={styles.stepTitle}>Transaction executed</div>}
            </li>
          </ul>
        )}
        {body && <div className={styles.body}>{body}</div>}
      </div>
    </Modal>
  )
}

export default ProgressModal
