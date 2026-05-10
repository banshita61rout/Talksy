const IS_PROD = true;
const server = IS_PROD
  ? "https://your-backend-https://your-render-backend-url.onrender.com."
  : "http://localhost:8000";

export default server;
