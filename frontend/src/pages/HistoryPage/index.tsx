import HistoryTab from '../AdminPage/tabs/HistoryTab'

export default function HistoryPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <h1 className="m-0 text-3xl font-bold">Historial</h1>
      </header>
      <HistoryTab />
    </div>
  )
}