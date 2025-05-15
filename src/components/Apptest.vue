<template>
    <div class="control">
      <BaseFlightParams :data="flightParams1" title="卫星一" />
      <BaseMapPreview :data="flightParams1" title="卫星一" />
      <BaseFlightParams :data="flightParams2" title="卫星二" />
      <BaseMapPreview :data="flightParams2" title="卫星二" />
      <BasePanel :data1="flightParams1" :data2="flightParams2" />
  
      <div class="tutorial-container">
        <BaseTutorial />
      </div>
  
      <!-- ✅ Pareto 触发按钮 -->
      <button @click="paretoRef?.show()" class="pareto-btn">展示Pareto优化结果</button>
  
      <!-- ✅ Pareto 弹窗组件 -->
      <ParetoDialog ref="paretoRef" @update:selected="selectedParetoRow = $event" />
  
    </div>
  
  <!-- 右侧信息展示框 -->
  <div class="result-panel" v-if="selectedParetoRow">
    <h4>选中结果信息</h4>
    <p>时间差: {{ selectedParetoRow.TimeDiff }}</p>
    <p>角度差: {{ selectedParetoRow.AngleDiff }}</p>
    <p>基准星观测时刻: {{ selectedParetoRow.RefTime }}</p>
    <p>目标星观测时刻: {{ selectedParetoRow.TargetTime }}</p>
    <p>基准星姿态: Roll={{ selectedParetoRow.RefYaw }}, Pitch={{ selectedParetoRow.RefPitch }}</p>
    <p>目标星姿态: Roll={{ selectedParetoRow.TargetYaw }}, Pitch={{ selectedParetoRow.TargetPitch }}</p>
    <p>定标场编号: {{ selectedParetoRow.FieldID }}</p>
    <p>经纬度: ({{ selectedParetoRow.FieldLat }}, {{ selectedParetoRow.FieldLng }})</p>
  </div>
  
  
  
  </template>
  
  
  <script setup lang="ts">
  import * as Cesium from "cesium"
  import { useCesium } from "@/hooks/useCesium"
  import { useUav } from "@/hooks/useSat"
  import BaseFlightParams from "@/components/BaseFlightParams.vue"
  import BaseMapPreview from "@/components/BaseMapPreview.vue"
  import BasePanel from "@/components/BasePanel.vue"
  import BaseTutorial from "@/components/BaseTutorial.vue"
  import ParetoDialog from "@/components/ParetoDialog.vue"
  import { ref, onMounted } from "vue"
  
  const paretoRef = ref()
  const selectedParetoRow = ref<any | null>(null)
  
  
  declare global {
    interface Window {
      setSatelliteAttitude: (index: 0 | 1, roll: number, pitch: number) => void;
      viewer: Cesium.Viewer;
      flightParams: any;
      flightParams2: any;
    }
  }
  
  const paretoVisible = ref(false)
  
  const app = document.querySelector("#app") as HTMLElement
  const { viewer } = useCesium(app)
  const { flightParams: flightParams1, flightParams2 } = useUav(viewer, "/models/satellite_model.gltf", "sat1", 1)
  
  // ✅ 全局挂载
  onMounted(() => {
    window.viewer = viewer
    window.setSatelliteAttitude = (index: 0 | 1, roll: number, pitch: number) => {
      if (index === 0) {
        window.flightParams.roll = roll
        window.flightParams.pitch = pitch
      } else {
        window.flightParams2.roll = roll
        window.flightParams2.pitch = pitch
      }
    }
  
    window.flightParams = flightParams1
    window.flightParams2 = flightParams2
  })
  </script>
  
  
  
  
  <style scoped>
  .control {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 9999;
    display: grid;
    grid-gap: 10px;
  }
  
  .tutorial-container {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 9999;
  }
  
  .pareto-trigger {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 9999;
  }
  .pareto-btn {
    margin-top: 10px;
    padding: 6px 12px;
    font-size: 14px;
    background: #0077ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .pareto-btn:hover {
    background-color: #005dc1;
  }
  
  .result-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 300px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px;
    border-radius: 8px;
    z-index: 99999;
    font-size: 12px;
  }
  .result-panel h4 {
    margin-top: 0;
  }
  
  </style>
  