import React, {useState} from 'react';
import Layout from '@theme/Layout';
import RestaurantCard from '../components/RestaurantCard';
import data from '../data/restaurants.json';
import type {Restaurant} from '../types/restaurant';

// 唯一数据入口；以后可替换为构建插件生成的审核后快照。
const restaurants = data as Restaurant[];
export default function Restaurants() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const visible = restaurants.filter(item =>
    (category === 'all' || item.category === category) &&
    `${item.name} ${item.location}`.includes(query.trim()));
  return <Layout title="餐厅卡片" description="按位置浏览海大校内及周边餐厅">
    <main className="container margin-vert--lg">
      <h1>今天想吃什么？</h1>
      <p>浏览同学分享的餐厅。缺少的照片和时间信息等待大家补充。</p>
      <div className="restaurant-filters">
        <label>搜索名称或位置<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <label>就餐范围<select value={category} onChange={event => setCategory(event.target.value)}><option value="all">全部</option><option value="on-campus">校内</option><option value="off-campus">校外</option></select></label>
      </div>
      <p role="status">共 {visible.length} 家餐厅</p>
      <div className="restaurant-grid">{visible.map(item => <RestaurantCard key={item.id} restaurant={item} />)}</div>
    </main>
  </Layout>;
}
