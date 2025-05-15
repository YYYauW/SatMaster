<template>
    <div class="dialog-overlay" v-if="visible">
      <div class="dialog-content">
        <h3>Pareto 优化结果</h3>
        
        <!-- 操作按钮 -->
        <div class="button-row">
          <button @click="showRefResult">展示基准星结果</button>
          <button @click="showTargetResult">展示定标星结果</button>
          <button @click="$emit('close')">关闭</button>
        </div>
  
        <!-- 结果表格 -->
        <table class="result-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>

          </thead>
          <tbody>
            
            <tr 
              v-for="(item, index) in data" 
              :key="index"
              :class="{ selected: index === selectedIndex }"
              @click="() => { selectedIndex = index; emit('update:selected', item) }"
              >
              <td v-for="col in columns" :key="col">{{ item[col] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
  applyParetoResult: (index: 0 | 1, time: string, roll: number, pitch: number) => void
  clearTrajectory: (index: 0 | 1) => void
}>()


  import { ref, onMounted } from "vue"
  import rawData from "@/assets/pareto_export.json"
  import * as Cesium from "cesium"

  const emit = defineEmits(["update:selected", "close"])

  const visible = ref(false)
  const selectedRow = ref<any>(null)


  const show = () => {
    visible.value = true
  }


  defineExpose({ show })  // ✅ 
  
  const selectedIndex = ref<number | null>(null)
  const data = ref<any[]>([])
  const columns = [
    "TimeDiff", "AngleDiff",
    "RefTime", "TargetTime",
    "RefYaw", "RefPitch",
    "TargetYaw", "TargetPitch",
    "FieldID", "FieldLat", "FieldLng"
  ]
  
  // ✅ 加载 JSON 数据
  onMounted(() => {
    data.value = rawData
  })



  const toValidIso8601 = (str: string): string => {
  if (!str.includes("T")) {
    return str.replace(" ", "T") + (str.endsWith("Z") ? "" : "Z")
  }
  return str
}



  const showRefResult = () => {
    if (selectedIndex.value === null) return
    const row = data.value[selectedIndex.value]
    if (!row) return
    console.log("点击了 展示基准星结果")
    alert("点击了基准星")
    const time = Cesium.JulianDate.fromIso8601(toValidIso8601(row.RefTime))

    const toRadians = Cesium.Math.toRadians
    props.clearTrajectory(0)
    // ✅ 设置场景时间
    window.viewer.clock.currentTime = time
  
    // ✅ 设置卫星一姿态
    //window.setSatelliteAttitude(0, toRadians(row.RefYaw), toRadians(row.RefPitch))
    props.applyParetoResult(0, row.RefTime,  toRadians(row.RefYaw),  toRadians(row.RefYaw))
    window.viewer.selectedEntity = window.viewer.entities.getById("uax-0")  // or "uax-1"

    // ✅ 镜头飞到卫星一
    // const entity = window.viewer.entities.getById("uax-0")
    // const pos = entity?.position?.getValue(window.viewer.clock.currentTime)
    // if (pos) {
    //   window.viewer.camera.flyTo({
    //     destination: pos,
    //     duration: 1.5,
    //   })
    // }
    emit("close")
    visible.value = false

  }
  
  const showTargetResult = () => {
    if (selectedIndex.value === null) return
    const row = data.value[selectedIndex.value]
    if (!row) return
    console.log("✅ 点击了展示定标星")
    alert("点击了定标星")
    // ✅ 设置场景时间
    const time = Cesium.JulianDate.fromIso8601(toValidIso8601(row.RefTime))

    window.viewer.clock.currentTime = time
    const toRadians = Cesium.Math.toRadians

    props.clearTrajectory(1)
    // ✅ 设置卫星二姿态
    window.setSatelliteAttitude(1, toRadians(row.TargetYaw), toRadians(row.TargetPitch))
    window.viewer.selectedEntity = window.viewer.entities.getById("uax-1")  
    
    emit("close")
    visible.value = false
  }
  </script>
  
  <style scoped>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
  }
  
  .dialog-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 80vw;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .button-row {
    margin-bottom: 10px;
    display: flex;
    gap: 10px;
  }
  
  .result-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .result-table th,
  .result-table td {
    border: 1px solid #ccc;
    padding: 6px 10px;
    text-align: center;
    font-size: 14px;
  }
  
  .result-table tr:hover {
    background-color: #f0f0f0;
    cursor: pointer;
  }
  
  .selected {
    background-color: #cce5ff !important;
  }


  .result-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px;
  border-radius: 8px;
  z-index: 10000;
  font-size: 12px;
}
.result-panel h4 {
  margin-top: 0;
}


  </style>
  