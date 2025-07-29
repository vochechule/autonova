'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import '../../../styles/EditAdForm.scss'

export default function EditAdPage() {
  const router = useRouter()
  const params = useParams()
  const adId = params?.id as string
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Local state for image management
  const [localImages, setLocalImages] = useState<any[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  // Initialize local images when ad is loaded
  useEffect(() => {
    if (ad?.images) {
      setLocalImages(ad.images)
    }
  }, [ad])

  // Helper functions for image management
  const handleImageAdd = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    setNewImages(prev => [...prev, ...validFiles])
    
    const totalImages = localImages.length - imagesToDelete.length + newImages.length + validFiles.length
    if (totalImages < 2) {
      setImageError('Inzerát musí mít alespoň 2 obrázky.')
    } else {
      setImageError(null)
    }
  }

  const handleImageRemove = (imageId: string, isNew: boolean = false) => {
    if (isNew) {
      // Remove from new images
      const index = parseInt(imageId)
      setNewImages(prev => prev.filter((_, i) => i !== index))
    } else {
      // Mark existing image for deletion
      setImagesToDelete(prev => [...prev, imageId])
    }
    
    const totalImages = localImages.length - (imagesToDelete.length + (isNew ? 0 : 1)) + newImages.length
    if (totalImages < 2) {
      setImageError('Inzerát musí mít alespoň 2 obrázky.')
    } else {
      setImageError(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      handleImageAdd(files)
    }
  }

  const getVisibleImages = () => {
    return localImages.filter(img => !imagesToDelete.includes(img.id))
  }

  const getTotalImageCount = () => {
    return getVisibleImages().length + newImages.length
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!adId || !token) return
    fetch(`http://localhost:3000/ad/${adId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject('Inzerát nenalezen'))
      .then(setAd)
      .catch(e => setError(e.toString()))
      .finally(() => setLoading(false))
  }, [adId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Check if we have enough images
    const totalImages = getTotalImageCount()
    if (totalImages < 2) {
      setImageError('Inzerát musí mít alespoň 2 obrázky.')
      setLoading(false)
      return
    }

    const form = e.currentTarget
    const getValue = (name: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null => 
      form.querySelector(`[name="${name}"]`)

    const data = {
      title: getValue('title')?.value,
      price: Number(getValue('price')?.value),
      description: getValue('description')?.value,
      brand: getValue('brand')?.value,
      model: getValue('model')?.value,
      year: Number(getValue('year')?.value),
      color: getValue('color')?.value,
      fuel: getValue('fuel')?.value,
      bodyType: getValue('bodyType')?.value,
      power: Number(getValue('power')?.value),
      mileage: Number(getValue('mileage')?.value),
      transmission: getValue('transmission')?.value,
      drivetrain: getValue('drivetrain')?.value,
      doorCount: Number(getValue('doorCount')?.value),
      seatCount: Number(getValue('seatCount')?.value),
    }

    const token = localStorage.getItem('token')
    
    try {
      // Update ad data
      const res = await fetch(`http://localhost:3000/ad/${adId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        throw new Error('Uložení základních údajů se nezdařilo')
      }

      // Delete marked images
      for (const imageId of imagesToDelete) {
        await fetch(`http://localhost:3000/ad/${adId}/photos/${imageId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      // Upload new images
      if (newImages.length > 0) {
        const formData = new FormData()
        newImages.forEach(img => {
          formData.append('photos', img)
        })
        
        await fetch(`http://localhost:3000/ad/${adId}/photos`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      }

      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1200)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('Neznámá chyba při ukládání')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Načítám...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!ad) return <div>Inzerát nenalezen</div>

  return (
    <main className="edit-ad-page">
      <h2>Editace inzerátu</h2>
      <form onSubmit={handleSubmit} className="edit-ad-form">
        <label>
          Název
          <input name="title" defaultValue={ad.title} required />
        </label>
        <label>
          Cena
          <input name="price" type="number" defaultValue={ad.price} required />
        </label>
        <label>
          Popis
          <textarea name="description" defaultValue={ad.description} required />
        </label>
        <label>
          Značka
          <input name="brand" defaultValue={ad.brand} required />
        </label>
        <label>
          Model
          <input name="model" defaultValue={ad.model} required />
        </label>
        <label>
          Rok výroby
          <input name="year" type="number" defaultValue={ad.year} required />
        </label>
        <label>
          Barva
          <input name="color" defaultValue={ad.color} />
        </label>
        <label>
          Palivo
          <input name="fuel" defaultValue={ad.fuel} />
        </label>
        <label>
          Karoserie
          <input name="bodyType" defaultValue={ad.bodyType} />
        </label>
        <label>
          Výkon (kW)
          <input name="power" type="number" defaultValue={ad.power} />
        </label>
        <label>
          Stav tachometru (km)
          <input name="mileage" type="number" defaultValue={ad.mileage} />
        </label>
        <label>
          Převodovka
          <input name="transmission" defaultValue={ad.transmission} />
        </label>
        <label>
          Pohon
          <input name="drivetrain" defaultValue={ad.drivetrain} />
        </label>
        <label>
          Počet dveří
          <input name="doorCount" type="number" defaultValue={ad.doorCount} />
        </label>
        <label>
          Počet míst
          <input name="seatCount" type="number" defaultValue={ad.seatCount} />
        </label>

        {/* Image Management Section */}
        <div className="image-upload-section">
          <h3>Správa obrázků</h3>
          <p className="image-requirement">Inzerát musí mít alespoň 2 obrázky</p>
          
          {/* Current Images Gallery */}
          {getVisibleImages().length > 0 && (
            <div className="image-gallery">
              {getVisibleImages().map((img: any) => (
                <div key={img.id} className="image-preview">
                  <img src={img.url} alt={`Obrázek inzerátu`} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleImageRemove(img.id, false)}
                    title="Označit k odstranění"
                  >
                    ×
                  </button>
                  <div className="image-info">
                    <span className="image-name">Původní obrázek</span>
                  </div>
                  {imagesToDelete.includes(img.id) && (
                    <div className="image-overlay">
                      <span>Označeno k odstranění</span>
                      <button
                        type="button"
                        className="restore-btn"
                        onClick={() => setImagesToDelete(prev => prev.filter(id => id !== img.id))}
                      >
                        Obnovit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New Images Gallery */}
          {newImages.length > 0 && (
            <div className="image-gallery">
              <h4>Nové obrázky (budou přidány po uložení)</h4>
              {newImages.map((img: File, index: number) => (
                <div key={index} className="image-preview new-image">
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt={`Nový obrázek ${index + 1}`}
                    onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleImageRemove(index.toString(), true)}
                    title="Odstranit nový obrázek"
                  >
                    ×
                  </button>
                  <div className="image-info">
                    <span className="image-name">{img.name}</span>
                    <span className="image-size">{(img.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drop Zone */}
          <div 
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="drop-text">
                Přetáhněte obrázky sem nebo 
                <label htmlFor="new-images" className="file-input-label"> vyberte soubory</label>
              </p>
              <p className="drop-subtext">Podporované formáty: JPG, PNG, WEBP</p>
            </div>
            
            <input
              type="file"
              id="new-images"
              accept="image/*"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files || [])
                handleImageAdd(files)
              }}
              style={{ display: 'none' }}
            />
          </div>

          {/* Image Counter */}
          <div className="image-counter">
            <span className={`counter ${getTotalImageCount() >= 2 ? 'valid' : 'invalid'}`}>
              {getTotalImageCount()} / min. 2 obrázků
            </span>
            {imagesToDelete.length > 0 && (
              <span className="deletion-info">
                ({imagesToDelete.length} bude odstraněno po uložení)
              </span>
            )}
            {newImages.length > 0 && (
              <span className="addition-info">
                ({newImages.length} bude přidáno po uložení)
              </span>
            )}
          </div>

          {imageError && <div className="error">{imageError}</div>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Ukládám...' : 'Uložit změny'}
        </button>
        {success && <div className="success">Uloženo! Přesměrování…</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </main>
  )
}