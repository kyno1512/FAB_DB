export function getDiscountPercent(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) return null
  return Math.round((1 - salePrice / originalPrice) * 100)
}

export function hasProductDiscount(originalPrice, salePrice) {
  return getDiscountPercent(originalPrice, salePrice) != null
}
