import CategoryPage from '../components/CategoryPage'
import SkincareScanner from '../components/SkincareScanner'

export default function Skincare() {
  return (
    <CategoryPage
      category='skincare'
      title='Skincare'
      intro='Live camera skin diagnostic scanner for skin tone, hydration balance, pore texture, and custom morning/night routine guidance.'
      scanner={<SkincareScanner />}
    />
  )
}
