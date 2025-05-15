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
                  // 从查询参数获取要运行的exe文件名
                  const exeName = req.query.exe || "TOS-MS.exe";
                  const runAsAdmin = req.query.admin === "true";
  
                  // 获取exe文件路径
                  const exePath = path.resolve(__dirname, exeName);
  
                  // 输出调试信息
                  console.log("运行信息:", {
                    当前工作目录: process.cwd(),
                    目标程序: exeName,
                    完整路径: exePath,
                    管理员权限: runAsAdmin,
                  });
  
                  // 检查文件是否存在
                  if (!fs.existsSync(exePath)) {
                    console.error(`文件不存在: ${exePath}`);
                    return res.error({
                      message: `找不到执行文件: ${exeName}`,
                      code: 404,
                    });
                  }
  
                  // 构建命令
                  let command;
                  if (runAsAdmin) {
                    // 使用 start 命令在新窗口中以管理员权限运行
                    command = `start powershell.exe -NoExit -Command "Start-Process '${exePath}' -Verb RunAs; Read-Host 'Press Enter to exit'"`;
                  } else {
                    // 使用 start 命令在新窗口中运行，并保持窗口打开
                    command = `start cmd.exe /K "echo 正在运行 ${exeName}... && "${exePath}" && echo. && echo 程序已退出，按任意键关闭窗口"`;
                  }
  
                  console.log("执行命令:", command);
  
                  // 执行命令
                  const child = spawn(command, [], {
                    shell: true,
                    cwd: path.dirname(exePath),
                    env: { ...process.env },
                    windowsHide: false,
                    detached: true, // 使子进程独立运行
                  });
  
                  // 立即返回成功响应
                  res.success({
                    message: "正在启动程序，请查看新打开的窗口",
                    command: command,
                  });
                } catch (err) {
                  console.error("执行过程发生异常:", err);
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
