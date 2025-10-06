import AdDetailServer from './AdDetailServer'

// Export metadata generation from server component
export { generateMetadata } from './AdDetailServer'

interface AdDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdDetailPage({ params }: AdDetailPageProps) {
  return <AdDetailServer params={params} />
}