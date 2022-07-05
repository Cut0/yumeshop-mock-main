import express from 'express'

import { removeUndefinedKeys } from '../utils/removeUndefinedKeys'
import {
  isValidTagGroup,
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '../database'
import { Tag, TagPostParams, TagPutParams } from '../types/openapi/models'

const router = express.Router()

router.get<'/', {}, Tag[], {}, { tag_group?: string }>('/', (req, res) => {
  if (!isValidTagGroup(req.query.tag_group)) {
    res.sendStatus(403)
    return
  }
  const data = getTags(req.query.tag_group)
  res.json(data)
})

router.post<'/', {}, Tag, TagPostParams, {}>('/', (req, res) => {
  if (!isValidTagGroup(req.body.tag_group)) {
    res.sendStatus(403)
    return
  }
  const data = createTag({
    name: req.body.name,
    color: req.body.color,
    tag_group: req.body.tag_group,
  })
  res.json(data)
})

router.put<'/:tagId', { tagId: string }, Tag, TagPutParams, {}>(
  '/:tagId',
  (req, res) => {
    const body = removeUndefinedKeys({
      name: req.body.name,
      color: req.body.color,
    })
    const data = updateTag(req.params.tagId, body)
    res.json(data)
  },
)

router.delete<'/:tagId', { tagId: string }, {}, {}, {}>(
  '/:tagId',
  (req, res) => {
    deleteTag(req.params.tagId)
    res.sendStatus(204)
  },
)

export default router
