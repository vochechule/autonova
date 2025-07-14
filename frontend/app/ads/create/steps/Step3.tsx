export default function Step3({ data, onNext, onBack }: any) {
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
      <h2 className="text-xl font-bold text-center">Další informace</h2>
      <select name="fuel" required defaultValue={data.fuel || ''}>
        <option value="">Palivo</option>
        <option value="petrol">Benzín</option>
        <option value="diesel">Nafta</option>
        <option value="hybrid">Hybrid</option>
        <option value="electric">Elektro</option>
        <option value="lpg">LPG</option>
        <option value="cng">CNG</option>
      </select>
      <input name="year" type="number" placeholder="Rok výroby" defaultValue={data.year || ''} />
      <input name="firstRegistration" type="number" placeholder="První registrace (rok)" defaultValue={data.firstRegistration || ''} />
      <textarea name="features" placeholder="Výbava (čárkami oddělená)" defaultValue={data.features || ''} />
      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="text-gray-600">Zpět</button>
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">Další</button>
      </div>
    </form>
  )
}