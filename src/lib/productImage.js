import { PLACEHOLDER_PRODUCT_IMAGE } from '../constants/products'
import { resolveMediaUrl } from './mediaUrl'

const IMG = (id) =>
  `https://images.unsplash.com/${id}?w=400&auto=format&fit=crop&q=80`

/** Ảnh đã kiểm tra HTTP 200 — mỗi sản phẩm một URL riêng */
export const PRODUCT_IMAGES = {
  Tiramisu: IMG('photo-1571877227200-a0d98ea607e9'),
  Croissant: IMG('photo-1555507036-ab1f4038808a'),
  Cheesecake: IMG('photo-1524351199678-941a58a3df50'),
  'Brownie Chocolate': '/images/products/brownie-chocolate.svg',
  'Macaron Pháp': '/images/products/macaron-phap.svg',
  'Bánh mì Sourdough': IMG('photo-1509440159596-0249088772ff'),
  'Red Velvet': IMG('photo-1587668178277-295251f900ce'),
  'Muffin Việt Quất': IMG('photo-1551024506-0bccd828d307'),
  'Panna Cotta Dâu': IMG('photo-1488477181946-6428a0291777'),
  'Cà Phê Latte': IMG('photo-1461023058943-07fcbe16d735'),
  Cappuccino: IMG('photo-1534778101976-62847782c213'),
  Espresso: IMG('photo-1514432324607-a09d9b4aefdd'),
  Americano: IMG('photo-1442512595331-e89e73853f31'),
  Mocha: IMG('photo-1572442388796-11668a67e53d'),
  'Cold Brew': IMG('photo-1517487881594-2787fef5ebf7'),
  'Caramel Macchiato': IMG('photo-1572490122747-3968b75cc699'),
  'Bạc Xỉu': IMG('photo-1509042239860-f550ce710b93'),
  'Trà đào cam sả': '/images/products/tra-dao-cam-sa.svg',
  'Trà sữa trân châu': '/images/products/tra-sua-tran-chau.svg',
  'Matcha Latte': '/images/products/matcha-latte.svg',
  'Trà chanh mật ong': '/images/products/tra-chanh-mat-ong.svg',
  'Combo Sáng Flygo': '/images/products/combos/combo-sang-flygo.svg',
  'Combo Trà Chiều': '/images/products/combos/combo-tra-chieu.svg',
  'Combo Cà Phê & Bánh': '/images/products/combos/combo-ca-phe-banh.svg',
  'Combo Matcha Ngọt': '/images/products/combos/combo-matcha-ngot.svg',
  'Combo Bạc Xỉu Brownie': '/images/products/combos/combo-bac-xiu-brownie.svg',
  'Combo Brunch Flygo': '/images/products/combos/combo-brunch-flygo.svg',
  'Combo Trà Sữa & Bánh': '/images/products/combos/combo-tra-sua-banh.svg',
  'Combo Làm Việc': '/images/products/combos/combo-lam-viec.svg',
  'Combo Caramel Ngọt': '/images/products/combos/combo-caramel-ngot.svg',
  'Combo Chanh Mật Ong': '/images/products/combos/combo-chanh-mat-ong.svg',
}

const CATEGORY_IMAGES = {
  'Bánh ngọt': IMG('photo-1578985545062-69928b1d9587'),
  'Cà phê': IMG('photo-1544145945-f90425340c7e'),
  Trà: IMG('photo-1556679343-c7306c1976bc'),
  Combo: '/images/products/combos/combo-sang-flygo.svg',
}

export function getProductImageUrl({ hinhAnhChinh, tenSanPham, tenDanhMuc }) {
  const fromApi = resolveMediaUrl(hinhAnhChinh)
  if (fromApi) return fromApi

  if (tenSanPham && PRODUCT_IMAGES[tenSanPham]) return PRODUCT_IMAGES[tenSanPham]

  if (tenDanhMuc && CATEGORY_IMAGES[tenDanhMuc]) return CATEGORY_IMAGES[tenDanhMuc]

  return PLACEHOLDER_PRODUCT_IMAGE
}

export function getProductImageFallback(tenSanPham, tenDanhMuc) {
  if (tenSanPham && PRODUCT_IMAGES[tenSanPham]) return PRODUCT_IMAGES[tenSanPham]
  if (tenDanhMuc && CATEGORY_IMAGES[tenDanhMuc]) return CATEGORY_IMAGES[tenDanhMuc]
  return PLACEHOLDER_PRODUCT_IMAGE
}
