<template>
  <div id="app" class="w-full">
    <div class="ml-4 mb-4">
      <div class="text-lg">IKIMONO CARD GAME - {{ game.gameVals.logNo }}</div>

      <div class="text-xs">room {{ rid }}</div>
      <nuxt-link class="text-xs" to="/">もどる</nuxt-link>
      <hr class="hidden sm:flex" />
    </div>

    <div class="sm:flex justify-evenly w-full">
      <div class="left sm:w-1/4 sm:mr-4">
        <div class="left-container">
          <div class="hidden sm:flex justify-between">
            <div class="">PLAYER INFO</div>
          </div>

          <hr class="hidden sm:flex" />

          <div class="flex sm:flex-row">
            <div class="w-1/2">
              <div class="mt-1">PLAYER {{ myno + 1 }}</div>

              <div class="flex items-center">
                <div class="text-xs">増加 IP:</div>
                <div class="">{{ game.gameVals.pVals[myno].monthIP }}</div>
                <div class="ml-2 text-xl" @click="changeIP(0, 1)">+</div>
                <div class="ml-2 text-xl" @click="changeIP(0, -1)">-</div>
              </div>

              <div class="flex items-center">
                <div class="text-xs">所持 IP:</div>
                <div class="">{{ game.gameVals.pVals[myno].purseIP }}</div>
                <div class="ml-2 text-xl" @click="changeIP(1, 1)">+</div>
                <div class="ml-2 text-xl" @click="changeIP(1, -1)">-</div>
              </div>
            </div>
            <div class="w-1/2">
              <div class="mt-1">PLAYER {{ opno + 1 }}</div>
              <div class="flex items-center">
                <div class="text-xs">増加 IP:</div>
                <div class="">{{ game.gameVals.pVals[opno].monthIP }}</div>
              </div>
              <div class="flex items-center">
                <div class="text-xs">所持 IP:</div>
                <div class="">{{ game.gameVals.pVals[opno].purseIP }}</div>
              </div>
              <div v-if="clphase > 1" class="">
                <div class="flex flex-wrap">
                  <div class="text-xs">USED:</div>
                  <div class="">{{ game.gameVals.pVals[opno].usingIP }}</div>
                </div>

                <div class="text-xs">CARD:</div>
                <div class="">
                  {{ cards[game.gameVals.pVals[opno].selected].name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="left-container">
          <div class="hidden sm:contents">
            <div class="">INPUTS</div>
            <hr />
          </div>

          <div class="flex justify-around">
            <div class="w-1/2">
              <div class="">CARD</div>
              <div class="">└{{ selected.cardName }}</div>
            </div>

            <div class="w-1/2">
              <div class="">支払うIP</div>
              <input v-model="selected.usingIP" type="number" />
            </div>
          </div>

          <hr />

          <PhaseComponent
            :selected="selected"
            :rid="rid"
            :myno="myno"
            :opno="opno"
            :myphase="game.gameVals.pVals[myno].phase"
            :opphase="game.gameVals.pVals[opno].phase"
            :game="game"
          />
          <EffectsComponent
            :selected="selected"
            :rid="rid"
            :myno="myno"
            :opno="opno"
            :myfid="myfid"
            :opfid="opfid"
            :myflag="game.gameVals.pVals[myno].eFlags"
            :cardsjson="cardsjson"
            :tidstart="tidStart"
            :fields="game.fields"
            :gamevals="game.gameVals"
          />
        </div>
        <div class="hidden sm:flex mt-64 text-xs">
          Ph:{{ clphase }}-Cd:{{ game.gameVals.pVals[myno].selected }}-Ip:{{
            game.gameVals.pVals[myno].usingIP
          }}
        </div>
      </div>

      <div v-if="cards.length > 0" class="center w-full">
        <div
          v-for="(field, idx) in game.fields"
          :key="idx"
          class="field mb-4 w-full"
        >
          <div class="flex items-center w-full">
            <div class="ml-2">{{ field.name }}</div>

            <div
              v-if="idx === 3"
              class="ml-2 c-3 text-xs flex items-center h-5 p-2"
              @click="showGy()"
            >
              追放表示
            </div>
          </div>

          <div
            v-if="(cards.length > 0, idx !== 3 || hideGy === false)"
            class="card-container flex-wrap w-full c-2"
          >
            <div
              v-for="(card, idx2) in field.cards"
              :key="idx2"
              class="card c-3 my-5 mx-2 w-20 h-12 text-xs p-1"
              :class="{
                tired: card.tired === true,
                selected: idx == selected.fieldId && idx2 == selected.cardPlace,
              }"
              @click="onClick(idx, card.cid, idx2)"
            >
              <div class="card-name">
                {{ cards[card.cid].name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal name="card" :width="350" :height="500">
        <div
          v-if="selected.cardId !== '' && cards.length > 0"
          class="card-info c-3"
        >
          <div class="flex flex-col">
            <div class="ci-name">{{ cards[selected.cardId].name }}</div>
            <hr />

            <div class="flex flex-col h-2/3">
              <div
                v-for="(effect, idx3) in cards[selected.cardId].effects"
                :key="idx3"
                class="mb-2 px-3"
                :class="{
                  disabled: countCards() < effect.count,
                  on: selected.keyword.placeId == idx3,
                }"
                @click="onClickEffect(effect.keywords[0], idx3)"
              >
                <div class="mt-2 flex item-center">
                  <div class="mr-2 text-s min-w-max">
                    {{ effect.count }}枚時
                  </div>
                  <div
                    class="px-1 text-xs c-3 flex align-center items-center justify-center"
                    :class="{
                      disabled: countCards() < effect.count,
                    }"
                  >
                    {{ effect.keywords[0] }}
                  </div>
                </div>

                <div
                  v-if="selected.keyword.placeId == idx3"
                  class="text-xs mt-1 px-2"
                  :class="{
                    disabled: countCards() < effect.count,
                  }"
                >
                  {{ selected.keyword.name }}:{{ selected.keyword.text }}
                </div>

                <div class="text-xs mt-2">
                  {{ effect.text }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap content-around justify-around">
            <div
              v-for="(action, idx) in actions"
              :key="idx"
              class="c-3 mr-2 mb-2 px-2 py-1"
              @click="actionClick(action)"
            >
              {{ action }}
            </div>
            <div class="c-3 mr-2 mb-2 px-2 py-1" @click="relatedClicked()">
              {{ getRelated }}
            </div>
          </div>
        </div>
      </Modal>
      <Modal name="win" :width="350" :height="300">
        <div class="win-box flex flex-col content-around justify-around">
          <div v-if="win == true" class="win-font flex flex-col items-center">
            VICTORY
          </div>

          <div v-if="win == false" class="lose-font flex flex-col items-center">
            DEFEAT
          </div>

          <div v-if="win == false" class="flex content-around justify-around">
            <div class="c-3 p-2" @click="denyLose()">異議あり</div>
            <div class="c-3 p-2" @click="reset()">再戦する</div>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import EffectsComponent from '~/components/EffectsComponent'

export default {
  components: {
    EffectsComponent,
  },
  props: {
    myno: { type: Number, default: 0 },
    opno: { type: Number, default: 1 },
    myfid: { type: Number, default: 0 },
    opfid: { type: Number, default: 2 },
    rid: { type: Number, default: 9999 },
    game: {
      type: Object,
      default() {
        return {}
      },
    },
    clphase: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // fireStorage移行予定系
      keywords: [
        {
          name: '勝利',
          text: '発動条件を満たす時、このカードを疲労させて勝利する。',
        },
        {
          name: '侵略',
          text: 'カードを疲労させて発動する。相手フィールドに影響を及ぼす。',
        },
        {
          name: '強化',
          text: 'カードを疲労させて発動する。主に自フィールドに影響を及ぼす。',
        },
        {
          name: '反応',
          text: '相手が侵略発動時に、疲労させて発動する。侵略効果の前に解決する。',
        },
        {
          name: '自動',
          text: '効果に記載のタイミングで発動する。記載がなければ疲労しない。',
        },
        {
          name: '水棲',
          text: '効果に記載のタイミングで発動する。記載がなければ疲労しない。',
        },
        {
          name: '獲得時',
          text: '中立から獲得したタイミングで発動する。「生成時」は対象外。',
        },
      ],
      tokens: [
        {
          name: 'フン',
          effects: [
            {
              count: 1,
              keywords: ['自動'],
              text: 'このカードを追放した時、1IP失う。',
            },
          ],
        },
      ],
      cardPool: [],
      cards: [],
      cardsjson: [],
      relatedCards: [],

      selected: {
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
      },

      tidStart: 99,

      hideGy: true,

      actions: ['獲得', '疲労', '破棄', '追放'],
      defActions: ['獲得', '疲労', '破棄', '追放'],
      neFieldTired: [0, 0, 0, 0, 0, 0],

      resetFlag: false,
      win: false,

      gameMaster: false,
      alreadySelectedFlag: 0,
      secondBatterFlag: 0,
      buttonMessage: '選出確定',
      phaseMessage: 'カードを選択し、支払うIPを指定してください',
    }
  },
  computed: {
    gameEndFlag() {
      const f = this.game.gameVals.gameEndFlag
      return f
    },
    getRelated() {
      let r = '関連カードなし'
      try {
        const rcid = this.relatedCards[this.selected.cardId][0]
        r = this.cards[rcid].name
      } catch (error) {}
      return r
    },
  },
  watch: {
    deep: true,
    cardPool() {
      this.cards = this.deepCopy(this.cardPool)
      this.cards = this.cards.concat(this.deepCopy(this.tokens))
      this.cardsjson = JSON.stringify(this.cards)
      this.tidStart = this.cardPool.length
    },
    gameEndFlag(newVal, oldVal) {
      if (newVal === 1 && oldVal === 0) {
        this.showWin()
      }
      if (newVal === 0 && oldVal === 1) {
        this.hideWin()
        this.win = false
      }
    },
    getWin(newVal) {
      if (newVal === true) {
        this.actions = ['獲得', '疲労', '破棄', '追放', '勝利']
      } else {
        this.actions = ['獲得', '疲労', '破棄', '追放']
      }
    },
  },
  mounted() {
    this.$fire.database.ref('cards').once('value', (snapshot) => {
      this.cardPool = snapshot.val()
    })
    this.$fire.database.ref('relatedCards').once('value', (snapshot) => {
      this.relatedCards = snapshot.val()
    })
    this.$fire.database.ref('resetFlag').on('value', (snapshot) => {
      this.resetFlag = snapshot.val()
    })
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
    gainCard(f, c, p) {
      if (f === 1) {
        this.tireCard(1, p, true)
      }
      this.pushCard(this.myfid, c)
      // 獲得時効果の誘発
      this.changeMyVals('eFlags', [10, c, 99])
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
        const n = this.game.gameVals.pVals[this.myno].monthIP + val
        this.changeMyVals('monthIP', n)
      }
      if (morc === 1) {
        const n = this.game.gameVals.pVals[this.myno].purseIP + val
        this.changeMyVals('purseIP', n)
      }
    },
    addIP(morc, val) {
      let old = 0
      if (morc === 0) {
        old = this.game.gameVals.pVals[this.myno].monthIP
      } else {
        old = this.game.gameVals.pVals[this.myno].purseIP
      }
      this.changeIP(morc, old + val)
    },
    changeEflags(pNo, val) {
      this.fbSet('gameVals/pVals/' + pNo + '/eFlags', val)
    },
    addLogNo() {
      const newLogNo = this.game.gameVals.logNo + 1
      this.fbSet('gameVals/logNo', newLogNo)
    },

    // component固有
    relatedClicked() {
      const c = this.selected.cardId
      try {
        this.selected.cardId = this.relatedCards[c][0]
      } catch (error) {}
    },
    sendFields() {
      this.sendFieldById(this.myfid)
      this.sendFieldById(1)
      this.sendFieldById(3)
    },
    actionClick(n) {
      const f = this.selected.fieldId
      const c = this.selected.cardId
      const p = this.selected.cardPlace

      if (n === '獲得') {
        this.gainCard(f, c, p)
      }
      if (n === '疲労') {
        const nt = !this.game.fields[f].cards[p].tired
        this.tireCard(f, p, nt)
      }
      if (n === '破棄') {
        this.deleteCard(f, p)
      }
      if (n === '追放') {
        if (f !== 1) {
          this.deleteCard(f, p)
        }
        this.pushCard(3, c)
      }
      if (n === '発動') {
        this.fbSet('fields/' + f + '/cards/' + p + '/tired', true)
        const cid = this.selected.cardId
        const epid = this.selected.keyword.placeId
        const keyword = this.cards[cid].effects[epid].keywords[0]
        const myEflag = this.game.gameVals.pVals[this.myno].eFlags[0]

        if (keyword === '反応' && myEflag === 20) {
          this.changeEflags(this.myno, [21, cid, epid])
        } else if (keyword === '侵略') {
          this.changeEflags(this.opno, [20, cid, epid])
          this.changeEflags(this.myno, [0, cid, epid])
        } else if (keyword === '強化') {
          this.changeEflags(this.myno, [1, cid, epid])
        }
      }
      const newLogNo = this.game.gameVals.logNo + 1
      this.fbSet('gameVals/logNo', newLogNo)
      this.hide()
    },
    onClick(f, c, p) {
      let cnt = 0
      if (this.selected.fieldId === f) {
        cnt++
      }
      if (this.selected.cardId === c) {
        cnt++
      }
      if (this.selected.cardPlace === p) {
        cnt++
      }
      if (this.alreadySelectedFlag === 1) {
        cnt = cnt + 10
      }
      if (cnt === 3) {
        this.alreadySelectedFlag = 1
      }
      if (cnt === 13) {
        this.selected.keyword.placeId = 99
        this.show()
      }

      this.selected.fieldId = f
      this.selected.cardId = c
      this.selected.cardPlace = p
      this.selected.cardName = this.cards[c].name
      this.actions = this.defActions
    },
    showGy() {
      this.hideGy = !this.hideGy
    },
    deepCopy(n) {
      return JSON.parse(JSON.stringify(n))
    },
    countCards() {
      let count = 0
      const cid = this.selected.cardId
      const fid = this.selected.fieldId
      const myfid = this.myfid

      try {
        for (let i = 0; i <= this.game.fields[myfid].cards.length; i++) {
          if (this.game.fields[myfid].cards[i].cid === cid) {
            count++
          }
        }
      } catch (error) {}
      if (fid !== myfid) {
        count++
      }
      return count
    },
    onClickEffect(n, p) {
      this.selected.keyword.name = n
      this.selected.keyword.placeId = p
      const k = this.keywords
      for (let i = 0; i < k.length; i++) {
        if (n === k[i].name) {
          this.selected.keyword.text = k[i].text
        }
      }
      const pid = this.selected.cardPlace
      const fid = this.selected.fieldId
      const cc = this.cards[this.selected.cardId].effects[p].count
      let cnt = 0
      if (fid === this.myfid) {
        cnt++
      }
      if (this.game.fields[fid].cards[pid].tired === false) {
        cnt++
      }
      if (cc <= this.countCards()) {
        cnt++
      }
      if (cnt === 3) {
        this.actions = this.defActions.concat('発動')
      } else {
        this.actions = this.defActions
      }
    },
    denyLose() {
      this.$fire.database.ref('gameVals/gameEndFlag').set(0)
    },
    neFieldTiredControll() {
      if (this.myno === 0) {
        for (let i = 0; this.game.fields[1].cards.length > i; i++) {
          if (this.game.fields[1].cards[i].tired === true) {
            if (this.neFieldTired[i] === 1) {
              this.tireCard(1, i, false)
              this.neFieldTired[i] = 0
            } else {
              this.neFieldTired[i] = 1
            }
          }
        }
      }
    },
    show() {
      this.$modal.show('card')
    },
    hide() {
      this.$modal.hide('card')
    },
    showWin() {
      this.$modal.show('win')
    },
    hideWin() {
      this.$modal.hide('win')
    },
  },
}
</script>

