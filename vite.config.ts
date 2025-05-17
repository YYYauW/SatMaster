import { fileURLToPath, URL } from "node:url"
import { createHtmlPlugin } from "vite-plugin-html"
import { defineConfig } from "vite"
import { loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import cesium from "vite-plugin-cesium"

import { createAdvanceApi } from "vite-advance-api";

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
const env = (mode: string, key: string) => loadEnv(mode, process.cwd())[key]
export default ({ mode }: any) => {
  return defineConfig({
    base: "./",
    build: {
      outDir: "./docs",
    },
    plugins: [
      vue(),
      vueJsx(),
      cesium(),
      createHtmlPlugin({
        inject: {
          data: {
            title: env(mode, "VITE_NAME"),
          },
        },
      }),
      createAdvanceApi({
        setup: ({ _, axios, uuid, defineRoutes }) => [
          {
            type: "direct",
            base: "/aaa",
            setup: (router) => {

              // 运行指定的exe文件
              router.get("startexe", async (req, res) => {
                try {
                  const exeName = req.query.exe || "TOS-MS.exe";
                  const inputStr = req.query.input || "";  // ← 前端传来的字符串参数
                  const exePath = path.resolve(__dirname, exeName);
                  const exeDir = path.dirname(exePath);
                  const batPath = path.resolve(__dirname, "run_exe.bat");
              
                  // 检查exe是否存在
                  if (!fs.existsSync(exePath)) {
                    return res.error({
                      message: `找不到执行文件: ${exeName}`,
                      code: 404,
                    });
                  }
              
                  // 生成 .bat 内容
                  const batContent = `@echo off\r\necho ${inputStr} | "${exePath}"\r\npause`;
              
                  fs.writeFileSync(batPath, batContent);
              
                  // 构造 start 命令，打开.bat（弹窗）
                  const command = `start "" "${batPath}"`;
              
                  console.log("执行命令:", command);
              
                  spawn(command, {
                    shell: true,
                    cwd: exeDir,
                    detached: true,
                    windowsHide: false,
                  });
              
                  res.success({
                    message: "已在新窗口运行 exe 并自动输入参数",
                    command,
                  });
                } catch (err) {
                  console.error("执行异常:", err);
                  res.error({
                    message: `系统错误: ${err.message}`,
                    code: 500,
                    details: err.stack,
                  });
                }
              });
              
              // 列出可用的exe文件
              router.get("listexe", async (req, res) => {
                try {
                  const files = fs.readdirSync(__dirname);
                  const exeFiles = files.filter((file) =>
                    file.toLowerCase().endsWith(".exe")
                  );
                  res.success({
                    message: "获取成功",
                    files: exeFiles,
                  });
                } catch (err) {
                  res.error({
                    message: `获取文件列表失败: ${err.message}`,
                    code: 500,
                  });
                }
              });


            },
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      hmr: true,
      host: "0.0.0.0", 
      
      proxy: { "/api": {
        target: "http://localhost:3000", // ✅ 你后端服务的地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      }
      }
    },
  })
}
