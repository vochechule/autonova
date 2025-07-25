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
    setError(null)
    setSuccess(false)
    const form = e.currentTarget
    const data = {
      title: form.title.value,
      price: Number(form.price.value),
      description: form.description.value,
      brand: form.brand.value,
      model: form.model.value,
      year: Number(form.year.value),
      color: form.color.value,
      fuel: form.fuel.value,
      bodyType: form.bodyType.value,
      power: Number(form.power.value),
      mileage: Number(form.mileage.value),
      transmission: form.transmission.value,
      drivetrain: form.drivetrain.value,
      doorCount: Number(form.doorCount.value),
      seatCount: Number(form.seatCount.value),
      // další pole dle potřeby
    }
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:3000/ad/${adId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/profile'), 1200)
    } else {
      setError('Uložení se nezdařilo')
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
        <button type="submit">Uložit změny</button>
        {success && <div style={{ color: 'green' }}>Uloženo! Přesměrování…</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>

      {/* Sekce obrázků */}
      {ad.images && ad.images.length > 0 && (
        <div className="edit-ad-form__images">
          {ad.images.map((img: any) => (
            <div key={img.id} className="edit-ad-form__image-item">
              <img src={img.url} alt="ad" />
              <button
                type="button"
                disabled={ad.images.length <= 2}
                title={ad.images.length <= 2 ? "Musí zůstat alespoň 2 obrázky" : ""}
                className={ad.images.length <= 2 ? "edit-ad-form__image-btn--disabled" : ""}
                onClick={async () => {
                  if (ad.images.length <= 2) return;
                  const token = localStorage.getItem('token');
                  const res = await fetch(`http://localhost:3000/ad/${adId}/photos/${img.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    setAd((prev: any) => ({
                      ...prev,
                      images: prev.images.filter((i: any) => i.id !== img.id)
                    }));
                  }
                }}
              >
                Smazat
              </button>
              {ad.images.length <= 2 && (
                <div className="edit-ad-form__image-warning">
                  Inzerát musí mít alespoň dva obrázky
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input pro přidání obrázků - vždy viditelný */}
      <label className="edit-ad-form__upload-label">
        <span>Přidat nové obrázky</span>
        <span style={{ fontSize: '0.97rem', color: '#6b7280', marginTop: 4 }}>
          Vyberte nebo přetáhněte obrázky (max. 10)
        </span>
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          onChange={async (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
              formData.append('photos', files[i]);
            }
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/ad/${adId}/photos`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            if (res.ok) {
              const data = await res.json();
              const newImages = data.photos ?? [];
              setAd((prev: any) => ({
                ...prev,
                images: [...prev.images, ...newImages]
              }));
            }
          }}
        />
        <span>
          <button
            type="button"
            className="edit-ad-form__upload-btn"
            onClick={() => document.querySelector<HTMLInputElement>('.edit-ad-form__upload-label input[type="file"]')?.click()}
          >
            Vybrat obrázky
          </button>
        </span>
      </label>
    </main>
  )
}