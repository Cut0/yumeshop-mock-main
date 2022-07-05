import express from 'express'

import { removeUndefinedKeys } from '../utils/removeUndefinedKeys'
import {
  getShopItems,
  getShopItem,
  createShopItem,
  updateShopItem,
  deleteShopItem,
} from '../database'
import {
  ShopItem,
  ShopItemDetail,
  ShopItemPostParams,
  ShopItemPutParams,
} from '../types/openapi/models'

const router = express.Router()

router.get<
  '/',
  {},
  ShopItem[],
  {},
  {
    category_id?: string
    campaign_id?: string
  }
>('/', (req, res) => {
  const data = getShopItems({
    category_id: req.query.category_id,
    campaign_id: req.query.campaign_id,
  })
  res.json(data)
})

router.get<
  '/:shopItemId',
  { shopItemId: string },
  ShopItemDetail,
  {},
  {
    category_id?: string
    campaign_id?: string
  }
>('/:shopItemId', (req, res) => {
  const data = getShopItem(req.params.shopItemId)
  res.json(data)
})

router.post<'/', {}, ShopItemDetail, ShopItemPostParams, {}>(
  '/',
  (req, res) => {
    const data = createShopItem({
      name: req.body.name,
      thumbnail: req.body.thumbnail,
      selling_price: req.body.selling_price,
      original_price: req.body.original_price,
      tags: req.body.tags,
      categories: req.body.categories,
      campaigns: req.body.campaigns,
      details: req.body.details,
      images: req.body.images,
      related_shop_items: req.body.related_shop_items,
    })
    res.json(data)
  },
)

router.put<
  '/:shopItemId',
  { shopItemId: string },
  ShopItemDetail,
  ShopItemPutParams,
  {}
>('/:shopItemId', (req, res) => {
  const body = removeUndefinedKeys({
    name: req.body.name,
    thumbnail: req.body.thumbnail,
    selling_price: req.body.selling_price,
    original_price: req.body.original_price,
    tags: req.body.tags,
    categories: req.body.categories,
    campaigns: req.body.campaigns,
    details: req.body.details,
    images: req.body.images,
    related_shop_items: req.body.related_shop_items,
  })
  const data = updateShopItem(req.params.shopItemId, body)
  res.json(data)
})

router.delete<'/:shopItemId', { shopItemId: string }, {}, {}, {}>(
  '/:shopItemId',
  (req, res) => {
    deleteShopItem(req.params.shopItemId)
    res.sendStatus(204)
  },
)

export default router
