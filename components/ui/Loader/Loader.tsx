import React, { useEffect, useRef, useState } from 'react'

import styles from './Loader.module.scss'

interface Props {
  className?: string
  size?: 'small' | 'medium'
  useLottie?: boolean
}

const Loader = ({ className, size, useLottie = false }: Props) => {
  const ref = useRef(null)
  const [lottie, setLottie] = useState<any>(null)
  const [lottieLoaded, setLottieLoaded] = useState(false)

  useEffect(() => {
    let shouldImport = true
    if (useLottie) {
      import('lottie-web').then((Lottie) => {
        if (shouldImport) {
          setLottie(Lottie.default)
        }
      })
    }
    return () => {
      shouldImport = false
    }
  }, [useLottie])

  useEffect(() => {
    let shouldUpdate = true
    const getLottieLoader = async () => {
      try {
        if (lottie && ref.current) {
          const animation = await lottie.loadAnimation({
            container: ref.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/lottieLoaderWhite.json',
          })
          if (shouldUpdate) return () => animation.destroy()
        }
      } catch (error) {
        console.log(error)
      }
    }

    const timer = setTimeout(() => {
      return
    }, 2000)
    getLottieLoader()
    if (shouldUpdate) setLottieLoaded(true)

    return () => {
      shouldUpdate = false
      clearTimeout(timer)
    }
  }, [lottie])

  return useLottie && lottieLoaded ? (
    <div className={[`${styles.rootLottie}`, `${size ? styles[size] : ''}`, className].join(' ')} ref={ref} />
  ) : (
    <div className={[`${styles.root}`, `${size ? styles[size] : ''}`, className].join(' ')}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default Loader
