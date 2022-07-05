import express from 'express'

import { removeUndefinedKeys } from '../utils/removeUndefinedKeys'
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../database'
import {
  Promotion,
  PromotionPostParams,
  PromotionPutParams,
} from '../types/openapi/models'

const router = express.Router()

router.get<'/', {}, Promotion[], {}, {}>('/', (req, res) => {
  const data = getPromotions()
  res.json(data)
})

router.post<'/', {}, Promotion, PromotionPostParams, {}>('/', (req, res) => {
  const data = createPromotion({
    title: req.body.title,
    image: req.body.image,
    detail: req.body.detail,
    link: req.body.link,
  })
  res.json(data)
})

router.put<
  '/:promotionId',
  { promotionId: string },
  Promotion,
  PromotionPutParams,
  {}
>('/:promotionId', (req, res) => {
  const body = removeUndefinedKeys({
    title: req.body.title,
    image: req.body.image,
    detail: req.body.detail,
    link: req.body.link,
  })
  const data = updatePromotion(req.params.promotionId, body)
  res.json(data)
})

router.delete<'/:promotionId', { promotionId: string }, {}, {}, {}>(
  '/:promotionId',
  (req, res) => {
    deletePromotion(req.params.promotionId)
    res.sendStatus(204)
  },
)

export default router
