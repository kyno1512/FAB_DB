import { paths } from '../routes/paths'

export const clientNavItems = [
  { id: 'home', label: 'Trang chủ', to: paths.CLIENT_HOME, matchHome: true },
  { id: 'products', label: 'Sản phẩm', to: paths.PRODUCTS, matchPath: paths.PRODUCTS },
  { id: 'news', label: 'Tin tức', to: paths.NEWS, matchPath: paths.NEWS },
  { id: 'address', label: 'Địa chỉ', to: paths.ADDRESS, matchPath: paths.ADDRESS },
]
