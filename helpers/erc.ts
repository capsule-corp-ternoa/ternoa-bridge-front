import { ethers, Contract, Signer } from 'ethers'
import {
  BSC_CHAIN_ID,
  CAPS_CONTRACT_ABI,
  CAPS_TOKEN_ADDRESS_BSC,
  CAPS_TOKEN_ADDRESS_ETH,
  ETH_CHAIN_ID,
  PROVIDER_BASE_URL_ETH,
  PROVIDER_BASE_URL_BSC,
} from '../helpers/constants'
import { ERCProvider, ErcWallet } from '../interfaces'

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

export const getBalance = async (signer: Signer) => {
  const chainId = await signer.getChainId()
  if (chainId !== ETH_CHAIN_ID && chainId !== BSC_CHAIN_ID) return '0'
  const providerUrl = chainId === ETH_CHAIN_ID ? PROVIDER_BASE_URL_ETH : PROVIDER_BASE_URL_BSC
  const tokenContractAddress = chainId === ETH_CHAIN_ID ? CAPS_TOKEN_ADDRESS_ETH : CAPS_TOKEN_ADDRESS_BSC
  const provider = ethers.providers.getDefaultProvider(providerUrl)
  const contract = new Contract(tokenContractAddress, CAPS_CONTRACT_ABI, provider)
  const balance = await contract.balanceOf(await signer.getAddress())
  const readableBalance = ethers.utils.formatUnits(balance)
  return readableBalance
}
