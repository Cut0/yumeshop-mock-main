import {
  Category,
  CategoryPostParams,
  CategoryPutParams,
} from '../../types/openapi/models'

import { getId } from '../../utils/getId'
import { db, dataPaths, deleteRelation } from '../db'
import { CategoryDBModel } from '../models'

// リレーションされているdataPath
const relatedBy = [{ path: dataPaths.shopItems, key: 'categories' }]

export const getCategories = (): Category[] => {
  return db.getObject<CategoryDBModel[]>(dataPaths.categories)
}

export const getCategory = (id: string): Category => {
  const targetIndex = db.getIndex(dataPaths.categories, id)
  if (targetIndex === -1) throw new Error(`${id}のカテゴリは存在しません`)
  const targetData = db.getObject<CategoryDBModel>(
    `${dataPaths.categories}[${targetIndex}]`,
  )
  return targetData
}

export const createCategory = (params: CategoryPostParams): Category => {
  const data: CategoryDBModel = {
    id: getId(),
    ...params,
  }
  db.push(`${dataPaths.categories}[]`, data)
  return data
}

export const updateCategory = (
  id: string,
  params: CategoryPutParams,
): Category => {
  const targetIndex = db.getIndex(dataPaths.categories, id)
  if (targetIndex === -1) throw new Error(`${id}のカテゴリは存在しません`)
  const targetData = db.getObject<CategoryDBModel>(
    `${dataPaths.categories}[${targetIndex}]`,
  )
  const data: CategoryDBModel = {
    ...targetData,
    ...params,
  }
  db.push(`${dataPaths.categories}[${targetIndex}]`, data)
  return data
}

export const deleteCategory = (id: string): Category => {
  const targetIndex = db.getIndex(dataPaths.categories, id)
  if (targetIndex === -1) throw new Error(`${id}のカテゴリは存在しません`)
  const targetData = db.getObject<CategoryDBModel>(
    `${dataPaths.categories}[${targetIndex}]`,
  )
  db.delete(`${dataPaths.categories}[${targetIndex}]`)
  // 削除されたレコードのリレーションの解消
  relatedBy.forEach((item) => {
    deleteRelation(item.path, item.key, id)
  })
  return targetData
}
