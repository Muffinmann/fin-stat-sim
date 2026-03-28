const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export const roundMoney = (value: number) => Math.round(value * 100) / 100
export const formatCurrency = (value: number) => currencyFormatter.format(Math.round(value))
export const formatPrice = (value: number) => priceFormatter.format(value)
export const formatPercent = (value: number) => `${percentFormatter.format(value)}%`
export const formatNumber = (value: number) => decimalFormatter.format(value)
export const formatInteger = (value: number) => integerFormatter.format(Math.round(value))
export const formatAccountingCurrency = (value: number) => {
  if (value < 0) {
    return `(${currencyFormatter.format(Math.abs(Math.round(value)))})`
  }
  return formatCurrency(value)
}

export const formatAccountingPrice = (value: number) => {
  if (value < 0) {
    return `(${priceFormatter.format(Math.abs(value))})`
  }
  return formatPrice(value)
}
