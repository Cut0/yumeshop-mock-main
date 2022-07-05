import express from 'express'

import { removeUndefinedKeys } from '../utils/removeUndefinedKeys'
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../database'
import {
  Campaign,
  CampaignPostParams,
  CampaignPutParams,
} from '../types/openapi/models'

const router = express.Router()

router.get<'/', {}, Campaign[], {}, {}>('/', (req, res) => {
  const data = getCampaigns()
  res.json(data)
})

router.post<'/', {}, Campaign, CampaignPostParams, {}>('/', (req, res) => {
  const data = createCampaign({
    name: req.body.name,
    thumbnail: req.body.thumbnail,
  })
  res.json(data)
})

router.put<
  '/:campaignId',
  { campaignId: string },
  Campaign,
  CampaignPutParams,
  {}
>('/:campaignId', (req, res) => {
  const body = removeUndefinedKeys({
    name: req.body.name,
    thumbnail: req.body.thumbnail,
  })
  const data = updateCampaign(req.params.campaignId, body)
  res.json(data)
})

router.delete<'/:campaignId', { campaignId: string }, {}, {}, {}>(
  '/:campaignId',
  (req, res) => {
    deleteCampaign(req.params.campaignId)
    res.sendStatus(204)
  },
)

export default router
