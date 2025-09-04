
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 147706, hash: 'd0eca9a8e935275cf3cd45289b3ff6cd2a5e0a5c9bc1bec9282f2a9adeba7f37', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17255, hash: '854a931a6280275099dc1a5b7e2970d813631b9969176dbc5ebb78036c0f57c9', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-EIJSLQIK.css': {size: 775638, hash: 'vkHGfAjzQME', text: () => import('./assets-chunks/styles-EIJSLQIK_css.mjs').then(m => m.default)}
  },
};
