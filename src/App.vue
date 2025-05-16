/**
 * @file App.vue
 * @description Main application file for satellite trajectory visualization, control, and Pareto result demonstration.
 * @author Wei Yao
 * @email yyyauw@whu.edu.cn
 * @date 2025-04-27
 * @license MIT
 */



<template>
  <div class="control">
    
    <!-- <BaseFlightParams :data="flightParams1" title="卫星一" />
    <BaseMapPreview :data="flightParams1" title="卫星一" />
    <BaseFlightParams :data="flightParams2" title="卫星二" />
    <BaseMapPreview :data="flightParams2" title="卫星二" /> -->

        <!-- 左侧面板 -->
    <BasePanel class="absolute left-0 top-0 w-1/4 h-full bg-white text-black z-10 shadow-md overflow-y-auto p-4">
      <BaseFlightParams v-if="flightParams1" :data="flightParams1" title="卫星一" />
      <BaseMapPreview  v-if="flightParams1" :data="flightParams1" title="卫星一" />
      <BaseFlightParams v-if="flightParams2" :data="flightParams2" title="卫星二" />
      <BaseMapPreview  v-if="flightParams2" :data="flightParams2" title="卫星二" />

  

    </BasePanel>
    <BasePanel :data1="flightParams1" :data2="flightParams2" title="卫星控制面板" />

    <div class="tutorial-container">
      <BaseTutorial />
    </div>

    <!-- ✅ Pareto 触发按钮 -->
    <button @click="paretoRef?.show()" class="pareto-btn">展示Pareto优化结果</button>

    <!-- ✅ Pareto 弹窗组件 -->
    <ParetoDialog 
      ref="paretoRef" 
      @update:selected="selectedParetoRow = $event" 
      @close="paretoVisible = false"
      :applyParetoResult="setSatelliteAttitude"
      :clearTrajectory="clearTrajectory"
    />


    <div>
      <button @click="runExe">运行EXE</button>
    </div>


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

<div id="app">
    <!-- 原页面内容 -->
    <RightInputPanel @submit-params="handleParamSubmit" />
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
import RightInputPanel from '@/components/RightInputPanel.vue'


const handleParamSubmit = (paramString: string) => {
  console.log('提交的参数为:', paramString)
}



const paretoRef = ref()
const selectedParetoRow = ref<any | null>(null)
const paretoVisible = ref(false)


import axios from "axios"
const output = ref("")


const setSatelliteAttitude = (index: 0 | 1, time: string, roll: number, pitch: number) => {
  window.setSatelliteAttitude(index, roll, pitch)
}

// ✅ 全局暴露用
declare global {
  interface Window {
    setSatelliteAttitude: (index: 0 | 1, roll: number, pitch: number) => void;
    viewer: Cesium.Viewer;
    flightParams: any;
    flightParams2: any;
  }
}

const app = document.querySelector("#app") as HTMLElement
const flightParams1 = ref()
const flightParams2 = ref()
const applyParetoResult = ref()
const clearTrajectory = ref()

const paramConfig = ref(null)


const runExe = async () => {
  try {
    const res = await axios.get("/api/aaa/startexe")
    console.log(res);
    
    output.value = res.data.output
  } catch (err) {
    output.value = "运行失败: " + err.message
  }
}

const init = async () => {
  const { viewer } = await useCesium(app)
  const result = useUav(viewer, "/models/satellite_model.gltf", "sat1", 1)
  flightParams1.value = result.flightParams
  flightParams2.value = result.flightParams2
  applyParetoResult.value = result.applyParetoResult
  clearTrajectory.value = result.clearTrajectory

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

  window.flightParams = flightParams1.value
  window.flightParams2 = flightParams2.value
}

onMounted(() => {
  init()
})



const trigerClick = ()=> {
  paretoRef?.show()
}
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
  top: 300px;
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
