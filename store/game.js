import { defineStore } from 'pinia'

export const useGameStore = defineStore({
  // ストアの名前
  id: 'game',
  // 初期状態を返す関数
  state: () => ({
    counter: 4,
    selected: [],
  }),
  getters: {
    doubleCount() {
      return this.counter * 2
    },
    // ゲッターの中で他のゲッターを使う
    doubleCountPlusOne() {
      return this.doubleCount * 2 + 1
    },
  },
  actions: {
    reset() {
      // `this` はストアのインスタンス
      this.counter = 3
    },
    getSelected(newVal) {
      this.selected = newVal
    }
  },
})