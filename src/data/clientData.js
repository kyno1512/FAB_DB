export const featuredProducts = [
  {
    id: 1,
    name: 'Bánh Tiramisu Đặc Sắc',
    desc: 'Hương vị Ý truyền thống, mềm mịn và thơm béo.',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Bánh Sừng Bò Hạnh Nhân',
    desc: 'Giòn tan bên ngoài, béo ngậy hạnh nhân bên trong.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Cà Phê Cappuccino',
    desc: 'Espresso đậm đà, bọt sữa mịn màng.',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1534778102505-7fc5b646dcef?w=600&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Bánh Brownie Sô-cô-la',
    desc: 'Sô-cô-la đen 70%, ngọt vừa phải.',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=600&auto=format&fit=crop',
  },
]

export const blogPosts = [
  {
    id: 1,
    title: 'Bí quyết làm bánh Tiramisu chuẩn Ý',
    category: 'Bánh ngọt',
    date: '2026-05-10',
    excerpt:
      'Tiramisu Flygo dùng mascarpone nhập khẩu và cà phê espresso rang mới — mềm mịn, vị cân bằng không quá ngọt.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Hạt cà phê Arabica và Robusta',
    category: 'Pha chế',
    date: '2026-04-22',
    excerpt:
      'Arabica cho hương thơm hoa quả, Robusta tăng body — Flygo pha blend 7:3 để ly cà phê vừa đậm vừa dễ uống.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Nhào bột – Chìa khóa của bánh giòn',
    category: 'Kỹ thuật làm bánh',
    date: '2026-03-15',
    excerpt:
      'Nhào đủ thời gian giúp gluten phát triển đều — bí quyết để bánh mì và croissant Flygo giòn tan từng lớp.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
  },
]

export const instagramPosts = [
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534778102505-7fc5b646dcef?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=400&auto=format&fit=crop',
]

export const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ'
