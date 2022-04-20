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
    rid: { type: Number, default: 0 },
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
    fields: {
      type: Array,
      default() {
        return []
      },
    },
    gamevals: {
      type: Object,
      default() {
        return {}
      },
    },
  },

  data() {
    return {
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
      this.cards = JSON.parse(n)
    },
    myflag(n) {
      let e = []
      try {
        e = this.effects[n[1]][n[2]].efs
      } catch (error) {
        e = [0, 0, 0]
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
            this.pushCard(this.myfid, this.tidstart)
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
      } else if (n[0] >= 20) {
        // 反応系司令

        const c = this.countCardsByKeyword('反応', this.myfid, true)
        if (c === 0) {
          this.fbSet('gameVals/pVals/' + this.opno + '/eFlags/0', 1)
          this.effectEnd()
        } else if (n[0] === 20) {
          this.message =
            '反応持ちを発動できます。しない場合はキャンセルしてください。'
        } else if (n[0] >= 21) {
          this.reactEffectsSorter(e)
        }
      }
    },
  },
  mounted() {
    this.$fire.database.ref('effects').on('value', (snapshot) => {
      this.effects = snapshot.val()
    })
  },
  methods: {
    // 基本操作メソッド
    fbSet(db, setter) {
      this.$fire.database.ref('rooms/' + this.rid + '/game/' + db).set(setter)
    },
    tireCard(fid, pid, tireOrNot) {
      const db = 'fields/' + fid + '/cards/' + pid + '/tired'
      this.fbSet(db, tireOrNot)
    },
    deleteCard(f, p) {
      const fCards = this.fields[f].cards
      fCards.splice(p, 1)
      const db = 'fields/' + f + '/cards'
      this.fbSet(db, fCards)
    },
    pushCard(f, c) {
      let fCards = this.fields[f].cards
      if (fCards === false) {
        fCards = []
      }
      const newCard = { cid: c, tired: true }
      fCards.push(newCard)
      const db = 'fields/' + f + '/cards'
      this.fbSet(db, fCards)
    },
    gainCard(f, c, p) {
      if (f === 1) {
        this.tireCard(1, p, true)
      }
      this.pushCard(this.myfid, c)
    },
    changeMyVals(what, value) {
      this.fbSet('gameVals/pVals/' + this.myno + '/' + what, value)
    },
    changeMyPhase(n) {
      this.changeMyVals('phase', n)
    },
    addMyPhase(n) {
      this.changeMyPhase(this.clphase + n)
    },
    setMyPurse(n) {
      this.fbSet('gameVals/pVals/' + this.myno + '/purseIP', n)
    },
    changeIP(morc, val) {
      if (morc === 0) {
        const n = this.gameVals.pVals[this.myno].monthIP + val
        this.changeMyVals('monthIP', n)
      }
      if (morc === 1) {
        const n = this.gameVals.pVals[this.myno].purseIP + val
        this.changeMyVals('purseIP', n)
      }
    },
    addIP(morc, val) {
      let old = 0
      if (morc === 0) {
        old = this.gameVals.pVals[this.myno].monthIP
      } else {
        old = this.gameVals.pVals[this.myno].purseIP
      }
      this.changeIP(morc, old + val)
    },

    // 以下固有メソッド
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
        } else if (e[0] === 2) {
          // このカードを回復する
          this.eHealSelf()
        } else if (e[0] === 3) {
          // IPe[2]獲得する。
          this.addIP(1, e[2])
          this.effectEnd()
        } else if (e[0] === 4) {
          // 月次IPe[2]獲得する。
          this.addIP(0, e[2])
          this.effectEnd()
        } else if (e[0] === 5) {
          // 中立にe[2]を生成する。
          this.eNeGainCard(e[2])
        } else if (e[0] === 6) {
          this.eKillOtherSpecies(cid)
        }
      }
    },
    reactEffectSorter(e) {
      if (e[0] === 1) {
        // IPe[2]獲得する。
        this.addIP(1, e[2])
        this.effectEnd()
      }
    },
    changeFlag(playerNo, n) {
      this.fbSet('gameVals/pVals/' + playerNo + '/eFlags/0', n)
    },
    phaseIncrement() {
      const n = this.myflag[0] + 1
      this.changeFlag(this.myno, n)
    },
    effectEnd() {
      const n = this.myflag[0]
      if (n >= 21 && n < 30) {
        this.changeFlag(this.myno, 20)
      } else if (n === 20) {
        this.changeFlag(this.opno, 1)
        this.changeFlag(this.myno, 0)
      } else {
        this.changeFlag(this.myno, 0)
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
          }
          if (mycards[i].tired === false) {
            cnt++
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
    // 効果function
    eTire(p) {
      if (p === 1) {
        this.message = '疲労させるカードを選んでください。'
      } else if (p === 2) {
        const pid = this.selected.cardPlace
        this.tireCard(this.opfid, pid, true)
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
            this.tireCard(this.myfid, i, true)
            this.pushCard(this.myfid, this.selected.cardId)
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
          this.tireCard(1, i, false)
        }
        i++
      }
      this.effectEnd()
    },
    eHealSelf() {
      const f = this.fields[this.myfid].cards
      const p = f.length - 1
      this.tireCard(this.myfid, p, false)
      this.effectEnd()
    },
    eNeGainCard(c) {
      const f = this.fields[1].cards
      let there = false
      for (let i = 0; i < f.length; i++) {
        if (f[i].cid === c) {
          there = true
        }
      }
      if (there === false) {
        this.pushCard(1, c)
      }
      this.effectEnd()
    },
    eKillOtherSpecies(c) {
      const field = this.fields[this.myno].cards
      const newField = []
      for (let i = 0; field.length < i; i++) {
        if (field[i].cid === c) {
          newField.push(field[i])
        }
      }
      this.fbSet('fields/' + this.myno + '/cards', newField)
      this.effectEnd()
    },
  },
}
</script>
