import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'

import { store } from 'redux/store'
import PasswordProtection from 'components/base/PasswordProtection'

import 'style/main.scss'

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <Provider store={store}>
      <PasswordProtection>
        <div className="polygon">
          <div className="polygon1" />
          <div className="polygon2" />
          <div className="polygon3" />
        </div>
        <Component {...pageProps} />
      </PasswordProtection>
    </Provider>
  )
}

export default App
