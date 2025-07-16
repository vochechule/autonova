'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import '../../styles/AdDetailPage.scss'

export default function AdDetailPage() {
  const { id } = useParams()
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:3000/ad/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Ad data:', data); // Zkontroluj, zda data obsahují images
        setAd(data);
        setLoading(false);
      });
  }, [id])

  if (loading) return <main className="ad-detail-page">Načítám...</main>
  if (!ad) return <main className="ad-detail-page">Inzerát nebyl nalezen.</main>

  return (
    <main className="ad-detail-page">
      <header className="ad-detail-page__header">
        <button className="ad-detail-page__back" onClick={() => window.history.back()}>&larr;</button>
        <h1 className="ad-detail-page__title">Car Details</h1>
      </header>
      <div className="ad-detail-page__image-wrap">
        {ad.images && ad.images.length > 0 ? (
          <div className="ad-detail-page__image-carousel">
            {/* Implementuj carousel nebo zobraz první obrázek */}
            <img 
              src={ad.images[0].url} 
              alt={ad.title} 
              className="ad-detail-page__image" 
            />
          </div>
        ) : (
          <div className="ad-detail-page__no-image">
            <p>Žádné obrázky</p>
          </div>
        )}
      </div>
      <section className="ad-detail-page__maininfo">
        <h2 className="ad-detail-page__carname">{ad.title}</h2>
        <div className="ad-detail-page__summary">
          {ad.year} &nbsp;|&nbsp; {ad.mileage?.toLocaleString()} km &nbsp;|&nbsp; {ad.fuel}
        </div>
      </section>
      <section className="ad-detail-page__specs">
        <h3>Specifications</h3>
        <div className="ad-detail-page__specgrid">
          <div>
            <span className="ad-detail-page__spec-label">Make</span>
            <span className="ad-detail-page__spec-value">{ad.brand ?? '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Model</span>
            <span className="ad-detail-page__spec-value">{ad.model ?? '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Year</span>
            <span className="ad-detail-page__spec-value">{ad.year ?? '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Mileage</span>
            <span className="ad-detail-page__spec-value">{ad.mileage?.toLocaleString()} km</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">First Registration</span>
            <span className="ad-detail-page__spec-value">{ad.firstRegistration ?? '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Body Type</span>
            <span className="ad-detail-page__spec-value">{ad.bodyType}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Doors</span>
            <span className="ad-detail-page__spec-value">{ad.doorCount}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Seats</span>
            <span className="ad-detail-page__spec-value">{ad.seatCount}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Color</span>
            <span className="ad-detail-page__spec-value">{ad.color}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Color Finish</span>
            <span className="ad-detail-page__spec-value">{ad.colorFinish ?? '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Airbags</span>
            <span className="ad-detail-page__spec-value">{ad.airbagCount}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Air Conditioning</span>
            <span className="ad-detail-page__spec-value">{ad.airConditioning}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Fuel</span>
            <span className="ad-detail-page__spec-value">{ad.fuel}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Engine Volume</span>
            <span className="ad-detail-page__spec-value">{ad.engineVolume ? (ad.engineVolume / 1000).toFixed(1) + 'L' : '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Power</span>
            <span className="ad-detail-page__spec-value">{ad.power} kW</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Avg. Consumption</span>
            <span className="ad-detail-page__spec-value">{ad.avgConsumption ?? '-'} l/100km</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Transmission</span>
            <span className="ad-detail-page__spec-value">{ad.transmission}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Gears</span>
            <span className="ad-detail-page__spec-value">{ad.gearCount ?? '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Drivetrain</span>
            <span className="ad-detail-page__spec-value">{ad.drivetrain}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Condition</span>
            <span className="ad-detail-page__spec-value">{ad.condition}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">STK Until</span>
            <span className="ad-detail-page__spec-value">{ad.technicalCheckUntil ? new Date(ad.technicalCheckUntil).toLocaleDateString() : '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Country of Origin</span>
            <span className="ad-detail-page__spec-value">{ad.countryOfOrigin}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Euro Standard</span>
            <span className="ad-detail-page__spec-value">{ad.euroStandard}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Eco Tax Paid</span>
            <span className="ad-detail-page__spec-value">{ad.ecoTaxPaid ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">First Owner</span>
            <span className="ad-detail-page__spec-value">{ad.isFirstOwner ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Disabled Adapted</span>
            <span className="ad-detail-page__spec-value">{ad.isDisabledAdapted ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Was Crashed</span>
            <span className="ad-detail-page__spec-value">{ad.wasCrashed ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Service Book</span>
            <span className="ad-detail-page__spec-value">{ad.hasServiceBook ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Warranty Until</span>
            <span className="ad-detail-page__spec-value">{ad.warrantyUntil ? new Date(ad.warrantyUntil).toLocaleDateString() : '-'}</span>
          </div>
          <div>
            <span className="ad-detail-page__spec-label">Window Note</span>
            <span className="ad-detail-page__spec-value">{ad.windowNote ?? '-'}</span>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <span className="ad-detail-page__spec-label">Features</span>
            <span className="ad-detail-page__spec-value">
              {Array.isArray(ad.features) && ad.features.length > 0
                ? ad.features.join(', ')
                : '-'}
            </span>
          </div>
        </div>
      </section>
      <section className="ad-detail-page__seller">
        <h3>Seller Information</h3>
        <div className="ad-detail-page__seller-info">
          <div className="ad-detail-page__seller-avatar"></div>
          <div>
            <div className="ad-detail-page__seller-name">{ad.user?.name ?? 'Neznámý uživatel'}</div>
            <div className="ad-detail-page__seller-location">{ad.user?.location ?? ''}</div>
          </div>
        </div>
        <button className="ad-detail-page__contact-btn">Contact Seller</button>
      </section>
    </main>
  )
}