<!-- <template>
  <BasePanel title="操作指南">
    <div class="base-tutorial">
      <div class="params-item" v-for="{ value, label } in list">
        <span class="label">{{ label }}:</span>
        <span class="value">{{ value }}</span>
      </div>
    </div>
  </BasePanel>
</template>
<script setup lang="ts">
  import BasePanel from "@/components/BasePanel.vue"

  const list = [
    {
      label: "W键",
      value: "升起",
    },
    {
      label: "S键",
      value: "俯冲",
    },
    {
      label: "A键",
      value: "左转",
    },
    {
      label: "D键",
      value: "右转",
    },
    {
      label: "Q键",
      value: "加速",
    },
    {
      label: "E键",
      value: "减速",
    },
  ]
</script>
<style lang="scss" scoped>
  .base-tutorial {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(2, 1fr);
    padding-top: 4px;

    .params-item {
      display: flex;
      align-items: center;
      font-size: 14px;

      .label {
        margin-right: 4px;
        padding: 2px 10px;
        font-size: 12px;
        background-color: #f0f2f3;
      }

      .value {
        font-size: 12px;
      }
    }
  }
</style> -->
<template>
  <div class="tutorial-box">
    <!-- 原有内容不变 -->
    <h3>操作指南</h3>
    <div class="row"><span>W：</span><span>升起</span></div>
    <div class="row"><span>S：</span><span>俯冲</span></div>
    <div class="row"><span>A：</span><span>左转</span></div>
    <div class="row"><span>D：</span><span>右转</span></div>
    <div class="row"><span>Q：</span><span>加速</span></div>
    <div class="row"><span>E：</span><span>减速</span></div>
  </div>
</template>

<style scoped>
.tutorial-box {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 0 10px #00000044;
  font-size: 14px;
  color: #000;
}
.row {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}
</style>
