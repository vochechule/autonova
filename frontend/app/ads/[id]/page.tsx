import AdDetailServer from './AdDetailServer'

// Export metadata generation from server component
export { generateMetadata } from './AdDetailServer'

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdDetailServer params={params} />
}