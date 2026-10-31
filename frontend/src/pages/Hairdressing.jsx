import CategoryPage from '../components/CategoryPage'
import HairScanner from '../components/HairScanner'

export default function Hairdressing() {
  return (
    <CategoryPage
      category='hair'
      title='Hairdressing'
      intro='Live camera face shape detection, real-time AI hair color preview, and haircut recommendations tailored to balance your facial structure.'
      scanner={<HairScanner />}
    />
  )
}
