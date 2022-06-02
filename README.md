<h1 align="center">
  <a href="https://bridge.ternoa.network">
    <p>Ternoa Bridge</p>
    <p>🌉</p>
  </a>
</h1>

<h3 align="center">
  The safest and fastest way to swap your ERC20 CAPS to Ternoa Native CAPS.
</h3>

</br>
</br>

# Development

## Environment Setup

This is a [Next.js](https://nextjs.org/) project using CSS modules and redux.

Install package dependencies and run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure

[Helpers](helpers) are splitted based on both erc and substrate based chains ecosystems.

- [polkadot.ts](helpers/polkadot.ts) handled the [polkadot{.js} extension](https://github.com/polkadot-js/extension) connection and the API initialization with the [Ternoa chain](https://github.com/capsule-corp-ternoa/chain) in order to call bridge extrinsic to execute a _TERNOA -> ERC20_ transfer.
- [erc.ts](helpers/erc.ts) handled contracts for _ERC20 <-> BEP20_ and _ERC20 -> TERNOA_ transfers.

Metamask and WalletConnect are the supported wallets to interact with the bridge dapp on the erc20/bep20 networks. Each one has its own dedicated helper in [metamask.ts](helpers/metamask.ts) or [walletconnect.ts](helpers/walletconnect.ts).

[bridge.ts](helpers/bridge.ts) supplies functions for the front-end components.

# Notes

Unlike many other bridges, the Ternoa Bridge will lock your ERC20 CAPS and mint the equivalent in native CAPS on the Ternoa Network.

- In case you decide to sell your native CAPS, you will need to transfer it back to the Ethereum network by using the Ternoa Bridge again.

- The native CAPS are necessary to take part in staking and rewards, as well as paying transaction fees in the Ternoa ecosystem.

</br>

ERC20 contracts are build using [ChainBridge](https://github.com/ChainSafe/ChainBridge), a modular Multi-Directional Blockchain Bridge to interact with Ethereum, Substrate, based chains networks.
