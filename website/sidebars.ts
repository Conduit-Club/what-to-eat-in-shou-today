import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'index',
    {
      type: 'category', label: '校内',
      items: ['on-campus/index', 'on-campus/changfen'],
    },
    {
      type: 'category', label: '校外',
      items: [
        'off-campus/index',
        'off-campus/shantou-beef-noodles',
        'off-campus/big-pizza',
        'off-campus/pizza-hut-burger',
        'off-campus/taima',
        'off-campus/jinniu',
        'off-campus/taorui',
        'off-campus/burger-king',
        'off-campus/dessert-bbq-pork-rice',
        'off-campus/nanchang-pot-soup',
        'off-campus/jiangxi-stir-fry',
        'off-campus/jiuguozi',
      ],
    },
  ],
};
export default sidebars;