<style>
body {
  background-color: #aab2ba;
}
#app {
  padding: 20px;
  color: white;
  min-height: 100vh;
  min-width: 100vw;
}
#app div {
  border-radius: 10px;
  cursor: default;
  transition: all 0.5s ease-out;
}
.card-enter-active,
.card-leave-active {
  transition: all 1s ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
input {
  color: black;
  width: 100%;
  border-radius: 5px;
  padding-left: 5px;
}
hr {
  width: 90%;
  margin: 10px 0;
}
.c-1 {
  background: #26263a;
}
.c-2 {
  border: solid #c5ac94;
  background-color: rgba(0, 0, 0, 0.4);
}
.c-3 {
  background: #857162;
  border: solid 2px #cfcbc1;
  color: #eee;
}
.c-4 {
  background: #d8b9c3;
}
.rotate {
  transform: rotate(270deg);
}
.top {
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 48px;
  margin-bottom: 20px;
}
.left-title {
  font-size: 24px;
}
.left-container {
  background-color: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 1px;
  margin-bottom: 10px;
}
.name {
  margin: 0 0 8px 16px;
  font-size: 24px;
  color: white;
}
.card-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  min-height: 100px;
}
.card {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s ease-out;
  object-fit: fill;
}

.card-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  height: 500px;
}
.ci-name {
  display: flex;
  width: 100%;
  justify-content: center;
  font-size: 24px;
}
.win-box {
  height: 100%;
  background: #4f4658;
  border: solid #c5ac94;
}
.lose-font {
  font-family: serif;
  color: red;
}
.win-font {
  font-family: serif;
  color: #acb6e5;
}
.action {
  display: flex;
  justify-content: center;
  padding: 5px 15px;
  margin: 5px;
}
.tired {
  transform: rotate(90deg);
}
.selected {
  background: #b96f38;
}
.disabled {
  border-color: #a5a29b;
  color: #a5a29b;
}
.on {
  transform: scale(1.05);
}
</style>
