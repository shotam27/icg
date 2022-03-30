<template>
  <div class="">
    <div class="">
      {{ myflag }}
    </div>

    <div class="c-3 flex justify-center" @click="phaseIncrement()">送信</div>
    <div class="c-3 flex justify-center" @click="effectEnd()">キャンセル</div>
  </div>
</template>

<script>
export default {
  props: {
    selected: {
      type: Object,
      default() {
        return {
          fieldId: 0,
          cardId: 0,
          cardPlace: 0,
          cardName: '',
          usingIP: 0,
          keyword: {
            placeId: 99,
            name: '',
            text: '',
          },
        }
      },
    },
    myno: { type: Number, default: 1 },
    opno: { type: Number, default: 0 },
    myfid: { type: Number, default: 2 },
    opfid: { type: Number, default: 0 },
    myflag: {
      type: Array,
      default() {
        return [0, 99, 99]
      },
    },
  },

  data() {
    return {
      cards: [],
      fields: [],
      gameVals: [],
      effects: [],
      eFlags: [],

      message: '',
      phase: 0,
    }
  },
  watch: {
    deep: true,
    myflag(n) {
      let e = []
      const f = this.fields[this.myfid].cards
      try {
        e = this.effects[n[1]][n[2]].efs
      } catch (error) {
        e = [0, 0]
      }
      if (n[0] > 9) {
        // 疲労発動系
        if (e[0] === 1) {
          // 一匹疲労させる。
          this.eTire(n[0])
        } else if (e[0] === 2) {
          // 同種を一枚疲労させ、
          // 同種を一枚生成する。
          this.eCreate(n[0])
        }
      } else if (n[0] === 10) {
        // 獲得時系
        let i = 0
        const arr = this.getCardCountArray(this.myfid)
        console.log(arr)
        // 総当たり
        while (i <= f.length) {
          const cid = f[i].cid
          let ii = 0
          while (ii <= this.cards[cid].effects.length) {
            if (this.cards[cid].effects[ii].count <= arr[i]) {
              this.gainEffectsSorter(10, cid, ii)
            }
            ii++
          }
          i++
        }
      }
    },
  },
  mounted() {
    this.$fire.database.ref('fields').on('value', (snapshot) => {
      this.fields = snapshot.val()
    })
    this.$fire.database.ref('cards').on('value', (snapshot) => {
      this.cards = snapshot.val()
    })
    this.$fire.database.ref('gameVals').on('value', (snapshot) => {
      this.gameVals = snapshot.val()
    })
    this.$fire.database
      .ref('gameVals/pVals/0/eFlags')
      .on('value', (snapshot) => {
        this.eFlags[0] = snapshot.val()
      })
    this.$fire.database
      .ref('gameVals/pVals/1/eFlags')
      .on('value', (snapshot) => {
        this.eFlags[1] = snapshot.val()
      })
    this.$fire.database.ref('effects').on('value', (snapshot) => {
      this.effects = snapshot.val()
    })
  },
  methods: {
    gainEffectsSorter(phase, cid, eid) {
      const n = [phase, cid, eid]
      let e = []
      try {
        e = this.effects[n[1]][n[2]].efs
      } catch (error) {
        e = [0, 0]
      }
      if (e[1] === 2) {
        if (e[0] === 1) {
          // 一匹疲労させる。
          this.eHealNeSelf(cid)
        }
      }
    },
    phaseIncrement() {
      const n = this.myflag[0] + 1
      this.$fire.database
        .ref('gameVals/pVals/' + this.myno + '/eFlags/0')
        .set(n)
    },
    effectEnd() {
      this.$fire.database
        .ref('gameVals/pVals/' + this.myno + '/eFlags/0')
        .set(0)
    },
    getCardCountArray(fid) {
      const cards = this.fields[fid].cards
      let i = 0
      let arr = {}
      const cnt = {}
      while (i <= cards.length) {
        const c = cards[i].cid
        arr = arr.concat(c)
        if (arr.includes(c)) {
          cnt[c]++
        } else {
          cnt[c] = 1
        }
        i++
      }
      console.log(cnt)
      return cnt
    },
    tire(fid, pid, tireOrHeal) {
      this.$fire.database
        .ref('fields/' + fid + '/cards/' + pid + '/tired')
        .set(tireOrHeal)
    },
    create(fid, ncid) {
      const newCard = { cid: ncid, tired: true }
      const newCards = this.fields[fid].cards.concat(newCard)
      this.$fire.database.ref('fields/' + fid + '/cards').set(newCards)
    },
    // 効果function
    eTire(p) {
      if (p === 1) {
        this.message = '疲労させるカードを選んでください。'
      }
      if (p === 2) {
        const pid = this.selected.cardPlace
        this.tire(this.opfid, pid, true)
        this.message = ''
        this.effectEnd()
      }
    },
    eCreate(p) {
      if (p === 1) {
        const f = this.fields[this.myfid].cards
        let i = 0
        while (i <= f.length) {
          if (f[i].tired === false && f[i].cid === this.selected.cardId) {
            this.tire(this.myfid, i, true)
            this.create(this.myfid, this.selected.cardId)
            break
          }
          i++
        }
        this.effectEnd()
      }
    },
    eHealNeSelf(cid) {
      const f = this.fields[1].cards
      let i = 0
      while (i <= f.length) {
        if (f[i].cid === cid) {
          this.tire(1, i, false)
        }
        i++
      }
    },
  },
}
</script>
