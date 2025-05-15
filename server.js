const express = require("express")
const cors = require("cors")
const path = require("path")
const { execFile } = require("child_process")

const app = express()
app.use(cors())
app.use(express.json())
// await axios.post("http://localhost:3000/api/run-exe")

app.post("/api/run-exe", (req, res) => {
  const exePath = path.join(__dirname, "TOS-MS.exe")  //

  execFile(exePath, args, (err, stdout, stderr) => {
    if (err) {
      console.error("运行失败:", err)
      return res.status(500).json({ error: err.message })
    }
    res.json({ output: stdout })
  })
})

app.listen(3001, () => {
  console.log("✅ 后端已启动")
})
