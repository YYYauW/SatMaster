<template>
  <div class="right-panel">
    <h3>优化参数配置</h3>
    <p v-if="combinedResult" class="result">
      参数组合结果：{{ combinedResult }}
    </p>
    <label>基准星参数：</label>
    <input type="text" v-model="satA" placeholder="路径如 D:\\xxx\\SatA.o" />

    <label>定标星参数：</label>
    <input type="text" v-model="satB" placeholder="路径如 D:\\xxx\\SatB.o" />

    <label>定标场位置：</label>
    <input type="text" v-model="calibField" placeholder="路径如 D:\\xxx\\field.t" />

    <label>种群规模：</label>
    <input type="number" v-model="populationSize" placeholder="如 40" />

    <label>迭代次数：</label>
    <input type="number" v-model="iterations" placeholder="如 400" />

    <button @click="submitParams">提交参数</button>
     <!-- ✅ 显示组合后的参数 -->
     <div class="result-box" v-if="combinedResult">
      <p>组合结果：</p>
      <textarea readonly rows="3">{{ combinedResult }}</textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['submit-params'])

const satA = ref('D:\\Conda_data\\MF-UAV-master\\src\\assets\\input\\SatAToTLE.o')
const satB = ref('D:\\Conda_data\\MF-UAV-master\\src\\assets\\input\\SatBToTLE.o')
const calibField = ref('D:\\Conda_data\\MF-UAV-master\\src\\assets\input\\Steady-statePt.t')
const populationSize = ref(40)
const iterations = ref(400)
const combinedResult = ref('')

const submitParams = () => {
  combinedResult.value = `"${satA.value}","${satB.value}","${calibField.value}","${populationSize.value}","${iterations.value}"`
  alert('参数已组合完成！')
  emit('submit-params', combinedResult.value)
}

</script>

<style scoped>
.right-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  border-radius: 6px;
  
}
label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  box-sizing: border-box;
}
button {
  margin-top: 15px;
  padding: 8px 12px;
  width: 100%;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
