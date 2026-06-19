import client from './client'
import type { CategoryDto } from '../types'

export const getCategories = () => client.get<CategoryDto[]>('/categories')