import {
  Tag,
  TagPostParams,
  TagPutParams,
  TagGroup,
} from '../../types/openapi/models'

import { getId } from '../../utils/getId'
import { db, dataPaths, deleteRelation } from '../db'
import { TagDBModel } from '../models'

const tagGroupList = Object.values(TagGroup)

// リレーションされているdataPath
const relatedBy = [
  { path: dataPaths.shopItems, key: 'tags' },
  { path: dataPaths.informations, key: 'tags' },
] as const

export const isValidTagGroup = (
  tagGroup: string | undefined,
): tagGroup is TagGroup => {
  if (!tagGroup) return true
  return tagGroupList.some((item) => item === tagGroup)
}

export const getTags = (tagGroup?: TagGroup): Tag[] => {
  if (tagGroup) {
    return (
      db.filter<Tag>(dataPaths.tags, (tag) => {
        return tag.tag_group === tagGroup
      }) || []
    )
  }
  return db.getObject<TagDBModel[]>(dataPaths.tags)
}

export const getTag = (id: string): Tag => {
  const targetIndex = db.getIndex(dataPaths.tags, id)
  if (targetIndex === -1) throw new Error(`${id}のタグは存在しません`)
  const targetData = db.getObject<TagDBModel>(
    `${dataPaths.tags}[${targetIndex}]`,
  )
  return targetData
}

export const createTag = (params: TagPostParams): Tag => {
  const data: TagDBModel = {
    id: getId(),
    ...params,
  }
  db.push(`${dataPaths.tags}[]`, data)
  return data
}

export const updateTag = (id: string, params: TagPutParams): Tag => {
  const targetIndex = db.getIndex(dataPaths.tags, id)
  if (targetIndex === -1) throw new Error(`${id}のタグは存在しません`)
  const targetData = db.getObject<TagDBModel>(
    `${dataPaths.tags}[${targetIndex}]`,
  )
  const data: TagDBModel = {
    ...targetData,
    ...params,
  }
  db.push(`${dataPaths.tags}[${targetIndex}]`, data)
  return data
}

export const deleteTag = (id: string): Tag => {
  const targetIndex = db.getIndex(dataPaths.tags, id)
  if (targetIndex === -1) throw new Error(`${id}のタグは存在しません`)
  const targetData = db.getObject<TagDBModel>(
    `${dataPaths.tags}[${targetIndex}]`,
  )
  db.delete(`${dataPaths.tags}[${targetIndex}]`)
  // 削除されたレコードのリレーションの解消
  relatedBy.forEach((item) => {
    deleteRelation(item.path, item.key, id)
  })
  return targetData
}
