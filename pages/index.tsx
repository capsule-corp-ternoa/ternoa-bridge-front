import Head from 'next/head'

import Footer from 'components/base/Footer'
import Header from 'components/base/Header'
import Homepage from 'components/pages/Homepage'
import MobileHeader from 'components/base/MobileHeader'

export default function Home() {
  return (
    <>
      <Head>
        <title>Ternoa Bridge</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Ternoa Bridge" />
      </Head>

      <div className="disclaimer">Warning: this bridge is currently being audited. Use it at your own risks.</div>
      <header className="container">
        <Header />
        <MobileHeader />
      </header>

      <Homepage />

      <Footer />
    </>
  )
}
