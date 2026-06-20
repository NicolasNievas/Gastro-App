import { useState, useEffect, type FormEvent } from 'react'
import { createCategory, updateCategory } from '../../api/categories'
import type { CategoryDto, CategoryRequest } from '../../types'

interface CategoryFormModalProps {
  mode: 'create' | 'edit'
  category?: CategoryDto | null
  onClose: () => void
  onSuccess: () => void
}

export default function CategoryFormModal({
  mode, category, onClose, onSuccess,
}: CategoryFormModalProps) {
  const [name, setName]   = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && category) {
      setName(category.name)
    }
  }, [mode, category])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('El nombre es obligatorio')

    const payload: CategoryRequest = { name: name.trim() }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        await createCategory(payload)
      } else if (category) {
        await updateCategory(category.id, payload)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo guardar la categoría')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-panel border border-line rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="m-0 text-lg font-bold">
            {mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
          </h2>
          <button className="btn-ghost px-3 py-2 min-h-0" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-3 py-2 text-sm">{error}</div>
          )}

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Nombre</span>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus required />
          </label>

          <div className="flex gap-3 mt-2">
            <button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Guardando...' : mode === 'create' ? 'Crear categoría' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-ghost flex-1" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}