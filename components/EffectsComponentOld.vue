<template>
  <div class="">
    <div class="text-xs mt-2">効果フラグ:{{ myflag }}</div>

    <div class="">
      {{ message }}
    </div>

    <div class="c-3 flex justify-center mt-2" @click="phaseIncrement()">
      送信
    </div>
    <div class="c-3 flex justify-center mt-2" @click="effectEnd()">
      キャンセル
    </div>
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
    myno: { type: Number, default: 0 },
    opno: { type: Number, default: 1 },
    myfid: { type: Number, default: 0 },
    opfid: { type: Number, default: 2 },
    myflag: {
      type: Array,
      default() {
        return [0, 99, 99]
      },
    },
    cardsjson: {
      type: String,
      default: '',
    },
    tidstart: { type: Number, default: 99 },
  },

  data() {
    return {
      fields: [],
      gameVals: [],
      effects: [],
      eFlags: [],
      cards: [],
      message: '',
      phase: 0,
    }
  },
  watch: {
    deep: true,
    cardsjson(n) {
      console.log('parse')
      this.cards = JSON.parse(n)
      console.log(this.cards)
    },
    myflag(n) {
      let e = []
      try {
        e = this.effects[n[1]][n[2]].efs
      } catch (error) {
        e = [0, 0]
      }
      if (n[0] < 10) {
        // 疲労発動系
        if (e[0] === 1) {
          // 一匹疲労させる。
          this.eTire(n[0])
        } else if (e[0] === 2) {
          // 同種を一枚疲労させ、
          // 同種を一枚生成する。
          this.eCreate(n[0])
        } else if (e[0] === 3) {
          // フントークンを生成する。
          if (n[0] === 1) {
            this.create(this.myfid, this.tidstart)
            this.effectEnd()
          }
        }
      } else if (n[0] === 10) {
        // 獲得時系司令
        const arr = this.getCardCountArray(this.myfid)
        const cid = n[1]
        // 効果総当たり
        let ii = 0
        while (ii < this.cards[cid].effects.length) {
          if (this.cards[cid].effects[ii].count <= arr[cid]) {
            this.gainEffectsSorter(10, cid, ii)
          }
          ii++
        }
        this.effectEnd()
      } else if (n[0] === 20) {
        // 反応系司令

        const c = this.countCardsByKeyword('反応', this.myfid, true)
        console.log(c)
        if (c === 0) {
          this.$fire.database
            .ref('gameVals/pVals/' + this.opno + '/eFlags/0')
            .set(1)
          this.effectEnd()
        } else {
          this.message =
            '反応持ちを発動できます。しない場合はキャンセルしてください。'
        }
      }
    },
  },
  mounted() {
    this.$fire.database.ref('fields').on('value', (snapshot) => {
      this.fields = snapshot.val()
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
          // 中立にある同種を回復する
          this.eHealNeSelf(cid)
        }
        if (e[0] === 2) {
          // このカードを回復する
          this.eHealSelf()
        }
        if (e[0] === 3) {
          // IPe[2]獲得する。
          this.purseIpAdd(this.myno, e[2])
        }
        if (e[0] === 4) {
          // 月次IPe[2]獲得する。
          this.monthIpAdd(this.myno, e[2])
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
      const n = this.myflag[0]
      if (n >= 21 && n < 30) {
        this.$fire.database
          .ref('gameVals/pVals/' + this.myno + '/eFlags/0')
          .set(20)
      } else if (n === 20) {
        this.$fire.database
          .ref('gameVals/pVals/' + this.opno + '/eFlags/0')
          .set(1)
        this.$fire.database
          .ref('gameVals/pVals/' + this.myno + '/eFlags/0')
          .set(0)
      } else {
        this.$fire.database
          .ref('gameVals/pVals/' + this.myno + '/eFlags/0')
          .set(0)
      }
    },
    getCardCountArray(fid) {
      const cards = this.fields[fid].cards
      let i = 0
      const arr = []
      const cnt = []
      while (i < cards.length) {
        const c = cards[i].cid
        if (arr.includes(c)) {
          cnt[c]++
        } else {
          cnt[c] = 1
        }
        arr.push(c)
        i++
      }
      return cnt
    },
    countCardsByKeyword(keyword, fid, notTiredOnly) {
      const mycards = this.fields[fid].cards
      const cc = this.getCardCountArray(fid)
      let r = 0
      let i = 0
      let ii = 0
      while (i < mycards.length) {
        const cid = mycards[i].cid
        const effects = this.cards[cid].effects
        while (ii < effects.length) {
          let cnt = 0
          if (
            effects[ii].count <= cc[cid] &&
            effects[ii].keywords[0] === keyword
          ) {
            cnt++
            console.log('cnt1')
            console.log(cnt)
          }
          if (mycards[i].tired === false) {
            cnt++
            console.log('cnt2')
            console.log(cnt)
          }
          let ckCnt = 1
          if (notTiredOnly === true) {
            ckCnt = 2
          }
          if (ckCnt <= cnt) {
            r++
          }
          ii++
        }
        i++
      }
      return r
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
    purseIpAdd(userNo, n) {
      const newVal = this.gameVals.pVals[userNo].purseIP + n
      this.$fire.database
        .ref('gameVals/pVals/' + userNo + '/purseIP')
        .set(newVal)
    },
    monthIpAdd(userNo, n) {
      const newVal = this.gameVals.pVals[userNo].monthIP + n
      this.$fire.database
        .ref('gameVals/pVals/' + userNo + '/monthIP')
        .set(newVal)
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
      while (i < f.length) {
        if (f[i].cid === cid) {
          this.tire(1, i, false)
        }
        i++
      }
      this.effectEnd()
    },
    eHealSelf() {
      const f = this.fields[this.myfid].cards
      const p = f.length - 1
      this.tire(this.myfid, p, false)
    },
  },
}
</script>
