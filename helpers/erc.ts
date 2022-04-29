import { ethers, Contract, Signer } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants'
import { BRIDGE_CONTRACT_ABI, CAPS_CONTRACT_ABI } from './abis'
import { ERCProvider, ErcWallet, User } from '../interfaces'
import { AnyAction } from 'redux'
import { clear, get, USER_ERC_CONNECTED_WITH } from './storage'
import { connect as connectMetamask } from './metamask'
import { connect as connectWalletConnect } from './walletconnect'
import { formatInput, getNativeTokenId, ss58ToHex } from './polkadot'
import { Interface, keccak256, solidityPack, toUtf8Bytes } from 'ethers/lib/utils'
import { sleep } from 'utils/system'
import { BLOCK_LIMIT, RELAYER_THRESHOLD, SLEEP_INTERVAL } from './bridge'

export const NUMBER_OF_DECIMALS = 18

export const ETH_CHAIN_ID = process.env.NEXT_PUBLIC_ETH_CHAIN_ID ? Number(process.env.NEXT_PUBLIC_ETH_CHAIN_ID) : 1
export const BSC_CHAIN_ID = 56

const BSC_ETH_BRIDGE_ADDRESS = '0xE83eA178D7FE5a7dfFD597d5e887d99d279Aa030'
const TERNOA_ETH_BRIDGE_CONTRACT = process.env.NEXT_PUBLIC_TERNOA_ETH_BRIDGE_CONTRACT || '0x4FaeD4D60FF265056354EB67e4e12117E5b92284' //TODO default to mainnet
const TERNOA_ETH_BRIDGE_HANDLER_CONTRACT = process.env.NEXT_PUBLIC_TERNOA_ETH_BRIDGE_HANDLER_CONTRACT || '0x1d3c765472119483C2Cb28D1be6D8aAD43273daB' //TODO default to mainnet

const CAPS_TOKEN_ADDRESS_ETH = process.env.NEXT_PUBLIC_CAPS_TOKEN_ADDRESS_ETH || '0x03be5c903c727ee2c8c4e9bc0acc860cca4715e2'
const CAPS_TOKEN_ADDRESS_BSC = '0xffba7529ac181c2ee1844548e6d7061c9a597df4'

