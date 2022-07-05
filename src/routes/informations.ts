import express from 'express'

import { removeUndefinedKeys } from '../utils/removeUndefinedKeys'
import {
  getInformations,
  createInformation,
  updateInformation,
  deleteInformation,
} from '../database'
import {
  Information,
  InformationPostParams,
  InformationPutParams,
} from '../types/openapi/models'

const router = express.Router()

router.get<'/', {}, Information[], {}, {}>('/', (req, res) => {
  const data = getInformations()
  res.json(data)
})

router.post<'/', {}, Information, InformationPostParams, {}>(
  '/',
  (req, res) => {
    const data = createInformation({
      title: req.body.title,
      detail: req.body.detail,
      tags: req.body.tags,
      announced_at: req.body.announced_at,
    })
    res.json(data)
  },
)

router.put<
  '/:informationId',
  { informationId: string },
  Information,
  InformationPutParams,
  {}
>('/:informationId', (req, res) => {
  const body = removeUndefinedKeys({
    title: req.body.title,
    detail: req.body.detail,
    tags: req.body.tags,
    announced_at: req.body.announced_at,
  })
  const data = updateInformation(req.params.informationId, body)
  res.json(data)
})

router.delete<'/:informationId', { informationId: string }, {}, {}, {}>(
  '/:informationId',
  (req, res) => {
    deleteInformation(req.params.informationId)
    res.sendStatus(204)
  },
)

export default router
