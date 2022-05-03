import React from 'react'

import styles from './Radio.module.scss'

interface Props {
  checked?: boolean
  className?: string
  id?: string
  label?: string
  name?: string
  onChange?: () => void
  readOnly?: boolean
  value?: string
}

const Radio = ({ checked, className, id, label, name, onChange, readOnly, value }: Props) => (
  <label className={[`${styles.root}`, className].join(' ')}>
    <input className={styles.input} type="radio" id={id} checked={checked} name={name} onChange={onChange} readOnly={readOnly} value={value} />
    {label}
  </label>
)

export default Radio
