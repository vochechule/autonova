export default function StepSubmit({ data, onBack }: any) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:3000/ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Chyba při ukládání inzerátu')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center">Shrnutí</h2>
      <p>Souhrn údajů připraven k odeslání.</p>
      <pre className="bg-gray-100 p-2 rounded text-sm max-h-64 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      <div className="flex justify-between gap-4">
        <button type="button" onClick={onBack} className="text-gray-600">Zpět</button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white py-2 px-4 rounded"
          disabled={loading || success}
        >
          {loading ? 'Ukládám...' : success ? 'Hotovo!' : 'Odeslat'}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      {success && <p className="text-green-600 text-sm text-center">Inzerát byl úspěšně přidán!</p>}
    </div>
  )
}