import { useState, useEffect, useCallback, useMemo } from 'react'
import { getProducts, updateProduct, deactivateProduct } from '../../../api/products'
import { getCategories } from '../../../api/categories'
import { formatMoney } from '../../../utils/format'
import ProductFormModal from '../../../components/ProductFormModal'
import type { ProductDto, CategoryDto } from '../../../types'

export default function ProductsTab() {
  const [products,   setProducts]   = useState<ProductDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading,     setLoading]   = useState(true)
  const [error,       setError]     = useState('')

  const [search, setSearch]             = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('')

  const [modalOpen, setModalOpen]   = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null)
  const [busyId, setBusyId]         = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([getProducts(), getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data)
        setCategories(catRes.data)
      })
      .catch(() => setError('No se pudo cargar el catálogo'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || p.category.id === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  const openCreate = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (product: ProductDto) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleToggleActive = async (product: ProductDto) => {
    setBusyId(product.id)
    setError('')
    try {
      if (product.active) {
        await deactivateProduct(product.id)
      } else {
        await updateProduct(product.id, {
          name: product.name,
          price: product.price,
          categoryId: product.category.id,
          sector: product.sector,
          stock: product.stock,
          lowStock: product.lowStock,
          noStock: product.noStock,
          active: true,
        })
      }
      load()
    } catch {
      setError('No se pudo actualizar el estado del producto')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <input
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
            className="max-w-xs"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button onClick={openCreate}>+ Nuevo producto</button>
      </div>

      {error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-muted">Cargando productos...</p>
      ) : filtered.length === 0 ? (
        <div className="empty">No se encontraron productos.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-muted text-left">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.category.name}</td>
                  <td className="px-4 py-3">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3 text-muted">{p.sector === 'COCINA' ? 'Cocina' : p.sector === 'BARRA' ? 'Barra' : 'Ambos'}</td>
                  <td className="px-4 py-3">
                    {p.noStock || p.stock === 0
                      ? <span className="text-danger">Sin stock</span>
                      : p.stock <= p.lowStock
                        ? <span className="text-warn">{p.stock} (bajo)</span>
                        : p.stock}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`pill ${p.active ? 'bg-ok/20 text-ok' : 'bg-muted/20 text-muted'}`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button className="btn-ghost px-3 py-2 min-h-0 text-xs" onClick={() => openEdit(p)}>
                        Editar
                      </button>
                      <button
                        className="btn-ghost px-3 py-2 min-h-0 text-xs"
                        disabled={busyId === p.id}
                        onClick={() => handleToggleActive(p)}
                      >
                        {p.active ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          mode={editingProduct ? 'edit' : 'create'}
          product={editingProduct}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSuccess={load}
        />
      )}
    </div>
  )
}