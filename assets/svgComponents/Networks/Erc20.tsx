import React from 'react'

interface Erc20Props {
  className?: string
}

const Erc20: React.FC<Erc20Props> = ({ className }) => (
  <svg className={className} width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path
        d="M5.93261 0.757812L5.80908 1.17816V13.3757L5.93261 13.4992L11.5879 10.1524L5.93261 0.757812Z"
        fill="white"
      />
      <path d="M5.93262 0.757812L0.277344 10.1524L5.93262 13.4992V7.57889V0.757812Z" fill="white" />
      <path
        d="M5.93289 15.3417L5.86328 15.4266V19.7717L5.93289 19.9752L11.5916 11.9966L5.93289 15.3417Z"
        fill="white"
      />
      <path d="M5.9331 19.9753V15.3417L0.277832 11.9966L5.9331 19.9753Z" fill="white" />
      <path d="M5.93311 13.4985L11.5883 10.1522L5.93311 7.5791V13.4985Z" fill="white" />
      <path d="M0.277832 10.1522L5.93301 13.4985V7.5791L0.277832 10.1522Z" fill="white" />
    </g>
  </svg>
)

export default Erc20
