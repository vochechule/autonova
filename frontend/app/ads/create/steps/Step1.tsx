export default function Step1({ data, onNext }: any) {
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
      <h2 className="text-xl font-bold text-center">Základní informace</h2>
      <input name="title" required placeholder="Název" defaultValue={data.title || ''} />
      <textarea name="description" required placeholder="Popis" defaultValue={data.description || ''} />
      <input name="price" type="number" required placeholder="Cena" defaultValue={data.price || ''} />
      <input name="mileage" type="number" required placeholder="Nájezd (km)" defaultValue={data.mileage || ''} />
      <button type="submit" className="bg-green-600 text-white py-2 rounded">Další</button>
    </form>
  )
}