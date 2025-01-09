const yahooBits = {
  target: "https://query1.finance.yahoo.com",
  secure: true,
  changeOrigin: true,
  headers: { "User-Agent": "Mozilla/5.0" },
  pathRewrite: { "^/api/chart": "/v8/finance/chart" }
};

const talkBits = {
  target: "https://text.pollinations.ai",
  secure: true,
  changeOrigin: true,
  pathRewrite: { "^/api/chat": "/openai" },
  headers: {
    origin: "https://text.pollinations.ai",
    referer: "https://text.pollinations.ai/"
  },
  onProxyReq(proxyReq) {
    proxyReq.removeHeader("origin");
    proxyReq.removeHeader("referer");
  }
};

module.exports = {
  "/api/chart": yahooBits,
  "/api/chat": talkBits
};
