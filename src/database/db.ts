import path from 'path'
import { JsonDB } from 'node-json-db'

import {
  ShopItemDBModel,
  CategoryDBModel,
  CampaignDBModel,
  InformationDBModel,
  PromotionDBModel,
  TagDBModel,
} from './models'

export const dataPaths = {
  shopItems: '/shopItems',
  categories: '/categories',
  campaigns: '/campaigns',
  informations: '/informations',
  promotions: '/promotions',
  tags: '/tags',
} as const

export type ModelTypes = {
  '/shopItems': ShopItemDBModel
  '/categories': CategoryDBModel
  '/campaigns': CampaignDBModel
  '/informations': InformationDBModel
  '/promotions': PromotionDBModel
  '/tags': TagDBModel
}

export type DataPathsTypes = typeof dataPaths[keyof typeof dataPaths]

const file = path.resolve(__dirname, '../../database/db.json')
export const db = new JsonDB(file, true, true)

// dbの初期化
if (!db.exists(dataPaths.shopItems)) {
  db.push(dataPaths.shopItems, [])
}
if (!db.exists(dataPaths.categories)) {
  db.push(dataPaths.categories, [])
}
if (!db.exists(dataPaths.campaigns)) {
  db.push(dataPaths.campaigns, [])
}
if (!db.exists(dataPaths.informations)) {
  db.push(dataPaths.informations, [])
}
if (!db.exists(dataPaths.promotions)) {
  db.push(dataPaths.promotions, [])
}
if (!db.exists(dataPaths.tags)) {
  db.push(dataPaths.tags, [])
}

/**
 * リレーションされているidを削除する関数
 * レコードの削除などを行なって、その削除されたレコードを参照している部分などを解消するために使う
 * @param dataPath DBのpath
 * @param key 対象とするキー
 * @param id リレーションを解消するid
 */
export const deleteRelation = (
  dataPath: DataPathsTypes,
  key: string,
  id: string,
): void => {
  const currentData = db.getObject<Record<string, unknown>[]>(dataPath)
  const data = currentData.map((obj) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!Array.isArray((obj as any)[key]))
      throw new Error(
        `${dataPath}/${key}は配列ではないのでrelationを解消できません。`,
      )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetIdList: any[] = (obj as any)[key]
    return {
      ...obj,
      [key]: targetIdList.filter((tagId) => tagId !== id),
    }
  })
  db.push(dataPath, data)
}
