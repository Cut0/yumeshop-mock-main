import {
  Promotion,
  PromotionPostParams,
  PromotionPutParams,
} from '../../types/openapi/models'

import { getId } from '../../utils/getId'
import { db, dataPaths } from '../db'
import { PromotionDBModel } from '../models'

export const getPromotions = (): Promotion[] => {
  return db.getObject<PromotionDBModel[]>(dataPaths.promotions)
}

export const getPromotion = (id: string): Promotion => {
  const targetIndex = db.getIndex(dataPaths.promotions, id)
  if (targetIndex === -1) throw new Error(`${id}のプロモーションは存在しません`)
  const targetData = db.getObject<PromotionDBModel>(
    `${dataPaths.promotions}[${targetIndex}]`,
  )
  return targetData
}

export const createPromotion = (params: PromotionPostParams): Promotion => {
  const data: PromotionDBModel = {
    id: getId(),
    ...params,
  }
  db.push(`${dataPaths.promotions}[]`, data)
  return data
}

export const updatePromotion = (
  id: string,
  params: PromotionPutParams,
): Promotion => {
  const targetIndex = db.getIndex(dataPaths.promotions, id)
  if (targetIndex === -1) throw new Error(`${id}のプロモーションは存在しません`)
  const targetData = db.getObject<PromotionDBModel>(
    `${dataPaths.promotions}[${targetIndex}]`,
  )
  const data: PromotionDBModel = {
    ...targetData,
    ...params,
  }
  db.push(`${dataPaths.promotions}[${targetIndex}]`, data)
  return data
}

export const deletePromotion = (id: string): Promotion => {
  const targetIndex = db.getIndex(dataPaths.promotions, id)
  if (targetIndex === -1) throw new Error(`${id}のプロモーションは存在しません`)
  const targetData = db.getObject<PromotionDBModel>(
    `${dataPaths.promotions}[${targetIndex}]`,
  )
  db.delete(`${dataPaths.promotions}[${targetIndex}]`)
  return targetData
}
