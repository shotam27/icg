<template>
  <div class="">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    rid: { type: Number, default: 9999 },
    rooms: {
      type: Array,
      default() {
        return []
      },
    },
    matched: {
      type: Boolean,
      default: false,
    },
    myno: { type: Number, default: 0 },
  },
  data() {
    return {
      message: '対戦相手を待っています・・・',
      cardLength: 23,
      init: {
        fields: [
          {
            name: 'Player1',
            cards: false,
          },
          {
            name: '中立',
            cards: [],
          },
          {
            name: 'Player2',
            cards: false,
          },
          {
            name: '追放',
            cards: false,
          },
        ],
        gameVals: {
          pVals: [
            {
              name: '',
              monthIP: 10,
              purseIP: 10,
              selected: 0,
              selectedPlace: 0,
              usingIP: 0,
              phase: 0,
              eFlags: [0, 99, 99],
            },
            {
              name: '',
              monthIP: 10,
              purseIP: 10,
              selected: 0,
              selectedPlace: 0,
              usingIP: 0,
              phase: 0,
              eFlags: [0, 99, 99],
            },
          ],
          logNo: 0,
          gameEndFlag: 0,
        },
      },
    }
  },
  watch: {
    deep: true,
    matched() {
      let cnt = 0
      if (this.myno === 0) {
        cnt++
        console.log('oyadesu')
      }
      if (this.matched === true) {
        cnt++
        console.log('matched')
      }
      if (cnt === 2) {
        this.message = 'ゲームを作成しています・・・'
        this.getNeCards()
        this.$fire.database.ref('rooms/' + this.rid + '/game').set(this.init)
      }
    },
  },
  methods: {
    getNeCards() {
      const newCids = this.difRandoms(this.cardLength, 6)
      for (let i = 0; i <= 5; i++) {
        const newCard = { cid: newCids[i], tired: false }
        this.init.fields[1].cards.push(newCard)
      }
    },
    difRandoms(max, m) {
      const randoms = []
      const times = m - 1
      for (let i = 0; i <= times; i++) {
        while (true) {
          const tmp = Math.floor(Math.random() * max)
          if (!randoms.includes(tmp)) {
            randoms.push(tmp)
            break
          }
        }
      }
      return randoms
    },
  },
}
</script>
