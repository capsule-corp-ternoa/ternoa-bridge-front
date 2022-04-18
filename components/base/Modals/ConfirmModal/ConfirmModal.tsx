import React, { useEffect, useState } from 'react'

import Arrow from 'assets/svgComponents/Arrow'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Modal from 'components/ui/Modal'
import Radio from 'components/ui/Radio'

import { approve, getAddress, getNetworkFees, isApproved as isApprovedHelper } from 'helpers/bridge'
import { getBridgeFees } from 'helpers/polkadot'
import { useAppSelector } from 'redux/hooks'
import { formatPrice, middleEllipsis } from 'utils/strings'

import transferStyles from '../../Transfer/Transfer.module.scss'
import styles from './ConfirmModal.module.scss'

export interface ConfirmModalProps {
  amount: number
  handleContinue: () => void
  setExpanded: (b: boolean) => void
  setResponse: (
    response: { message: string; newBalance?: number; txLink: string; isError: boolean } | undefined
  ) => void
  setIsResultModalOpen: (b: boolean) => void
}

const ConfirmModal = ({
  amount,
  handleContinue,
  setExpanded,
  setResponse,
  setIsResultModalOpen,
}: ConfirmModalProps) => {
  const [fees, setFees] = useState('')
  const [isApprovalLoading, setIsApprovalLoading] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isTermsRadioChecked, setIsTermsRadioChecked] = useState(false)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [bridgeFee, setBridgeFee] = useState(0)
  const { app } = useAppSelector((state) => state.app)
  const { user } = useAppSelector((state) => state.user)

  const { fromNetwork: from, toNetwork: to } = app

  const toAddress = getAddress(to, user)

  const handleApprove = async () => {
    setIsApprovalLoading(true)
    try {
      const tx = await approve(from, to, user)
      const receipt = await tx.wait()
      if (receipt && receipt.status === 1) {
        //Set timeout in case fees estimation triggers too quickly
        setTimeout(() => {
          setIsApproved(true)
        }, 2000)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsApprovalLoading(false)
    }
  }

  useEffect(() => {
    let shouldUpdate = true

    if (shouldUpdate && !isFirstRender) setExpanded(false)
    if (shouldUpdate && isFirstRender) setIsFirstRender(false)

    return () => {
      shouldUpdate = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, from, setExpanded, to, user])

  useEffect(() => {
    let shouldUpdate = true
    const getFees = async () => {
      try {
        if (isApproved) {
          const { value, unit } = await getNetworkFees(from, to, amount, user)
          if (shouldUpdate) setFees(`${Number(value).toFixed(6)} ${unit}`)
        }
      } catch (error) {
        console.error(error)
        if (shouldUpdate) {
          setFees('Unable to estimate fees')
          setExpanded(false)
          setIsResultModalOpen(true)
          setResponse({
            message: 'Unable to estimate fees',
            txLink: '',
            isError: true,
          })
        }
      }
    }

    getFees()
    return () => {
      shouldUpdate = false
    }
  }, [amount, from, to, user, isApproved, setExpanded, setResponse, setIsResultModalOpen])

  useEffect(() => {
    let shouldUpdate = true
    const setBridgeFees = async () => {
      try {
        const fee = await getBridgeFees()
        if (shouldUpdate) setBridgeFee(fee)
      } catch (err) {
        console.error(err)
      }
    }
    setBridgeFees()
    return () => {
      shouldUpdate = false
    }
  }, [])

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
            <NetworkInput className={transferStyles.networkInput} network={from} variant="preview" />
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
            <NetworkInput className={transferStyles.networkInput} network={to} variant="preview" />
          </div>
        </div>
        <div className={styles.resume}>
          {toAddress && (
            <div className={styles.resumeLine}>
              <span className={styles.resumeItem}>Destination</span>
              <span className={styles.resumeItem}>{middleEllipsis(toAddress)}</span>
            </div>
          )}
          <div className={styles.resumeLine}>
            <span className={styles.resumeItem}>Network Fee*</span>
            {fees ? <span className={styles.resumeItem}>{fees}</span> : <div className={styles.shimmerLoading} />}
          </div>
          {from === 'ternoa' && to === 'erc20' && (
            <div className={styles.resumeLine}>
              <span className={styles.resumeItem}>Bridge Fee*</span>
              <span className={styles.resumeItem}>{`${bridgeFee} CAPS`}</span>
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
          disabled={isApprovalLoading || !isTermsRadioChecked}
          isLoading={isApprovalLoading}
          onClick={isApproved ? handleContinue : handleApprove}
          size="medium"
          text={isApproved ? 'Continue' : 'Approve'}
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
