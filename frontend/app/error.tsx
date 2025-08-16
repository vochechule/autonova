'use client'
import { ServerErrorPage } from './components/ErrorPages'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ServerErrorPage />
}