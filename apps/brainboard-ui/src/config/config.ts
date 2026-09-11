const isDevelopment = process.env.ENVIROMENT === "DEV";

const WS_URL = isDevelopment
  ? "ws://localhost:8080"
  : "wss://ws.brainboard.anshumancdx.xyz";

const HTTP_BACKEND_URL = isDevelopment
  ? "http://localhost:8000"
  : "https://brainboard.anshumancdx.xyz";

export { WS_URL, HTTP_BACKEND_URL };