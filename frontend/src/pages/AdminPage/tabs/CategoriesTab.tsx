import { useState, useEffect, useCallback } from 'react'
import { getAllCategoriesIncludingInactive, deactivateCategory, activateCategory } from '../../../api/categories'
import CategoryFormModal from '../../../components/CategoryFormModal'
import type { CategoryDto } from '../../../types'

export default function CategoriesTab() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const [modalOpen, setModalOpen]   = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)
  const [busyId, setBusyId]         = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getAllCategoriesIncludingInactive()
      .then(r => setCategories(r.data))
      .catch(() => setError('No se pudieron cargar las categorías'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const openEdit = (category: CategoryDto) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const handleDeactivate = async (category: CategoryDto) => {
    if (!confirm(`¿Desactivar la categoría "${category.name}"? Los productos asociados quedarán sin filtrar por esta categoría en el catálogo activo.`)) {
      return
    }
    setBusyId(category.id)
    setError('')
    try {
      await deactivateCategory(category.id)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo desactivar la categoría')
    } finally {
      setBusyId(null)
    }
  }

  const handleActivate = async (category: CategoryDto) => {
    setBusyId(category.id)
    setError('')
    try {
        await activateCategory(category.id)
        load()
    } catch {
        setError('No se pudo reactivar la categoría')
    } finally {
        setBusyId(null)
    }
    }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold m-0">Categorías ({categories.length})</h2>
        <button onClick={openCreate}>+ Nueva categoría</button>
      </div>

      {error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-muted">Cargando categorías...</p>
      ) : categories.length === 0 ? (
        <div className="empty">No hay categorías cargadas.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-muted text-left">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`pill ${c.active ? 'bg-ok/20 text-ok' : 'bg-muted/20 text-muted'}`}>
                      {c.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                        <button className="btn-ghost px-3 py-2 min-h-0 text-xs" onClick={() => openEdit(c)}>
                            Editar
                        </button>
                        {c.active ? (
                            <button
                            className="btn-ghost px-3 py-2 min-h-0 text-xs"
                            disabled={busyId === c.id}
                            onClick={() => handleDeactivate(c)}
                            >
                            Desactivar
                            </button>
                        ) : (
                            <button
                            className="px-3 py-2 min-h-0 text-xs bg-ok"
                            style={{ color: '#07140a' }}
                            disabled={busyId === c.id}
                            onClick={() => handleActivate(c)}
                            >
                            Reactivar
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <CategoryFormModal
          mode={editingCategory ? 'edit' : 'create'}
          category={editingCategory}
          onClose={() => setModalOpen(false)}
          onSuccess={load}
        />
      )}
    </div>
  )
}