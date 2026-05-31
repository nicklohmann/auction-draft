import { createRouter, createWebHistory } from 'vue-router'
import DraftBoard from '../views/DraftBoard.vue'
import MyRoster from '../views/MyRoster.vue'

const routes = [
  {
    path: '/',
    name: 'draftboard',
    component: DraftBoard
  },
  {
    path: '/roster',
    name: 'roster',
    component: MyRoster
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router