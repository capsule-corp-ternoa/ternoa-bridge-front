import React, { useEffect, useState } from 'react'

import { useAppSelector } from 'redux/hooks'

import Arrow from 'assets/svgComponents/Arrow'
import Switch from 'assets/svgComponents/Switch'
import ConfirmModal from 'components/base/Modals/ConfirmModal'
import LoadingModal from 'components/base/Modals/LoadingModal'
import ResultModal from 'components/base/Modals/ResultModal'
import NetworkModal from 'components/base/Modals/NetworkModal'
import NetworkInput from 'components/base/NetworkInput'
import Button from 'components/ui/Button'
import Input from 'components/ui/Input'
import { canProceed, getBalance, isConnected, MAX_AMOUNT, MIN_AMOUNT, transfer } from 'helpers/bridge'
import { switchBSCNetwork, switchETHNetwork } from 'helpers/metamask'
import { ChainType } from 'interfaces'
import { formatPrice } from 'utils/strings'

import styles from './Transfer.module.scss'

const ALLOWED_TRANSFERS = {
  erc20: ['bep20', 'ternoa'],
  bep20: ['erc20'],
  ternoa: ['erc20'],
  other: undefined,
}

const Transfer = () => {
  const [from, setFrom] = useState<ChainType>('erc20')
  const [to, setTo] = useState<ChainType>('ternoa')
  const [amount, setAmount] = useState<number>(0)
  const [response, setResponse] = useState<{ message: string; txLink: string; isError: boolean }>()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [origin, setOrigin] = useState<'from' | 'to'>('from')
  const { user } = useAppSelector((state) => state.user)

  const balance = getBalance(from, user)

  const handleNetwork = (origin: 'from' | 'to', network: ChainType) => {
    setAmount(0)
    const newAutoAssignedNetwork: ChainType | undefined =
      network === 'other' ? undefined : (ALLOWED_TRANSFERS[network][0] as ChainType)

    if (origin === 'from') {
      setFrom(network)
      if ((to === network || !ALLOWED_TRANSFERS[to]?.some((item) => item === network)) && newAutoAssignedNetwork) {
        setTo(newAutoAssignedNetwork)
      }
    } else {
      setTo(network)
      if ((from === network || !ALLOWED_TRANSFERS[from]?.some((item) => item === network)) && newAutoAssignedNetwork) {
        setFrom(newAutoAssignedNetwork)
      }
    }
  }

  const handleNetworkSwicth = async () => {
    const newFrom = to
    const newTo = from

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0)
        throw new Error('User is not logged in with Metamask, network switch is not available')

      switch (newFrom) {
        case 'erc20':
          if (user.ercWallet?.chainType !== 'erc20') switchETHNetwork()
          break
        case 'bep20':
          if (user.ercWallet?.chainType !== 'bep20') switchBSCNetwork()
          break
        default:
          break
      }
    } catch (error) {
      console.log(error)
    }

    setAmount(0)
    setFrom(newFrom)
    setTo(newTo)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value))
  }

  const handleInputError = () => {
    if (amount !== 0 && amount > Number(balance)) {
      return `Your funds are insufficient`
    } else if (amount !== 0 && amount < MIN_AMOUNT) {
      return `The CAPS amount must be greater than ${MIN_AMOUNT}`
    } else if (amount !== 0 && amount > MAX_AMOUNT) {
      return `The CAPS amount must be less than ${MAX_AMOUNT}`
    }

    return ''
  }

  const handleConfirmTransaction = async () => {
    setIsConfirmModalOpen(false)
    setIsLoadingModalOpen(true)
    await transfer(from, to, amount, user, setResponse)
  }

  useEffect(() => {
    let shouldUpdate = true

    if (shouldUpdate && response) {
      console.log(response)
      setIsLoadingModalOpen(false)
      setIsResultModalOpen(true)
    }

    return () => {
      shouldUpdate = false
    }
  }, [response])

  useEffect(() => {
    const body = document.querySelector('body')
    if (body) {
      if (isConfirmModalOpen || isNetworkModalOpen || isLoadingModalOpen || isResultModalOpen)
        body.style.overflow = 'hidden'
      else body.style.overflow = 'auto'
    }
  }, [isConfirmModalOpen, isNetworkModalOpen, isLoadingModalOpen, isResultModalOpen])

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
              forceIsConnected={
                ((from === 'erc20' && to === 'bep20') || (from === 'bep20' && to === 'erc20')) &&
                isConnected(from, user)
              }
              network={to}
              noNetworkData={(from === 'erc20' && to === 'bep20') || (from === 'bep20' && to === 'erc20')}
              onClick={() => {
                setOrigin('to')
                setIsNetworkModalOpen(true)
              }}
              variant="input"
            />
          </div>

          <Input
            advise={`Min: ${formatPrice(MIN_AMOUNT, {})} CAPS / Max: ${formatPrice(MAX_AMOUNT, {})} CAPS`}
            className={[`${styles.field}`, `${styles.amountField}`].join(' ')}
            endComponent={
              <button
                className={styles.maxButton}
                onClick={() => balance && setAmount(balance < MAX_AMOUNT ? balance : MAX_AMOUNT)}
              >
                Max
              </button>
            }
            error={handleInputError()}
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
          handleContinue={handleConfirmTransaction}
          setExpanded={setIsConfirmModalOpen}
          setIsNetworkModalOpen={setIsNetworkModalOpen}
          setOrigin={setOrigin}
        />
      )}
      {isLoadingModalOpen && <LoadingModal />}
      {isResultModalOpen && (
        <ResultModal
          body={!response ? '' : response.message}
          link={!response ? '' : response.txLink}
          setExpanded={setIsResultModalOpen}
        />
      )}
      {isNetworkModalOpen && (
        <NetworkModal origin={origin} handleNetwork={handleNetwork} setExpanded={setIsNetworkModalOpen} />
      )}
    </>
  )
}

export default Transfer
