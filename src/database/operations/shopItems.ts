import {
  Campaign,
  Category,
  Price,
  ShopItem,
  ShopItemDetail,
  ShopItemPostParams,
  ShopItemPutParams,
  Tag,
  TagGroup,
} from '../../types/openapi/models'

import { getId } from '../../utils/getId'
import { db, dataPaths, deleteRelation } from '../db'
import { ShopItemDBModel } from '../models'
import { getCategory } from './categories'
import { getCampaign } from './campaigns'
import { getTag } from './tags'

// リレーションされているdataPath
const relatedBy = [{ path: dataPaths.shopItems, key: 'related_shop_items' }]

const createPriceObject = (
  newSellingPrice?: number,
  newOriginalPrice?: number,
  prevData?: Price,
): Price => {
  const sellingPrice = newSellingPrice || prevData?.selling_price
  const originalPrice = newOriginalPrice || prevData?.original_price
  if (sellingPrice === undefined || originalPrice === undefined)
    throw new Error('新しいpriceの値が正しく計算できませんでした。')
  const discounted = sellingPrice !== originalPrice
  const discountAmount = originalPrice - sellingPrice
  const discountPercentage = Math.floor((sellingPrice / originalPrice) * 100)
  return {
    selling_price: sellingPrice,
    original_price: originalPrice,
    discounted: discounted,
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
  }
}

const getLinkedCategories = (categoryIds: string[]): Category[] => {
  const categories = categoryIds.map((categoryId) => getCategory(categoryId))
  return categories
}

const getLinkedCampaigns = (campaignIds: string[]): Campaign[] => {
  const campaigns = campaignIds.map((campaignId) => getCampaign(campaignId))
  return campaigns
}

const getLinkedTags = (tagIds: string[]): Tag[] => {
  const tags = tagIds.map((tagId) => {
    const tag = getTag(tagId)
    if (tag.tag_group !== TagGroup.ShopItem)
      throw new Error(`${tagId}のタグのグループが不正です`)
    return tag
  })
  return tags
}

const getLinkedRelatedShopItems = (shopItemIds: string[]): ShopItem[] => {
  const relatedShopItems = shopItemIds.map((shopItemId) => {
    const targetIndex = db.getIndex(dataPaths.shopItems, shopItemId)
    if (targetIndex === -1) throw new Error(`${shopItemId}の商品は存在しません`)
    const targetData = db.getObject<ShopItemDBModel>(
      `${dataPaths.shopItems}[${targetIndex}]`,
    )
    return targetData
  })
  return relatedShopItems.map((item) => {
    const categories = item.categories
      ? getLinkedCategories(item.categories)
      : []
    const campaigns = item.campaigns ? getLinkedCampaigns(item.campaigns) : []
    const tags = item.tags ? getLinkedTags(item.tags) : []

    return {
      id: item.id,
      name: item.name,
      thumbnail: item.thumbnail,
      price: item.price,
      categories: categories,
      campaigns: campaigns,
      tags: tags,
    }
  })
}

const resolveShopItemRelation = (data: ShopItemDBModel): ShopItemDetail => {
  const categories = data.categories ? getLinkedCategories(data.categories) : []
  const campaigns = data.campaigns ? getLinkedCampaigns(data.campaigns) : []
  const tags = data.tags ? getLinkedTags(data.tags) : []
  const relatedShopItems = data.related_shop_items
    ? getLinkedRelatedShopItems(data.related_shop_items)
    : []
  return {
    ...data,
    categories: categories,
    campaigns: campaigns,
    tags: tags,
    related_shop_items: relatedShopItems,
  }
}

type GetQueriesType = {
  category_id?: string
  campaign_id?: string
}

export const getShopItems = (queries?: GetQueriesType): ShopItem[] => {
  if (queries?.campaign_id && queries.category_id)
    throw new Error('category_idとcampaign_idは同時に指定できません。')
  if (queries?.category_id) {
    const index = db.getIndex(dataPaths.categories, queries.category_id)
    if (index === -1)
      throw new Error(`${queries.category_id}のcategory_idは存在しません。`)
  }
  if (queries?.campaign_id) {
    const index = db.getIndex(dataPaths.campaigns, queries.campaign_id)
    if (index === -1)
      throw new Error(`${queries.campaign_id}のcampaign_idは存在しません。`)
  }
  const data =
    db.filter<ShopItemDBModel>(
      dataPaths.shopItems,
      (shopItem: ShopItemDBModel) => {
        if (queries?.category_id) {
          return shopItem.categories.includes(queries.category_id)
        }
        if (queries?.campaign_id) {
          return shopItem.campaigns.includes(queries.campaign_id)
        }
        return true
      },
    ) || []
  return data.map((item) => {
    const shopItem = resolveShopItemRelation(item)
    return {
      id: shopItem.id,
      name: shopItem.name,
      thumbnail: shopItem.thumbnail,
      price: shopItem.price,
      categories: shopItem.categories,
      campaigns: shopItem.campaigns,
      tags: shopItem.tags,
    }
  })
}

export const getShopItem = (id: string): ShopItemDetail => {
  const targetIndex = db.getIndex(dataPaths.shopItems, id)
  if (targetIndex === -1) throw new Error(`${id}の商品は存在しません`)
  const targetData = db.getObject<ShopItemDBModel>(
    `${dataPaths.shopItems}[${targetIndex}]`,
  )
  return resolveShopItemRelation(targetData)
}

export const createShopItem = (params: ShopItemPostParams): ShopItemDetail => {
  const { selling_price, original_price, ...rest } = params

  const data: ShopItemDBModel = {
    ...rest,
    id: getId(),
    price: createPriceObject(selling_price, original_price),
  }
  // リレーションの解決兼バリデーション
  const resolvedData = resolveShopItemRelation(data)
  db.push(`${dataPaths.shopItems}[]`, data)
  return resolvedData
}

export const updateShopItem = (
  id: string,
  params: ShopItemPutParams,
): ShopItemDetail => {
  const { selling_price, original_price, ...rest } = params

  const targetIndex = db.getIndex(dataPaths.shopItems, id)
  if (targetIndex === -1) throw new Error(`${id}の商品は存在しません`)
  const targetData = db.getObject<ShopItemDBModel>(
    `${dataPaths.shopItems}[${targetIndex}]`,
  )
  const data: ShopItemDBModel = {
    ...targetData,
    ...rest,
    price:
      selling_price || original_price
        ? createPriceObject(selling_price, original_price, targetData.price)
        : targetData.price,
  }
  // リレーションの解決兼バリデーション
  const resolvedData = resolveShopItemRelation(data)
  db.push(`${dataPaths.shopItems}[${targetIndex}]`, data)
  return resolvedData
}

export const deleteShopItem = (id: string): ShopItemDetail => {
  const targetIndex = db.getIndex(dataPaths.shopItems, id)
  if (targetIndex === -1) throw new Error(`${id}の商品は存在しません`)
  const targetData = db.getObject<ShopItemDBModel>(
    `${dataPaths.shopItems}[${targetIndex}]`,
  )
  db.delete(`${dataPaths.shopItems}[${targetIndex}]`)
  // 削除されたレコードのリレーションの解消
  relatedBy.forEach((item) => {
    deleteRelation(item.path, item.key, id)
  })
  return resolveShopItemRelation(targetData)
}
