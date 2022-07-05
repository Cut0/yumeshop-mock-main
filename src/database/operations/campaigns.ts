import {
  Campaign,
  CampaignPostParams,
  CampaignPutParams,
} from '../../types/openapi/models'

import { getId } from '../../utils/getId'
import { db, dataPaths, deleteRelation } from '../db'
import { CampaignDBModel } from '../models'

// リレーションされているdataPath
const relatedBy = [{ path: dataPaths.shopItems, key: 'campaigns' }]

export const getCampaigns = (): Campaign[] => {
  return db.getObject<CampaignDBModel[]>(dataPaths.campaigns)
}

export const getCampaign = (id: string): Campaign => {
  const targetIndex = db.getIndex(dataPaths.campaigns, id)
  if (targetIndex === -1) throw new Error(`${id}のキャンペーンは存在しません`)
  const targetData = db.getObject<CampaignDBModel>(
    `${dataPaths.campaigns}[${targetIndex}]`,
  )
  return targetData
}

export const createCampaign = (params: CampaignPostParams): Campaign => {
  const data: CampaignDBModel = {
    id: getId(),
    ...params,
  }
  db.push(`${dataPaths.campaigns}[]`, data)
  return data
}

export const updateCampaign = (
  id: string,
  params: CampaignPutParams,
): Campaign => {
  const targetIndex = db.getIndex(dataPaths.campaigns, id)
  if (targetIndex === -1) throw new Error(`${id}のキャンペーンは存在しません`)
  const targetData = db.getObject<CampaignDBModel>(
    `${dataPaths.campaigns}[${targetIndex}]`,
  )
  const data: CampaignDBModel = {
    ...targetData,
    ...params,
  }
  db.push(`${dataPaths.campaigns}[${targetIndex}]`, data)
  return data
}

export const deleteCampaign = (id: string): Campaign => {
  const targetIndex = db.getIndex(dataPaths.campaigns, id)
  if (targetIndex === -1) throw new Error(`${id}のキャンペーンは存在しません`)
  const targetData = db.getObject<CampaignDBModel>(
    `${dataPaths.campaigns}[${targetIndex}]`,
  )
  db.delete(`${dataPaths.campaigns}[${targetIndex}]`)
  // 削除されたレコードのリレーションの解消
  relatedBy.forEach((item) => {
    deleteRelation(item.path, item.key, id)
  })
  return targetData
}
