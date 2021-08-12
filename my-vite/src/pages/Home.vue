<template>
  <div>
    <h1>Home</h1>
    <span>{{num}}</span>
    <button @click="increse">add</button>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  setup (props, context) {
    const num = ref(0)
    const increse = () => {
      num.value++
    }
    return {
      num,
      increse
    }
  }
}
</script>