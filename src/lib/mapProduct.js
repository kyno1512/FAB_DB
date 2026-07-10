import { getProductImageUrl } from './productImage'

export function mapListProduct(p) {
  return {
    id: p.maSanPham,
    maDanhMuc: p.maDanhMuc,
    categoryName: p.tenDanhMuc || '',
    name: p.tenSanPham,
    desc: p.moTa || '',
    price: p.giaBan,
    originalPrice: p.giaGoc,
    image: getProductImageUrl({
      hinhAnhChinh: p.hinhAnhChinh,
      tenSanPham: p.tenSanPham,
      tenDanhMuc: p.tenDanhMuc,
    }),
    conHang: (p.conHang ?? p.ConHang) ?? true,
    coTheBan: (p.coTheBan ?? p.CoTheBan) ?? 999,
  }
}

function isDrinkProduct(product) {
  const text = `${product.categoryName} ${product.name}`.toLowerCase()
  return /cà phê|ca phe|coffee|trà|tra|đồ uống|nuoc|nước|latte|espresso|capuchino|cappuccino/.test(text)
}

function isBakeryProduct(product) {
  const text = `${product.categoryName} ${product.name}`.toLowerCase()
  return /bánh|banh|cake|croissant|mì|banh mi|tiramisu|brownie|bánh ngọt|pastry/.test(text)
}

export function buildSuggestedCombo(products) {
  if (!products.length) return null

  let bakery = products.find(isBakeryProduct)
  let drink = products.find(isDrinkProduct)

  if (!bakery || !drink || bakery.id === drink.id) {
    const byCategory = new Map()
    products.forEach((p) => {
      if (!byCategory.has(p.maDanhMuc)) byCategory.set(p.maDanhMuc, p)
    })
    const unique = [...byCategory.values()]
    if (unique.length >= 2) {
      bakery = unique[0]
      drink = unique[1]
    } else if (products.length >= 2) {
      bakery = products[0]
      drink = products[1]
    } else {
      return { title: products[0].name, items: [products[0]], total: products[0].price }
    }
  }

  const items = bakery.id === drink.id ? [bakery] : [bakery, drink]
  const bakeryLabel = bakery.name.split(' ').slice(0, 3).join(' ')
  const drinkLabel = drink.name.split(' ').slice(0, 3).join(' ')

  return {
    title: items.length > 1 ? `Combo ${bakeryLabel} & ${drinkLabel}` : bakery.name,
    items,
    total: items.reduce((sum, item) => sum + item.price, 0),
  }
}
