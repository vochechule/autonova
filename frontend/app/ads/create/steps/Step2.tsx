export default function Step2({ data, onNext, onBack }: any) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const stepData: any = {}
    formData.forEach((value, key) => {
      stepData[key] = value
    })
    onNext(stepData)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center">Detaily auta</h2>
      <select name="bodyType" required defaultValue={data.bodyType || ''}>
        <option value="">Karoserie</option>
        <option value="hatchback">Hatchback</option>
        <option value="sedan">Sedan</option>
        <option value="kombi">Kombi</option>
        <option value="suv">SUV</option>
        <option value="coupe">Coupé</option>
        <option value="cabrio">Cabrio</option>
        <option value="mpv">MPV</option>
        <option value="pickup">Pickup</option>
        <option value="van">Van</option>
        <option value="jiné">Jiné</option>
      </select>
      <input name="doorCount" type="number" required placeholder="Počet dveří" defaultValue={data.doorCount || ''} />
      <input name="seatCount" type="number" required placeholder="Počet míst" defaultValue={data.seatCount || ''} />
      <input name="color" required placeholder="Barva" defaultValue={data.color || ''} />
      <input name="engineVolume" type="number" required placeholder="Objem motoru (ccm)" defaultValue={data.engineVolume || ''} />
      <input name="power" type="number" required placeholder="Výkon (kW)" defaultValue={data.power || ''} />
      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="text-gray-600">Zpět</button>
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">Další</button>
      </div>
    </form>
  )
}