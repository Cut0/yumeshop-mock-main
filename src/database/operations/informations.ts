import {
  Information,
  InformationPostParams,
  InformationPutParams,
  Tag,
  TagGroup,
} from '../../types/openapi/models'

import { getId } from '../../utils/getId'
import { db, dataPaths } from '../db'
import { InformationDBModel } from '../models'
import { getTag } from './tags'

const getLinkedTags = (tagIds: string[]): Tag[] => {
  const tags = tagIds.map((tagId) => {
    const tag = getTag(tagId)
    if (tag.tag_group !== TagGroup.Information)
      throw new Error(`${tagId}のタグのグループが不正です`)
    return tag
  })
  return tags
}

const resolveInformationRelation = (data: InformationDBModel): Information => {
  const tags = data.tags ? getLinkedTags(data.tags) : []
  return {
    ...data,
    tags: tags,
  }
}

export const getInformations = (): Information[] => {
  const data = db.getObject<InformationDBModel[]>(dataPaths.informations)
  return data.map((item) => resolveInformationRelation(item))
}

export const getInformation = (id: string): Information => {
  const targetIndex = db.getIndex(dataPaths.informations, id)
  if (targetIndex === -1) throw new Error(`${id}のお知らせは存在しません`)
  const targetData = db.getObject<InformationDBModel>(
    `${dataPaths.informations}[${targetIndex}]`,
  )
  return resolveInformationRelation(targetData)
}

export const createInformation = (
  params: InformationPostParams,
): Information => {
  const data: InformationDBModel = {
    ...params,
    id: getId(),
  }
  // リレーションの解決兼バリデーション
  const resolvedData = resolveInformationRelation(data)
  db.push(`${dataPaths.informations}[]`, data)
  return resolvedData
}

export const updateInformation = (
  id: string,
  params: InformationPutParams,
): Information => {
  const targetIndex = db.getIndex(dataPaths.informations, id)
  if (targetIndex === -1) throw new Error(`${id}のお知らせは存在しません`)
  const targetData = db.getObject<InformationDBModel>(
    `${dataPaths.informations}[${targetIndex}]`,
  )
  const data: InformationDBModel = {
    ...targetData,
    ...params,
  }
  // リレーションの解決兼バリデーション
  const resolvedData = resolveInformationRelation(data)
  db.push(`${dataPaths.informations}[${targetIndex}]`, data)
  return resolvedData
}

export const deleteInformation = (id: string): Information => {
  const targetIndex = db.getIndex(dataPaths.informations, id)
  if (targetIndex === -1) throw new Error(`${id}のお知らせは存在しません`)
  const targetData = db.getObject<InformationDBModel>(
    `${dataPaths.informations}[${targetIndex}]`,
  )
  db.delete(`${dataPaths.informations}[${targetIndex}]`)
  return resolveInformationRelation(targetData)
}
