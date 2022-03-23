import Head from 'next/head'

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

      <MobileHeader />

      <main>MAIN</main>

      <footer>FOOTER</footer>
    </>
  )
}
