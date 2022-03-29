import React, { useState } from 'react'

import { useAppSelector } from 'redux/hooks'

import Arrow from 'assets/svgComponents/Arrow'
import Switch from 'assets/svgComponents/Switch'
import ConfirmModal from 'components/base/Modals/ConfirmModal'
import LoadingModal from 'components/base/Modals/LoadingModal'
import SuccessModal from 'components/base/Modals/SuccessModal'
import NetworkModal from 'components/base/Modals/NetworkModal'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Input from 'components/ui/Input'
import { canProceed, getBalance, MAX_AMOUNT, MIN_AMOUNT } from 'helpers/bridge'
import { AVAILABLE_NETWORKS, ChainType } from 'interfaces'
import { formatPrice } from 'utils/strings'

import styles from './Transfer.module.scss'

const Transfer = () => {
  const [from, setFrom] = useState<ChainType>('erc20')
  const [to, setTo] = useState<ChainType>('ternoa')
  const [amount, setAmount] = useState<number>(0)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [isLoadingModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [origin, setOrigin] = useState<'from' | 'to'>('from')
  const { user } = useAppSelector((state) => state.user)

  const balance = getBalance(from, user)

  const handleNetwork = (origin: 'from' | 'to', network: ChainType) => {
    if (origin === 'from') {
      setFrom(network)
      if (to === network) {
        setTo(AVAILABLE_NETWORKS.filter((item) => item !== network)[0])
      }
    } else {
      setTo(network)
      if (from === network) {
        setFrom(AVAILABLE_NETWORKS.filter((item) => item !== network)[0])
      }
    }
  }

  const handleNetworkSwicth = () => {
    setAmount(0)
    const newFrom = to
    const newTo = from
    setFrom(newFrom)
    setTo(newTo)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value))
  }

  return (
    <>
      <div className={styles.outterContainer}>
        <div className={styles.mainContainer}>
          <div className={styles.field}>
            <div className={styles.top}>
              <span className={styles.label}>From</span>
            </div>
            <NetworkInput
              className={styles.networkInput}
              network={from}
              onClick={() => {
                setOrigin('from')
                setIsNetworkModalOpen(true)
              }}
              variant="input"
            />
          </div>

          <div className={styles.switch}>
            <div className={styles.separator} />
            <button className={styles.switchButton} aria-label="Switch Network" onClick={handleNetworkSwicth}>
              <Arrow className={styles.arrowSvg} />
              <Switch />
            </button>
          </div>

          <div className={styles.field}>
            <div className={styles.top}>
              <span className={styles.label}>To</span>
            </div>
            <NetworkInput
              className={styles.networkInput}
              network={to}
              onClick={() => {
                setOrigin('to')
                setIsNetworkModalOpen(true)
              }}
              variant="input"
            />
          </div>

          <Input
            className={[`${styles.field}`, `${styles.amountField}`].join(' ')}
            endComponent={
              <button className={styles.maxButton} onClick={() => balance && setAmount(balance)}>
                Max
              </button>
            }
            insight={balance !== undefined ? `Balance: ${formatPrice(balance, {})} CAPS` : undefined}
            isError={amount !== 0 && (amount < MIN_AMOUNT || amount > MAX_AMOUNT || amount > Number(balance))}
            label="Amount"
            max={MAX_AMOUNT}
            min={MIN_AMOUNT}
            name="amount"
            onChange={handleAmountChange}
            placeholder="Enter an amount..."
            type="number"
            value={amount || ''}
          />

          <Button
            className={styles.button}
            color="primary500"
            disabled={!canProceed(from, to, amount, user)}
            onClick={() => setIsConfirmModalOpen(true)}
            size="medium"
            text="Continue"
            variant="rectangle"
          />
        </div>
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          amount={amount}
          from={from}
          to={to}
          setExpanded={setIsConfirmModalOpen}
          setIsNetworkModalOpen={setIsNetworkModalOpen}
          setOrigin={setOrigin}
        />
      )}
      {isLoadingModalOpen && <LoadingModal />}
      {isSuccessModalOpen && (
        <SuccessModal body="Please check your wallet balance!" setExpanded={setIsSuccessModalOpen} />
      )}
      {isNetworkModalOpen && (
        <NetworkModal origin={origin} handleNetwork={handleNetwork} setExpanded={setIsNetworkModalOpen} />
      )}
    </>
  )
}

export default Transfer
