<template>
  <div class="panel">
    <h3 class="title">{{ title || "实时数据" }}</h3>
    <div class="item">
      <label>纬度:</label>
      <span>{{ data.lat.toFixed(3) }}°</span>
    </div>
    <div class="item">
      <label>经度:</label>
      <span>{{ data.lng.toFixed(3) }}°</span>
    </div>
    <div class="item">
      <label>海拔:</label>
      <span>{{ data.altitude.toFixed(3) }}</span>
    </div>
    <div class="item">
      <label>航向角:</label>
      <span>{{ data.heading.toFixed(3) }}</span>
    </div>
    <div class="item">
      <label>俯视角:</label>
      <span>{{ data.pitch.toFixed(3) }}</span>
    </div>
    <div class="item">
      <label>翻滚角:</label>
      <span>{{ data.roll.toFixed(3) }}</span>
    </div>
    <div class="item">
      <label>航速:</label>
      <span>{{ data.speed.toFixed(0) }}km/h</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any,
  title?: string
}>()
</script>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #ccc;
  padding: 10px;
}
.title {
  font-weight: bold;
  margin-bottom: 6px;
  color: #0078ff;
}
.item {
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
}
.item label {
  font-weight: bold;
  color: #333;
}
</style>
