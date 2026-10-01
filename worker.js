// GLM Coding Plan 反代 — Cloudflare Worker
// 作用：1) 補上 CORS 頭讓手機瀏覽器能直連  2) 轉發到 bigmodel 的 Anthropic 端點
// 部署（免費，5分鐘）：
//   1. 註冊/登入 https://dash.cloudflare.com
//   2. Workers & Pages → Create Worker → Deploy 先建佔位
//   3. Edit code → 全選刪掉 → 貼上本文件全部內容 → Deploy
//   4. 得到地址 https://xxx.your-name.workers.dev
//   5. RP Shell 設置：API 格式選 Anthropic，Base URL 填上面的地址，Key 填 Coding Plan 的 Key，模型 glm-5.3
//   （國內網絡若訪問 workers.dev 慢，可綁定自訂網域或在 URL 後加 /cdn-cgi/trace 測通）

const UPSTREAM = 'https://open.bigmodel.cn/api/anthropic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== 'POST') {
      return new Response('RP proxy is alive', { status: 200, headers: CORS });
    }
    const url = new URL(request.url);
    // 只放行 /v1/messages（Anthropic Messages API 路徑），其餘拒絕
    if (url.pathname !== '/v1/messages') {
      return new Response('not found', { status: 404, headers: CORS });
    }
    const headers = new Headers(request.headers);
    headers.set('Host', 'open.bigmodel.cn');
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ipcountry');
    headers.delete('cf-ray');
    headers.delete('cf-visitor');
    // 說明：官方條款限定套餐額度用於指定編碼工具；默認透傳瀏覽器 UA。
    // 若被擋且自擔風險，可取消下一行註釋改寫 UA：
    // headers.set('User-Agent', 'claude-cli/2.0.34 (external, cli)');
    try {
      const res = await fetch(UPSTREAM + '/v1/messages', {
        method: 'POST',
        headers,
        body: request.body,
        redirect: 'manual',
      });
      const h = new Headers(res.headers);
      Object.entries(CORS).forEach(([k, v]) => h.set(k, v));
      return new Response(res.body, { status: res.status, headers: h });
    } catch (e) {
      return new Response('upstream error: ' + e.message, { status: 502, headers: CORS });
    }
  },
};
