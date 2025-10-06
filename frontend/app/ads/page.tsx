import AdsPageServer from './AdsPageServer'

// Export metadata a komponenta z AdsPageServer
export { generateMetadata } from './AdsPageServer'

interface AdsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function AdsPage({ searchParams }: AdsPageProps) {
  return <AdsPageServer searchParams={searchParams} />
}