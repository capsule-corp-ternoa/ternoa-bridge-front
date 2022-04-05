import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'redux/hooks'

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
import { actions as appActions } from 'redux/app/actions'
import { handleNetworkPair } from 'utils/networks'
import { formatPrice } from 'utils/strings'

import styles from './Transfer.module.scss'

const Transfer = () => {
  const [amount, setAmount] = useState<number>(0)
  const [origin, setOrigin] = useState<'from' | 'to' | undefined>(undefined)
  const [response, setResponse] = useState<{ message: string; txLink: string; isError: boolean }>()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false)
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)

  const dispatch = useAppDispatch()
  const { app } = useAppSelector((state) => state.app)
  const { user } = useAppSelector((state) => state.user)

  const { fromNetwork: from, toNetwork: to } = app
  const balance = isConnected(from, user) ? getBalance(from, user) : undefined

  const handleNetworkChange = (rawOrigin: 'from' | 'to' | undefined, network: ChainType) => {
    setAmount(0)
    handleNetworkPair(from, to, rawOrigin, network, dispatch)
  }

  const handleNetworkSwicth = async () => {
    const newFrom = to
    const newTo = from

    try {
      if (user.ercWallet?.connectedWith === 'metamask') {
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
      }
    } catch (error) {
      console.log(error)
    }

    setAmount(0)
    dispatch(appActions.setFromNetwork(newFrom))
    dispatch(appActions.setToNetwork(newTo))
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
              origin="from"
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
              origin="to"
              variant="input"
            />
          </div>

          <Input
            advise={`Min: ${formatPrice(MIN_AMOUNT, {})} CAPS / Max: ${formatPrice(MAX_AMOUNT, {})} CAPS`}
            className={[`${styles.field}`, `${styles.amountField}`].join(' ')}
            endComponent={
              <button
                className={styles.maxButton}
                disabled={balance === undefined}
                onClick={() =>
                  balance !== undefined && balance >= 0 && setAmount(balance < MAX_AMOUNT ? balance : MAX_AMOUNT)
                }
              >
                Max
              </button>
            }
            error={handleInputError()}
            insight={balance !== undefined && balance >= 0 ? `Balance: ${formatPrice(balance, {})} CAPS` : undefined}
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
        <ConfirmModal amount={amount} handleContinue={handleConfirmTransaction} setExpanded={setIsConfirmModalOpen} />
      )}
      {isLoadingModalOpen && <LoadingModal />}
      {isResultModalOpen && (
        <ResultModal
          body={!response ? '' : response.message}
          link={!response ? '' : response.txLink}
          isError={!response ? false : response.isError}
          setExpanded={setIsResultModalOpen}
        />
      )}
      {isNetworkModalOpen && (
        <NetworkModal origin={origin} handleNetworkPair={handleNetworkChange} setExpanded={setIsNetworkModalOpen} />
      )}
    </>
  )
}

export default Transfer
