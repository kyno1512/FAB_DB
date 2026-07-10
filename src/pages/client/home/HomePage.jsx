import Hero from './components/Hero'
import SearchSection from './components/SearchSection'
import FeaturedProducts from './components/FeaturedProducts'
import AiCombo from './components/AiCombo'
import Testimonials from './components/Testimonials'
import BlogSection from './components/BlogSection'
import InstagramGallery from './components/InstagramGallery'

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchSection />
      <FeaturedProducts />

      <Testimonials />
      <BlogSection />
      <InstagramGallery />
    </>
  )
}
