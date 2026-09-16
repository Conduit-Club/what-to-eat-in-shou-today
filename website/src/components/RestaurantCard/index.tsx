import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type {Restaurant} from '../../types/restaurant';

export default function RestaurantCard({restaurant}: {restaurant: Restaurant}) {
  const imageUrl = useBaseUrl(restaurant.image || '/img/restaurant-placeholder.svg');
  return <article className="restaurant-card">
    <img className="restaurant-card__image" src={imageUrl} alt={restaurant.image ? restaurant.name : '暂无餐厅照片'} loading="lazy" />
    <div className="restaurant-card__body">
      <span className="badge badge--secondary">{restaurant.category === 'on-campus' ? '校内' : '校外'}</span>
      <h2><Link to={restaurant.detailPath}>{restaurant.name}</Link></h2>
      <dl>
        <dt>位置</dt><dd>{restaurant.location}</dd>
        <dt>口感</dt><dd>{restaurant.taste}</dd>
        <dt>营业时间</dt><dd>{restaurant.openingHours || '待补充'}</dd>
        <dt>用餐时间</dt><dd>{restaurant.visitedAt || '待补充'}</dd>
        <dt>最近核验</dt><dd>{restaurant.updatedAt || '待补充'}</dd>
      </dl>
      <Link to={restaurant.detailPath}>查看消费范围与同学评价 →</Link>
    </div>
  </article>;
}
