export default function StepImages({ data, onNext, onBack }: any) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const files = (e.currentTarget.elements.namedItem('images') as HTMLInputElement).files
    const imagesArray = files ? Array.from(files) : []
    onNext({ images: imagesArray })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center">Fotky vozidla</h2>
      <input name="images" type="file" multiple accept="image/*" />
      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="text-gray-600">Zpět</button>
        <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded">Další</button>
      </div>
    </form>
  )
}