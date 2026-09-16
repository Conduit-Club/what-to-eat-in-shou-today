import type {Config} from '@docusaurus/types';

const baseUrl = process.env.BASE_URL || '/';
if (!baseUrl.startsWith('/') || !baseUrl.endsWith('/')) {
  throw new Error('BASE_URL 必须以 / 开始和结束');
}
const contributionApiUrl = process.env.CONTRIBUTION_API_URL || '';
if (contributionApiUrl && !/^https?:\/\//.test(contributionApiUrl)) {
  throw new Error('CONTRIBUTION_API_URL 必须是完整的 HTTP(S) 接口地址');
}

const config: Config = {
  title: '今日海大吃什么',
  tagline: '海大校内及周边餐饮信息',
  url: process.env.SITE_URL || 'https://example.com',
  baseUrl,
  trailingSlash: true,
  customFields: {contributionApiUrl},
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  i18n: {defaultLocale: 'zh-Hans', locales: ['zh-Hans']},
  presets: [
    ['classic', {
      docs: {routeBasePath: '/', sidebarPath: './sidebars.ts'},
      blog: false,
      theme: {customCss: './src/css/custom.css'},
    }],
  ],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: '今日海大吃什么',
      items: [
        {to: '/', label: '首页', position: 'left'},
        {to: '/restaurants', label: '餐厅卡片', position: 'left'},
        {to: '/submit', label: '提交餐厅', position: 'right'},
      ],
    },
  },
};
export default config;
