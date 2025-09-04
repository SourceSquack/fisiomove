
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/fisiomove/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 147716, hash: '521ccacfaf8204d1253ef25a9c54ccea4d0722f8efe57772b1b35379bf9fd125', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17265, hash: '6a82fb9d17521fbd9cbdc36fc397ba10ff8e15973790a3fe71ff113ed2585c8a', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-EIJSLQIK.css': {size: 775638, hash: 'vkHGfAjzQME', text: () => import('./assets-chunks/styles-EIJSLQIK_css.mjs').then(m => m.default)}
  },
};
