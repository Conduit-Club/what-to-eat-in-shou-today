/** 发布数据使用稳定 ID；未知信息显式使用 null，不编造图片或核验日期。 */
export interface Restaurant {
  id: string;
  name: string;
  category: 'on-campus' | 'off-campus';
  image: string | null;
  location: string;
  taste: string;
  openingHours: string | null;
  visitedAt: string | null;
  updatedAt: string | null;
  price: string;
  detailPath: string;
}
