
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/run-exe", (req, res) => {
  const inputStr = req.body.input; // 从网页输入
  const exePath = "TOS-MS.exe"; // ✅ 修改为你真实路径
  const batPath = path.join(__dirname, "run_exe.bat");

  // 构造 .bat 文件内容
  const batContent = `@echo off\r\necho ${inputStr} | "${exePath}"\r\npause`;

  // 写入 .bat 文件
  fs.writeFileSync(batPath, batContent);

  // 用 start 弹出命令行窗口运行 bat
  exec(`start "" "${batPath}"`, (err) => {
    if (err) {
      console.error("运行失败:", err);
      return res.status(500).send("执行失败");
    }
    res.send("✅ 已弹窗运行 EXE，并自动输入参数");
  });
});

app.listen(3000, () => {
  console.log("后端服务运行在 http://localhost:3000");
});
