import CategoryPage from '../components/CategoryPage'
import MakeupScanner from '../components/MakeupScanner'

export default function Makeup() {
  return (
    <CategoryPage
      category='makeup'
      title='Makeup'
      intro='Live camera skin tone detection, personalized shade matching, and real-time virtual try-on for lipstick and blush directly on your camera.'
      scanner={<MakeupScanner />}
    />
  )
}
