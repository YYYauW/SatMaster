<template>
    <div v-if="visible" class="dialog-overlay">
      <div class="dialog-box">
        <h3>Pareto 优化结果</h3>
        <button @click="visible = false">关闭</button>
        <table>
          <thead>
            <tr>
              <th>Index</th>
              <th>ΔTime</th>
              <th>ΔAngle</th>
              <th>Base Time</th>
              <th>Target Time</th>
              <th>Base Roll</th>
              <th>Base Pitch</th>
              <th>Target Roll</th>
              <th>Target Pitch</th>
              <th>Site ID</th>
              <th>Lat</th>
              <th>Lng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in data" :key="idx" :class="{ selected: idx === selectedIndex }" @click="selectedIndex = idx">
              <td>{{ idx }}</td>
              <td>{{ item.TimeDiff }}</td>
              <td>{{ item.AngleDiff }}</td>
              <td>{{ item.RefTime }}</td>
              <td>{{ item.TargetTime }}</td>
              <td>{{ item.RefYaw }}</td>
              <td>{{ item.RefPitch }}</td>
              <td>{{ item.TargetYaw }}</td>
              <td>{{ item.TargetPitch }}</td>
              <td>{{ item.FieldID }}</td>
              <td>{{ item.FieldLat }}</td>
              <td>{{ item.FieldLng }}</td>
            </tr>
          </tbody>
        </table>
  
        <div class="buttons">
          <button @click="showRefResult">展示基准星结果</button>
          <button @click="showTargetResult">展示定标星结果</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import pareto from '@/assets/pareto_export.json'
  import * as Cesium from 'cesium'
  
  const visible = ref(false)
  const data = ref(pareto)
  const selectedIndex = ref(0)
  
  defineExpose({ visible })
  
  const applyBase = () => {
    const item = data.value[selectedIndex.value]
    if (!item) return
  
    const t = Cesium.JulianDate.fromIso8601(item.RefTime)
    window.viewer.clock.currentTime = t
  
    window.setSatelliteAttitude?.(0, item.RefYaw, item.RefPitch)
  
    // 高亮卫星 1（默认 viewer.entities.getById("uax-0")）
    window.viewer.selectedEntity = window.viewer.entities.getById("uax-0")
  }
  
  const applyTarget = () => {
    const item = data.value[selectedIndex.value]
    if (!item) return
  
    const t = Cesium.JulianDate.fromIso8601(item.TargetTime)
    window.viewer.clock.currentTime = t
  
    window.setSatelliteAttitude?.(1, item.TargetYaw, item.TargetPitch)
  
    // 高亮卫星 2（默认 viewer.entities.getById("uax-1")）
    window.viewer.selectedEntity = window.viewer.entities.getById("uax-1")
  }

  const showRefResult = () => {
    const item = data.value[selectedIndex.value]
    if (!item) return

    // 设置场景时间
    const newTime = Cesium.JulianDate.fromIso8601(item.RefTime)
    window.viewer.clock.currentTime = newTime

    // 设置卫星 1 姿态（调用 App.vue 中挂载的方法）
    window.setSatelliteAttitude?.(0, item.RefYaw, item.RefPitch)

    // 飞到卫星 1 当前所在位置
    const entity = window.viewer.entities.getById("uax-0") // 卫星 1 id
    if (!entity) return

    const pos = entity.position?.getValue(window.viewer.clock.currentTime)
    if (!pos) return

    window.viewer.camera.flyTo({
        destination: pos,
        duration: 2,
    })
  }

  </script>
  
  <style scoped>
  .dialog-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .dialog-box {
    background: white;
    padding: 20px;
    width: 90%;
    max-height: 80%;
    overflow-y: auto;
    border-radius: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 6px;
    border: 1px solid #ddd;
    font-size: 12px;
  }
  tr.selected {
    background-color: #d6eaff;
  }
  .buttons {
    margin-top: 10px;
  }
  .buttons button {
    margin-right: 10px;
  }
  </style>
  