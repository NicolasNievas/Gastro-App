import StockTab from '../AdminPage/tabs/StockTab'

export default function StockPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <h1 className="m-0 text-3xl font-bold">Stock</h1>
      </header>
      <StockTab />
    </div>
  )
}