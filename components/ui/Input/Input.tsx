import React from 'react'

import styles from './Input.module.scss'

interface Props {
  advise?: string
  className?: string
  disabled?: boolean
  endComponent?: React.ReactNode
  error?: string
  insight?: string
  isError?: boolean
  label?: string | React.ReactNode
  max?: string | number
  min?: string | number
  name?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  startIcon?: string
  type?: React.HTMLInputTypeAttribute
  value?: string | number | readonly string[]
}

const TextInput = ({
  advise,
  className,
  disabled,
  endComponent,
  error,
  insight,
  isError,
  label,
  max,
  min,
  name,
  onChange,
  placeholder,
  type = 'text',
  value,
}: Props) => {
  const numberInputOnWheelPreventChange = (e: any) => {
    // Prevent the input value change
    e.target.blur()

    // Prevent the page/container scrolling
    e.stopPropagation()

    // Refocus immediately, on the next tick (after the current function is done)
    setTimeout(() => {
      e.target.focus()
    }, 0)
  }

  return (
    <div className={[`${styles.root}`, className].join(' ')}>
      {label && (
        <div className={styles.top}>
          <span className={styles.label}>{label}</span>
          <span className={styles.insight}>{insight}</span>
        </div>
      )}
      <label className={[`${styles.inputLabel}`, ''].join(' ')}>
        <input
          className={[`${styles.input}`, `${isError ? styles.error : ''}`, `${endComponent !== undefined ? styles.isEndComponent : ''}`].join(' ')}
          type={type}
          disabled={disabled}
          inputMode={type === 'number' ? 'numeric' : undefined}
          pattern={type === 'number' ? '[0-9]+([.,][0-9]+)?' : undefined}
          placeholder={placeholder}
          onChange={onChange}
          onWheel={numberInputOnWheelPreventChange}
          max={max}
          min={min}
          name={name}
          value={value}
          onKeyDown={(evt) => {
            evt.key
            const forbidden = type === 'number' ? ['e', '-', ','] : []
            if (forbidden.includes(evt.key)) {
              evt.preventDefault()
            }
          }}
        />
        <div className={styles.endComponent}>{endComponent}</div>
      </label>
      {error ? <div className={styles.errorMessage}>{error}</div> : <div className={styles.adviseMessage}>{advise}</div>}
    </div>
  )
}

export default TextInput
