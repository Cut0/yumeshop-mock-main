import {
  Campaign,
  Category,
  Information,
  Promotion,
  ShopItemDetail,
  Tag,
} from '../types/openapi/models'

export interface ShopItemDBModel
  extends Omit<
    ShopItemDetail,
    'categories' | 'campaigns' | 'tags' | 'related_shop_items'
  > {
  categories: string[]
  campaigns: string[]
  tags: string[]
  related_shop_items: string[]
}

export type CampaignDBModel = Campaign

export type CategoryDBModel = Category

export type PromotionDBModel = Promotion

export interface InformationDBModel extends Omit<Information, 'tags'> {
  tags: string[]
}

export type TagDBModel = Tag
