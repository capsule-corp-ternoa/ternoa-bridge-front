import React from 'react'
import Link from 'next/link'

import LinkArrow from 'assets/svgComponents/LinkArrow'

import Loader from '../Loader'

import styles from './Button.module.scss'

interface IButton {
  color?: 'danger' | 'dark' | 'primary100' | 'primary500' | 'success' | 'gradient500' | 'gradient700'
  isLoading?: boolean
  size?: 'small' | 'medium'
  variant?: 'rounded' | 'rectangle'
}

interface AnchorButtonProps extends IButton {
  className?: string
  href: string
  text?: string
  title?: string
}

interface ButtonProps extends IButton {
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  text?: string
}

export const AnchorButton = ({ className, color = 'primary500', href, size = 'medium', text, title, variant = 'rounded' }: AnchorButtonProps) => {
  if (href.charAt(0) === '/')
    return (
      <Link href={href}>
        <a
          className={[`${styles.root}`, `${styles.rootAnchor}`, `${styles[color]}`, `${styles[size]}`, `${styles[variant]}`, className].join(' ')}
          title={title}
        >
          {text}
          <LinkArrow />
        </a>
      </Link>
    )

  return (
    <a
      className={[`${styles.root}`, `${styles.rootAnchor}`, `${styles[color]}`, `${styles[size]}`, `${styles[variant]}`, className].join(' ')}
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
      <LinkArrow />
    </a>
  )
}

const Button = ({ className, color = 'primary500', disabled, icon, isLoading = false, onClick, size = 'medium', text, variant = 'rounded' }: ButtonProps) => (
  <button
    className={[`${styles.root}`, `${styles[color]}`, `${styles[size]}`, `${styles[variant]}`, `${isLoading ? styles.loading : ''}`, className].join(' ')}
    disabled={disabled}
    onClick={onClick}
  >
    {icon && <div className={styles.icon}>{icon}</div>}
    {isLoading ? <Loader className={styles.loader} size={size} /> : <>{text}</>}
  </button>
)

export default Button
