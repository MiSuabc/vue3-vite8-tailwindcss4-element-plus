import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue(),tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      open: true,
      proxy: {
        "/dev": {
          target: "http://192.168.3.71:8001", // 目标服务器地址
          changeOrigin: true, // 允许跨域
          rewrite: (path) => path.replace(/^\/dev/, ""), // 路径重写
        },
      },
      cors: true,
    }
  };
});
