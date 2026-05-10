// Set IS_PROD to true and update the URL below when deploying
const IS_PROD = false;
const server = IS_PROD
  ? "https://your-backend-url.com"
  : "http://localhost:8000";

export default server;
