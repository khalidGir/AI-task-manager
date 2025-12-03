<template>
  <div id="app">
    <header>
      <h1>AI Task Manager - Vue Frontend</h1>
    </header>
    <main>
      <h2>Your Tasks</h2>
      <div v-if="loading">Loading tasks...</div>
      <div v-else>
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <p>Status: {{ task.completed ? 'Completed' : 'Pending' }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const tasks = ref([])
    const loading = ref(true)

    onMounted(() => {
      // Simulate API call
      setTimeout(() => {
        tasks.value = [
          { id: 1, title: 'Sample Task', description: 'This is a sample task', completed: false },
          { id: 2, title: 'Another Task', description: 'This is another task', completed: true }
        ]
        loading.value = false
      }, 1000)
    })

    return {
      tasks,
      loading
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.task-item {
  border: 1px solid #ccc;
  margin: 10px;
  padding: 15px;
  border-radius: 5px;
  text-align: left;
}
</style>