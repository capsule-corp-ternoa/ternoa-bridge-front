import React from 'react'

import Transfer from 'components/base/Transfer'

import styles from './Homepage.module.scss'

const Homepage = () => (
  <main className="container">
    <div className="wrapper">
      <h1 className={styles.title}>Token Bridge</h1>
      <p className={styles.description}>The safest and fastest way to swap your ERC20 CAPS to Ternoa Native CAPS.</p>
      <div className={styles.transfer}>
        <Transfer />
      </div>
      <div className={styles.documentation}>
        <div className={styles.indicator} />
        <p className={styles.insight}>
          💡 Unlike many other bridges, the Ternoa Bridge will lock your ERC20 CAPS and mint the equivalent in native
          CAPS on the Ternoa Network.
        </p>
        <p className={styles.insight}>
          - In case you decide to sell your native CAPS, you will need to transfer it back to the Ethereum network by
          using the Ternoa Bridge again.
        </p>
        <p className={styles.insight}>
          - The native CAPS are necessary to take part in staking and rewards, as well as paying transaction fees in the
          Ternoa ecosystem.
        </p>
      </div>
    </div>
  </main>
)

export default Homepage
