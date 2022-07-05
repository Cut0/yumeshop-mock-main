import express from 'express'

import { removeUndefinedKeys } from '../utils/removeUndefinedKeys'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../database'
import {
  Category,
  CategoryPostParams,
  CategoryPutParams,
} from '../types/openapi/models'

const router = express.Router()

router.get<'/', {}, Category[], {}, {}>('/', (req, res) => {
  const data = getCategories()
  res.json(data)
})

router.post<'/', {}, Category, CategoryPostParams, {}>('/', (req, res) => {
  const data = createCategory({
    name: req.body.name,
    thumbnail: req.body.thumbnail,
  })
  res.json(data)
})

router.put<
  '/:categoryId',
  { categoryId: string },
  Category,
  CategoryPutParams,
  {}
>('/:categoryId', (req, res) => {
  const body = removeUndefinedKeys({
    name: req.body.name,
    thumbnail: req.body.thumbnail,
  })
  const data = updateCategory(req.params.categoryId, body)
  res.json(data)
})

router.delete<'/:categoryId', { categoryId: string }, {}, {}, {}>(
  '/:categoryId',
  (req, res) => {
    deleteCategory(req.params.categoryId)
    res.sendStatus(204)
  },
)

export default router
