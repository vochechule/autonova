'use client'
import { useParams } from 'next/navigation'
import EditAdForm from '../../../components/EditAdForm'

export default function EditAdPage() {
  const params = useParams()
  const adId = params.id as string

  return (
    <div className="container">
      <EditAdForm adId={adId} />
    </div>
  )
}