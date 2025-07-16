import AdCreateForm from '../../components/AdCreateForm'

export default function CreateAdPage() {
  return (
    <main className="create-ad-page">
      <h1 className="create-ad-page__heading">Vytvořit inzerát</h1>
      <AdCreateForm />
    </main>
  )
}