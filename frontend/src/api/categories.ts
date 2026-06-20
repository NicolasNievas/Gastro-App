import client from './client'
import type { CategoryDto, CategoryRequest } from '../types'

export const getCategories = () => client.get<CategoryDto[]>('/categories')

export const createCategory = (data: CategoryRequest) =>
  client.post<CategoryDto>('/categories', data)

export const updateCategory = (id: number, data: CategoryRequest) =>
  client.put<CategoryDto>(`/categories/${id}`, data)

export const deactivateCategory = (id: number) =>
  client.delete<void>(`/categories/${id}`)

export const getAllCategoriesIncludingInactive = () =>
  client.get<CategoryDto[]>('/categories/all')

export const activateCategory = (id: number) =>
  client.patch<void>(`/categories/${id}/activate`)