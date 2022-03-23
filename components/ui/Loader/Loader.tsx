import React from 'react'

import styles from './Loader.module.scss'

interface Props {
  className?: string
  size?: 'small' | 'medium'
}

const Loader = ({ className, size = 'medium' }: Props) => (
  <div className={[`${styles.root}`, `${styles[size]}`, className].join(' ')}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

export default Loader
