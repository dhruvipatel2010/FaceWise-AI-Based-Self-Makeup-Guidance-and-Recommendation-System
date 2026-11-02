import { useState } from 'react'
import CategoryPage from '../components/CategoryPage'
import SkincareScanner from '../components/SkincareScanner'

export default function Skincare() {
  const [detected, setDetected] = useState(null)

  return (
    <CategoryPage
      category='skincare'
      title='Skincare'
      intro='Live camera skin diagnostic scanner for skin tone, hydration balance, pore texture, and custom morning/night routine guidance.'
      scanner={<SkincareScanner onSkinAnalyzed={setDetected} />}
      detectedInfo={detected}
    />
  )
}
