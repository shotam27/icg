<template>
  <div class="">
    <div class="px-1 mt-4 text-xs">
      {{ message }}
    </div>

    <div
      v-if="message !== '通信待機中。。。'"
      class="c-3 mt-2 flex justify-center px-2"
      @click="addMyPhase(myno, 1)"
    >
      {{ buttonMessage }}
    </div>
    <div
      v-if="myphase === 3"
      class="c-3 mt-4 flex justify-center px-2 selected"
      @click="doubleDenied()"
    >
      W獲得しない
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rid: { type: Number, default: 9999 },
    myno: { type: Number, default: 0 },
    opno: { type: Number, default: 0 },
    myfid: { type: Number, default: 0 },
    opfid: { type: Number, default: 0 },
    myphase: { type: Number, default: 1 },
    opphase: { type: Number, default: 1 },
    game: {
      type: Object,
      default() {
        return {}
      },
    },
    selected: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      message: 'カードを選択し、支払うIPを指定してください',
      buttonMessage: '選出確定',
    }
  },
  computed: {
    commuStopFlag() {
      // 通信待機完了フラグ
      const my = this.game.gameVals.pVals[this.myno].phase
      const op = this.game.gameVals.pVals[this.opno].phase
      if (my === op && this.message === '通信待機中。。。' && this.myno === 0) {
        return 1
      }
      return 0
    },
  },
  watch: {
    commuStopFlag(newVal, oldVal) {
      if (newVal === 1 && oldVal === 0) {
        this.message = '通信待機中。'
        this.addMyPhase(this.myno, 1)
      }
    },
    myphase(newVal) {
      const my = this.myno
      const op = this.opno
      let pVals = this.game.gameVals.pVals

      switch (newVal) {
        case 0:
          this.message = 'カードを選択し、支払うIPを指定してください'
          break
        case 1:
          this.changeMyVals(my, 'selected', this.selected.cardId)
          this.changeMyVals(my, 'selectedPlace', this.selected.cardPlace)
          this.changeMyVals(my, 'usingIP', Number(this.selected.usingIP))
          this.message = '通信待機中。。。'
          break
        case 2:
          if (my === 1) {
            break
          }
          setTimeout(() => {
            pVals = this.game.gameVals.pVals
            // 両プレイヤーピック終了
            // 同カード選択の場合
            if (pVals[my].selected === pVals[op].selected) {
              if (pVals[my].usingIP === pVals[op].usingIP) {
                const pid = pVals[my].selectedPlace
                this.fbSet('fields/0/cards/' + pid + '/tired', true)
              } else if (pVals[my].usingIP > pVals[op].usingIP) {
                this.buyCard(my)
              } else if (pVals[op].usingIP > pVals[my].usingIP) {
                this.buyCard(op)
              }
            } else {
              // 別カード選択の場合
              const leastMy = pVals[op].usingIP + 1
              const leastOp = pVals[my].usingIP + 1
              console.log('w獲得判定')
              console.log('0 ip')
              console.log(pVals[0].usingIP)
              console.log(pVals[0].purseIP)
              console.log('1 ip')
              console.log(pVals[1].usingIP)
              console.log(pVals[1].purseIP)

              if (pVals[my].usingIP > leastMy && pVals[my].purseIP >= leastMy) {
                this.buyCard(my)
                this.changeMyPhase(op, 4)
                this.changeMyPhase(my, 3)
              } else if (
                pVals[op].usingIP > leastOp &&
                pVals[op].purseIP >= leastOp
              ) {
                this.buyCard(op)
                this.changeMyPhase(op, 3)
                this.changeMyPhase(my, 4)
              } else {
                this.buyCard(op)
                this.buyCard(my)
                this.changeMyPhase(my, 5)
              }
            }
          }, 1000)
          break
        case 3:
          this.message =
            '条件を満たした為、W獲得できます。相手の支払いIP＋1を支払ってW獲得しますか？'
          this.buttonMessage = 'はい'
          break
        case 4:
          this.message = '通信待機中。。。'
          break
        case 5:
          if (my === 1) {
            break
            // 親が処理を行う
          }
          if (pVals[my].purseIP > pVals[op].purseIP) {
            this.fbSet('gameVals/firstPlayer', my)
            this.changeMyPhase(op, 7)
            this.changeMyPhase(my, 6)
          } else {
            this.fbSet('gameVals/firstPlayer', op)
            this.changeMyPhase(op, 6)
            this.changeMyPhase(my, 7)
          }
          break
        case 6:
          this.message = 'カードをプレイしてください'
          this.buttonMessage = 'ターン終了'
          break
        case 7:
          this.message = '通信待機中。。。'
          break
        case 8:
          if (my === 1) {
            break
            // 親が処理を行う
          }
          if (this.game.gameVals.firstPlayer === 1) {
            this.changeMyPhase(my, 9)
            this.changeMyPhase(op, 10)
          } else {
            this.changeMyPhase(op, 9)
            this.changeMyPhase(my, 10)
          }
          break
        case 9:
          this.message = 'カードをプレイしてください'
          this.buttonMessage = 'ターン終了'
          break
        case 10:
          this.message = '通信待機中。。。'
          break
        case 11:
          this.message = 'カードを選択し、支払うIPを指定してください'
          if (my === 1) {
            break
            // 親が処理を行う
          } else {
            // ターン終了処理
            const fields = this.game.fields
            for (let i = 0; i < fields[0].cards.length; i++) {
              this.tireCard(0, i, false)
            }
            for (let i = 0; i < fields[2].cards.length; i++) {
              this.tireCard(2, i, false)
            }
            let nowNe = [999]
            if (this.game.gameVals.neFieldTired === undefined) {
              nowNe = [999]
            } else {
              nowNe = this.game.gameVals.neFieldTired
            }
            const newNe = []
            for (let i = 0; i < fields[1].cards.length; i++) {
              const card = fields[1].cards[i]
              if (nowNe.includes(card.cid)) {
                this.tireCard(1, i, false)
              } else if (card.tired) {
                newNe.push(card.cid)
              }
            }
            this.fbSet('gameVals/neFieldTired', newNe)
          }
          this.addIP(my, 1, pVals[my].monthIP)
          this.addIP(op, 1, pVals[op].monthIP)
          this.changeMyPhase(op, 0)
          this.changeMyPhase(my, 0)
          break
      }
    },
  },

  methods: {
    fbSet(db, setter) {
      this.$fire.database.ref('rooms/' + this.rid + '/game/' + db).set(setter)
    },
    tireCard(fid, pid, tireOrNot) {
      const db = 'fields/' + fid + '/cards/' + pid + '/tired'
      this.fbSet(db, tireOrNot)
    },
    deleteCard(f, p) {
      const fCards = this.game.fields[f].cards
      fCards.splice(p, 1)
      const db = 'fields/' + f + '/cards'
      this.fbSet(db, fCards)
    },
    pushCard(f, c) {
      let fCards = this.game.fields[f].cards
      if (fCards === false) {
        fCards = []
      }
      const newCard = { cid: c, tired: true }
      fCards.push(newCard)
      const db = 'fields/' + f + '/cards'
      this.fbSet(db, fCards)
    },
    gainCard(fTo, fFrom, c, p) {
      if (fFrom === 1) {
        this.tireCard(1, p, true)
      }
      this.pushCard(fTo, c)
      // 獲得時効果の誘発
      if (fTo === this.myno) {
        this.changeMyVals(this.myno, 'eFlags', [10, c, 99])
      }
    },
    buyCard(whose) {
      let fid = 0
      const pVals = this.game.gameVals.pVals
      if (whose === 1) {
        fid = 2
      }
      this.addIP(whose, 1, -pVals[whose].usingIP)
      this.gainCard(fid, 1, pVals[whose].selected, pVals[whose].selectedPlace)
    },
    changeMyVals(whose, what, value) {
      this.fbSet('gameVals/pVals/' + whose + '/' + what, value)
    },
    changeMyPhase(whose, n) {
      console.log('phaseChanged')
      console.log('for:' + whose)
      console.log('to:' + n)
      this.changeMyVals(whose, 'phase', n)
    },
    addMyPhase(whose, n) {
      const phase = this.game.gameVals.pVals[whose].phase
      this.changeMyPhase(whose, phase + n)
    },
    changeIP(whose, morc, val) {
      if (morc === 0) {
        this.changeMyVals(whose, 'monthIP', val)
      } else {
        this.changeMyVals(whose, 'purseIP', val)
      }
    },
    addIP(whose, morc, val) {
      let old = 0
      if (morc === 0) {
        old = this.game.gameVals.pVals[whose].monthIP
      } else {
        old = this.game.gameVals.pVals[whose].purseIP
      }
      const newVal = old + val
      this.changeIP(whose, morc, newVal)
    },
    changeEflags(pNo, val) {
      this.fbSet('gameVals/pVals/' + pNo + '/eFlags', val)
    },
    addLogNo() {
      const newLogNo = this.game.gameVals.logNo + 1
      this.fbSet('gameVals/logNo', newLogNo)
    },
    doubleDenied() {
      this.fbSet(
        'gameVals/pVals/' + this.opno + '/purseIP',
        this.game.gameVals.pVals[this.opno].usingIP
      )
      this.changeMyPhase(this.myno, 4)
    },
  },
}
</script>
