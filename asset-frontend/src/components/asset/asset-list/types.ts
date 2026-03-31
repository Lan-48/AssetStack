export type AssetListItem = {
  id: string | number
  name: string
  price: string | number
  days: number
  status?: string
  category?: string
}

export type AssetListProps = {
  assets?: AssetListItem[]
  viewMode?: 'grid' | 'list'
  filterStatus?: string
  filterCategory?: string
}
