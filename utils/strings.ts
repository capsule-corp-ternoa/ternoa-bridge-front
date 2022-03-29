export const formatPrice = (
  n: number,
  options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
  }
) => {
  const formatter = new Intl.NumberFormat('en-US', options)

  return formatter.format(n)
}

export function middleEllipsis(s: string, n = 10): string {
  if (s.length < n) return s
  const start = s.slice(0, n / 2)
  const end = s.slice(-(n / 2))
  return start + '...' + end
}

export const clipboardCopy = (str: string) => {
  try {
    navigator.clipboard.writeText(str)
  } catch (err) {
    console.log(err)
  }
}
