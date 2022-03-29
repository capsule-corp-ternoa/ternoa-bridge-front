import React, { useEffect, useState } from 'react'

import Arrow from 'assets/svgComponents/Arrow'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import Radio from 'components/ui/Radio'

import { getAddress, getNetworkFees, isApproved as isApprovedHelper } from 'helpers/bridge'
import { ChainType } from 'interfaces'
import { useAppSelector } from 'redux/hooks'
import { formatPrice, middleEllipsis } from 'utils/strings'

import transferStyles from '../../Transfer/Transfer.module.scss'
import styles from './ConfirmModal.module.scss'

export interface ConfirmModalProps {
  amount: number
  from: ChainType
  to: ChainType
  setExpanded: (b: boolean) => void
  setIsNetworkModalOpen: (b: boolean) => void
  setOrigin: (origin: 'from' | 'to') => void
}

const ConfirmModal = ({ amount, from, to, setExpanded, setIsNetworkModalOpen, setOrigin }: ConfirmModalProps) => {
  const [fees, setFees] = useState('')
  const [isApproved, setIsApproved] = useState(false)
  const [isTermsRadioChecked, setIsTermsRadioChecked] = useState(false)
  const { user } = useAppSelector((state) => state.user)

  const toAddress = getAddress(to, user)

  const handleApprove = () => {
    console.log('Approve')
  }

  const handleContinue = () => {
    return
  }

  useEffect(() => {
    let shouldUpdate = true
    const getFees = async () => {
      const { value, unit } = await getNetworkFees(from, to, amount, user)
      if (shouldUpdate) setFees(`${Number(value).toFixed(6)} ${unit}`)
    }

    getFees()
    return () => {
      shouldUpdate = false
    }
  }, [amount, from, to, user])

  useEffect(() => {
    let shouldUpdate = true
    const loadApprove = async () => {
      const value = await isApprovedHelper(from, to, user)
      if (shouldUpdate) setIsApproved(value)
    }

    loadApprove()
    return () => {
      shouldUpdate = false
    }
  }, [from, to, user])

  return (
    <Modal setExpanded={setExpanded}>
      <div className={styles.root}>
        <h4 className={styles.title}>Confirmation</h4>
        <div className={styles.inputs}>
          <div className={transferStyles.field}>
            <div className={transferStyles.top}>
              <span className={transferStyles.label}>From</span>
            </div>
            <NetworkInput
              className={transferStyles.networkInput}
              network={from}
              onClick={() => {
                setOrigin('from')
                setIsNetworkModalOpen(true)
              }}
              variant="preview"
            />
          </div>

          <div className={transferStyles.switch}>
            <div className={transferStyles.separator} />
            <div className={styles.arrowWrapper}>
              <Arrow className={transferStyles.arrowSvg} />
            </div>
          </div>

          <div className={transferStyles.field}>
            <div className={transferStyles.top}>
              <span className={transferStyles.label}>To</span>
            </div>
            <NetworkInput
              className={transferStyles.networkInput}
              network={to}
              onClick={() => {
                setOrigin('to')
                setIsNetworkModalOpen(true)
              }}
              variant="preview"
            />
          </div>
        </div>
        <div className={styles.resume}>
          {toAddress && (
            <div className={styles.resumeLine}>
              <span className={styles.resumeItem}>Destination</span>
              <span className={styles.resumeItem}>{middleEllipsis(toAddress)}</span>
            </div>
          )}
          {fees && (
            <div className={styles.resumeLine}>
              <span className={styles.resumeItem}>Network Fee*</span>
              <span className={styles.resumeItem}>{fees}</span>
            </div>
          )}
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>You will receive</span>
            <span className={styles.resumeBoldItem}>{`${formatPrice(amount, {})} CAPS`}</span>
          </div>
        </div>
        <Radio
          className={styles.radio}
          checked={isTermsRadioChecked}
          name="terms"
          label="I have read and agree to the terms."
          onChange={() => setIsTermsRadioChecked(true)}
        />
        <Button
          className={styles.button}
          color="primary500"
          disabled={!isTermsRadioChecked}
          onClick={isApproved ? handleContinue : handleApprove}
          size="medium"
          text={isApproved ? 'Continue' : 'Approved'}
          variant="rectangle"
        />
        <div className={styles.advise}>
          *The network fees and execution price depend on the market condition, you may get a different rate when the
          transaction is complete
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