const providerName = ETH_CHAIN_ID === 1 ? 'mainnet' : ETH_CHAIN_ID === 5 ? 'goerli' : 'rinkeby'
export const PROVIDER_BASE_URL_ETH = `https://${providerName}.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
export const PROVIDER_BASE_URL_BSC = 'https://bsc-dataseed.binance.org/'

const TERNOA_DEST_ID = 0

const getTokenContract = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  const tokenContractAddress = chainId === ETH_CHAIN_ID ? CAPS_TOKEN_ADDRESS_ETH : CAPS_TOKEN_ADDRESS_BSC
  const contract = new Contract(tokenContractAddress, CAPS_CONTRACT_ABI, signer)
  return contract
}

const getBridgeContract = async (signer: Signer) => {
  const contract = new Contract(TERNOA_ETH_BRIDGE_CONTRACT, BRIDGE_CONTRACT_ABI, signer)
  return contract
}

const getDefaultProvider = async (chainId: number) => {
  const providerUrl = chainId === ETH_CHAIN_ID ? PROVIDER_BASE_URL_ETH : PROVIDER_BASE_URL_BSC
  const provider = ethers.providers.getDefaultProvider(providerUrl)
  return provider
}

export const reconnect = async (dispatch: (action: AnyAction) => void) => {
  try {
    const ercConnectedWith = get(USER_ERC_CONNECTED_WITH)
    if (ercConnectedWith) {
      if (ercConnectedWith === 'metamask') {
        connectMetamask(dispatch)
      } else {
        connectWalletConnect(dispatch)
      }
    }
  } catch (err) {
    console.error(err)
    clear(USER_ERC_CONNECTED_WITH)
  }
}

export const getErcWalletFromSigner = async (signer: Signer, connectedWith: ERCProvider): Promise<ErcWallet> => {
  const chainId = await signer.getChainId()
  return {
    address: await signer.getAddress(),
    chainId: chainId,
    connectedWith: connectedWith,
    chainType: ETH_CHAIN_ID === chainId ? 'erc20' : chainId === BSC_CHAIN_ID ? 'bep20' : 'other',
    capsBalance: await getBalance(signer),
    signer,
  }
}

export const formatBalance = async (balance: string) => {
  return Number(Number(balance).toFixed(3))
}

export const getBalance = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) return 0
  const contract = await getTokenContract(signer)
  const balance = await contract.balanceOf(await signer.getAddress())
  return formatBalance(ethers.utils.formatUnits(balance))
}

export const isApproved = async (signer: Signer) => {
  const contract = await getTokenContract(signer)
  const owner = await signer.getAddress()
  const spender = TERNOA_ETH_BRIDGE_HANDLER_CONTRACT
  const amount = await contract.allowance(owner, spender)
  return amount > 0
}

export const approve = async (signer: Signer) => {
  const contract = await getTokenContract(signer)
  const spender = TERNOA_ETH_BRIDGE_HANDLER_CONTRACT
  return contract.approve(spender, MaxUint256)
}

export const getEstimateFees = async (contract: ethers.Contract, signer: Signer, functionName: string, args: any[] = []) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id for gas estimation')
  const gasLimit = await contract.estimateGas[functionName](...args)
  const defaultProvider = await getDefaultProvider(chainId)
  const gasPrice = await defaultProvider.getGasPrice()
  const fees = ethers.utils.formatEther(gasPrice.mul(gasLimit))
  return fees
}

/* ETH <-> BSC */

export const getTransferBscEthFees = async (signer: Signer, amount: number) => {
  const numberOfTokens = ethers.utils.parseUnits(amount.toString(), NUMBER_OF_DECIMALS)
  const contract = await getTokenContract(signer)
  const fees = await getEstimateFees(contract, signer, 'transfer', [BSC_ETH_BRIDGE_ADDRESS, numberOfTokens])
  return fees
}

export const transferBscEth = async (signer: Signer, amount: number) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id for transfer')
  const contract = await getTokenContract(signer)
  const numberOfTokens = ethers.utils.parseUnits(amount.toString(), NUMBER_OF_DECIMALS)
  return contract.transfer(BSC_ETH_BRIDGE_ADDRESS, numberOfTokens)
}

/* ETH -> TERNOA */

const formatData = (address: string, amount: number, convert = true) => {
  const bnAmount = ethers.BigNumber.from(formatInput(amount).toString())
  const convertedAddress = convert ? ss58ToHex(address) : address
  return (
    '0x' +
    ethers.utils.hexZeroPad(bnAmount.toHexString(), 32).substring(2) +
    ethers.utils.hexZeroPad(ethers.utils.hexlify((convertedAddress.length - 2) / 2), 32).substring(2) +
    convertedAddress.substring(2)
  )
}

const getTransferEthTernoaParams = async (user: User, amount: number) => {
  if (!user) throw new Error('User not found')
  if (!user.ercWallet?.signer) throw new Error('Signer not found')
  if (!user.polkadotWallet?.address) throw new Error('Polkadot address not found')
  const destChainId = TERNOA_DEST_ID
  const ressourceId = getNativeTokenId()
  const data = formatData(user.polkadotWallet.address, amount)
  return [destChainId, ressourceId, data]
}

export const getTransferEthTernoaFees = async (user: User, amount: number): Promise<string> => {
  if (!user) throw new Error('User not found')
  if (!user.ercWallet?.signer) throw new Error('Signer not found')
  const [destChainId, ressourceId, data] = await getTransferEthTernoaParams(user, amount)
  const contract = await getBridgeContract(user.ercWallet.signer)
  const fees = await getEstimateFees(contract, user.ercWallet.signer, 'deposit', [destChainId, ressourceId, data])
  return fees
}

export const transferEthTernoa = async (user: User, amount: number) => {
  if (!user) throw new Error('User not found')
  if (!user.ercWallet?.signer) throw new Error('Signer not found')
  const [destChainId, ressourceId, data] = await getTransferEthTernoaParams(user, amount)
  const contract = await getBridgeContract(user.ercWallet.signer)
  return contract.deposit(destChainId, ressourceId, data)
}

export const waitForResponseTernoaEth = async (user: User, amount: number) => {
  const hashes: string[] = []
  if (!user.ercWallet) throw new Error('Erc address not found')
  if (!process.env.NEXT_PUBLIC_TERNOA_ETH_BRIDGE_HANDLER_CONTRACT) throw new Error('ERC20 Handler contract address not found')
  const chainId = await user.ercWallet.signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) throw new Error('Invalid chain id to wait for response')
  const bridgeContractInterface = new Interface(BRIDGE_CONTRACT_ABI)
  const contract = await getBridgeContract(user.ercWallet?.signer as Signer)
  const data = formatData(user.ercWallet.address, amount, false)
  const dataHash = keccak256(solidityPack(['address', 'bytes'], [process.env.NEXT_PUBLIC_TERNOA_ETH_BRIDGE_HANDLER_CONTRACT, data]))
  const provider = await getDefaultProvider(chainId)
  const startBlockNumber = await provider.getBlockNumber()
  while (true) {
    const currentBlockNumber = await provider.getBlockNumber()
    const logs = await provider.getLogs({
      address: contract.address,
      fromBlock: startBlockNumber,
      topics: [keccak256(toUtf8Bytes('ProposalVote(uint8,uint64,uint8,bytes32)'))],
    })
    for (const log of logs) {
      const event = bridgeContractInterface.parseLog(log)
      const logDatahash: string = event.args[3]
      if (logDatahash.toLowerCase() === dataHash.toLowerCase() && !hashes.includes(log.transactionHash)) {
        hashes.push(log.transactionHash)
      }
    }
    if (hashes.length >= RELAYER_THRESHOLD) {
      return hashes
    }
    if (currentBlockNumber - startBlockNumber > BLOCK_LIMIT) {
      throw new Error(
        "We could not find the final transaction, please contact the support if you don't receive your funds in few minutes (your funds are safe)"
      )
    }
    await sleep(SLEEP_INTERVAL)
  }
}
