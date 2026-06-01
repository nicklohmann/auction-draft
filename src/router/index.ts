import { createRouter, createWebHistory } from 'vue-router'
import DraftBoard from '../views/DraftBoard.vue'
import MyRoster from '../views/MyRoster.vue'
import DraftLog from '../views/DraftLog.vue'

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
  },
  {
    path: '/log',
    name: 'draftlog',
    component: DraftLog
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
