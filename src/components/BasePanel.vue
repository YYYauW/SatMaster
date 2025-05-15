<template>
  <div class="base-panel">
    <div class="panel-header">
      <span class="panel-header-title">{{ title }}</span>
    </div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
  interface PropsType {
    title: string
  }
  const props = defineProps<PropsType>()
</script>
<style lang="scss" scoped>
  .base-panel {
    width: 280px;
    padding: 0 10px 10px;
    background-color: #fff;

    .panel-header {
      display: flex;
      align-items: center;
      width: 200px;
      height: 34px;

      &::before {
        position: absolute;
        width: 3px;
        height: 16px;
        background-color: #1083e6;
        border-radius: 20px;
        content: "";
      }

      .panel-header-title {
        padding-left: 10px;
        font-weight: bold;
        font-size: 14px;
      }
    }
  }
</style>
