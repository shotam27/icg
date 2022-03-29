<template>
  <div id="app" class="w-full">
    <div class="ml-4 mb-4">
      <div class="text-lg">IKIMONO CARD GAME v0.1.0 - {{ gameVals.logNo }}</div>
      <hr class="hidden sm:flex" />
    </div>

    <div class="sm:flex justify-evenly w-full">
      <div class="left sm:w-1/4 sm:mr-4">
        <div v-if="gameMaster === true" class="">
          <div @click="reset()">reset</div>
          <nuxt-link to="/cardsDb">db</nuxt-link>
        </div>
        <div v-if="selected.usingIP == 2727" class="ml-2" @click="chPl()">
          CH PL
        </div>

        <div class="left-container">
          <div class="hidden sm:flex justify-between">
            <div class="">PLAYER INFO</div>
          </div>

          <hr class="hidden sm:flex" />

          <div class="hidden sm:flex">you are : PLAYER {{ myNo + 1 }}</div>

          <div class="flex sm:flex-row">
            <div class="w-1/2">
              <div class="mt-1">PLAYER {{ myNo + 1 }}</div>

              <div class="flex items-center">
                <div class="text-xs">増加 IP:</div>
                <div class="">{{ gameVals.pVals[myNo].monthIP }}</div>
                <div class="ml-2 text-xl" @click="changeIP(0, 1)">+</div>
                <div class="ml-2 text-xl" @click="changeIP(0, -1)">-</div>
              </div>

              <div class="flex items-center">
                <div class="text-xs">所持 IP:</div>
                <div class="">{{ gameVals.pVals[myNo].purseIP }}</div>
                <div class="ml-2 text-xl" @click="changeIP(1, 1)">+</div>
                <div class="ml-2 text-xl" @click="changeIP(1, -1)">-</div>
              </div>
            </div>
            <div class="w-1/2">
              <div class="mt-1">PLAYER {{ opNo + 1 }}</div>
              <div class="flex items-center">
                <div class="text-xs">増加 IP:</div>
                <div class="">{{ gameVals.pVals[opNo].monthIP }}</div>
              </div>
              <div class="flex items-center">
                <div class="text-xs">所持 IP:</div>
                <div class="">{{ gameVals.pVals[opNo].purseIP }}</div>
              </div>
              <div v-if="clPhase > 1" class="">
                <div class="flex flex-wrap">
                  <div class="text-xs">USED:</div>
                  <div class="">{{ gameVals.pVals[opNo].usingIP }}</div>
                </div>

                <div class="text-xs">CARD:</div>
                <div class="">
                  {{ cards[gameVals.pVals[opNo].selected].name }}
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

          <div class="">
            <div class="px-1 mt-4 text-xs">
              {{ phaseMessage }}
            </div>

            <div
              class="c-3 mt-2 flex justify-center px-2"
              :class="{
                selected: buttonMessage !== '通信待機中...',
              }"
              @click="phaseIncrement"
            >
              {{ buttonMessage }}
            </div>
            <div
              v-if="clPhase === 2"
              class="c-3 mt-4 flex justify-center px-2 selected"
              @click="doubleDenied()"
            >
              W獲得しない
            </div>
          </div>

          <div class="">
            <EffectsComponent
              :selected="selected"
              :myno="myNo"
              :opno="opNo"
              :myfid="myFid"
              :opfid="opFid"
              :myflag="gameVals.pVals[myNo].eFlags"
            />
          </div>
        </div>
        <div class="hidden sm:flex mt-64 text-xs">
          Ph:{{ clPhase }}-Cd:{{ gameVals.pVals[myNo].selected }}-Ip:{{
            gameVals.pVals[myNo].usingIP
          }}
        </div>
      </div>

      <div v-if="cards.length > 0" class="center w-full">
        <div
          v-for="(field, idx) in fields"
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
  data() {
    return {
      // fireStorage移行予定系
      keywords: [
        {
          name: '勝利',
          text: '発動条件を満たす時、このカードを披露させて勝利する。',
        },
        {
          name: '侵略',
          text: 'カードを疲労させて発動する。主に他のフィールドに影響を及ぼす。',
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

      // realtimeDB系

      fields: [
        {
          name: 'Player1',
          cards: [],
        },
        {
          name: '中立',
          cards: [],
        },
        {
          name: 'Player2',
          cards: [],
        },
        {
          name: '追放',
          cards: [],
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

      // 連携なし
      inits: {
        fields: [
          {
            name: 'Player1',
            cards: [],
          },
          {
            name: '中立',
            cards: [],
          },
          {
            name: 'Player2',
            cards: [],
          },
          {
            name: '追放',
            cards: [],
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

      clPhase: 0,

      tidStart: 99,

      hideGy: true,

      actions: ['獲得', '疲労', '破棄', '追放', 'フン'],
      defActions: ['獲得', '疲労', '破棄', '追放', 'フン'],
      neFieldTired: [0, 0, 0, 0, 0, 0],

      resetFlag: false,
      win: false,

      gameMaster: false,
      myNo: 1,
      opNo: 0,
      myFid: 2,
      opFid: 0,
      alreadySelectedFlag: 0,
      secondBatterFlag: 0,
      buttonMessage: '選出確定',
      phaseMessage: 'カードを選択し、支払うIPを指定してください',
    }
  },
  computed: {
    commuStopFlag() {
      // 通信待機完了スタンプ
      const my = this.gameVals.pVals[this.myNo].phase
      const op = this.gameVals.pVals[this.opNo].phase
      if (my === op && this.buttonMessage === '通信待機中...') {
        return 1
      }
      return 0
    },
    gameEndFlag() {
      const f = this.gameVals.gameEndFlag
      return f
    },
    getWin() {
      const sel = this.selected
      if (sel.fieldId !== this.myFid) {
        return false
      }
      const c = sel.cardId
      const cc = this.countCards()
      let wc = 99
      for (let i = 0; this.cards[c].effects[i].length; i++) {
        if (this.cards[c].effects[i].keywords[0] === '勝利') {
          wc = this.cards[c].effects[i].count
        }
      }
      if (cc >= wc) {
        return true
      }
      return false
    },
  },
  watch: {
    deep: true,
    cardPool() {
      this.cards = this.deepCopy(this.cardPool)
      this.cards = this.cards.concat(this.deepCopy(this.tokens))

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
    commuStopFlag(newVal, oldVal) {
      if (newVal === 1 && oldVal === 0) {
        this.clPhase++
      }
    },
    getWin(newVal) {
      if (newVal === true) {
        this.actions = ['獲得', '疲労', '破棄', '追放', 'フン', '勝利']
      } else {
        this.actions = ['獲得', '疲労', '破棄', '追放', 'フン']
      }
    },
    clPhase(newVal) {
      const my = this.myNo
      const op = this.opNo
      this.gameVals.pVals[my].phase = newVal
      if (newVal === 1) {
        this.gameVals.pVals[this.myNo].selected = this.selected.cardId
        this.gameVals.pVals[this.myNo].selectedPlace = this.selected.cardPlace
        this.gameVals.pVals[this.myNo].usingIP = Number(this.selected.usingIP)
        this.buttonMessage = '通信待機中...'
      }
      if (newVal === 2) {
        const myVal = this.gameVals.pVals[my]
        const opVal = this.gameVals.pVals[op]
        if (myVal.selected !== opVal.selected) {
          const newMyPurseIp = myVal.purseIP - myVal.usingIP
          if (
            myVal.usingIP > opVal.usingIP + 1 &&
            newMyPurseIp > opVal.usingIP
          ) {
            this.gameVals.pVals[my].purseIP -= myVal.usingIP
            this.buttonMessage = 'W獲得する'
            this.phaseMessage =
              '相手の「支払いIP」+1を払って相手のカードを獲得できます。'
            this.gainCard(
              1,
              this.gameVals.pVals[my].selected,
              this.gameVals.pVals[my].selectedPlace
            )
            this.sendMyVals()
            return
          }
          const newOpPurseIp = opVal.purseIP - opVal.usingIP
          if (
            opVal.usingIP > myVal.usingIP + 1 &&
            newOpPurseIp > myVal.usingIP
          ) {
            this.clPhase = 4
            this.sendMyVals()
            return
          }
          this.gainCard(
            1,
            this.gameVals.pVals[my].selected,
            this.gameVals.pVals[my].selectedPlace
          )
          this.gameVals.pVals[my].purseIP -= myVal.usingIP
        } else if (myVal.usingIP > opVal.usingIP) {
          this.gameVals.pVals[my].purseIP -= myVal.usingIP
          this.gainCard(
            1,
            this.gameVals.pVals[my].selected,
            this.gameVals.pVals[my].selectedPlace
          )
        }
        this.clPhase = 5
      }
      if (newVal === 3) {
        this.gameVals.pVals[my].purseIP -= this.gameVals.pVals[op].usingIP
        this.gameVals.pVals[my].purseIP -= 1
        this.gainCard(
          1,
          this.gameVals.pVals[op].selected,
          this.gameVals.pVals[op].selectedPlace
        )
        this.buttonMessage = '通信待機中...'
        this.clPhase++
      }
      if (newVal === 4) {
        this.buttonMessage = '通信待機中...'
      }
      if (newVal === 5) {
        this.phaseMessage = '獲得時効果用フェイズ'
        this.buttonMessage = '処理確定'
      }
      if (newVal === 6) {
        this.buttonMessage = '通信待機中...'
      }
      if (newVal === 7) {
        let myPurse = this.gameVals.pVals[my].purseIP
        let opPurse = this.gameVals.pVals[op].purseIP
        if (myPurse === opPurse) {
          opPurse = opPurse + my
          myPurse = myPurse + op
        }
        if (myPurse > opPurse) {
          this.phaseMessage = 'カードをプレイしてください'
          this.buttonMessage = 'ターン終了'
        } else {
          this.secondBatterFlag = 1
          this.clPhase++
        }
      }
      if (newVal === 8) {
        this.phaseMessage = '相手がカードをプレイしています'
        this.buttonMessage = '通信待機中...'
      }
      if (newVal === 9) {
        if (this.secondBatterFlag === 1) {
          this.phaseMessage = 'カードをプレイしてください'
          this.buttonMessage = 'ターン終了'
        } else {
          this.clPhase++
        }
      }
      if (newVal === 10) {
        this.phaseMessage = '相手がカードをプレイしています'
        this.buttonMessage = '通信待機中...'
      }
      if (newVal === 11) {
        this.secondBatterFlag = 0
        this.phaseMessage = 'カードを選択し、支払うIPを指定してください'
        this.buttonMessage = '選出確定'
        this.gameVals.pVals[this.myNo].purseIP +=
          this.gameVals.pVals[this.myNo].monthIP
        if (this.cardPushCheck(this.myFid) === 1) {
          const cardLength = this.fields[this.myFid].cards.length
          for (let i = 0; i < cardLength; i++) {
            this.fields[this.myFid].cards[i].tired = false
          }
          this.sendFieldById(this.myFid)
        }
        this.neFieldTiredControll()
        this.clPhase = 0
      }
      this.sendMyVals()
    },
  },
  mounted() {
    this.$fire.database.ref('cards').once('value', (snapshot) => {
      this.cardPool = snapshot.val()
    })
    this.$fire.database.ref('fields').on('value', (snapshot) => {
      this.fields = snapshot.val()
    })
    this.$fire.database.ref('gameVals').on('value', (snapshot) => {
      this.gameVals = snapshot.val()
    })
    this.$fire.database.ref('resetFlag').on('value', (snapshot) => {
      this.resetFlag = snapshot.val()
    })
  },
  methods: {
    fbSet(db, setter) {
      this.$fire.database.ref(db).set(setter)
    },
    changeIP(morc, val) {
      if (morc === 0) {
        this.gameVals.pVals[this.myNo].monthIP += val
      }
      if (morc === 1) {
        this.gameVals.pVals[this.myNo].purseIP += val
      }
      this.sendMyVals()
    },
    phaseIncrement() {
      this.clPhase++
    },
    chPl() {
      this.gameMaster = !this.gameMaster

      if (this.gameMaster === true) {
        this.myNo = 0
        this.opNo = 1
        this.myFid = 0
        this.opFid = 2
      } else {
        this.myNo = 1
        this.opNo = 0
        this.myFid = 2
        this.opFid = 0
      }
      this.fields[this.myFid].cards = []
    },
    reset() {
      this.hideWin()
      this.$fire.database.ref('gameVals').set(this.inits.gameVals)
      this.$fire.database.ref('resetFlag').set(!this.resetFlag)
    },
    doubleDenied() {
      this.gameVals.pVals[this.opNo].purseIP -=
        this.gameVals.pVals[this.opNo].usingIP
      this.clPhase = 4
    },
    sendMyVals() {
      this.$fire.database
        .ref('gameVals/pVals/' + this.myNo)
        .set(this.gameVals.pVals[this.myNo])

      const newLogNo = this.gameVals.logNo + 1
      this.$fire.database.ref('gameVals/logNo').set(newLogNo)
    },
    sendFieldById(fid) {
      this.$fire.database.ref('fields/' + fid).set(this.fields[fid])
    },
    sendFields() {
      this.sendFieldById(this.myFid)
      this.sendFieldById(1)
      this.sendFieldById(3)
    },
    gainCard(f, c, p) {
      if (f === 1) {
        this.$fire.database.ref('fields/1/cards/' + p + '/tired').set(true)
      }
      const newCard = { cid: c, tired: true }
      this.cardPushCheck(this.myFid)
      this.fields[this.myFid].cards.push(newCard)
      this.sendFieldById(this.myFid)
    },
    actionClick(n) {
      const f = this.selected.fieldId
      const c = this.selected.cardId
      const p = this.selected.cardPlace

      if (n === '獲得') {
        this.gainCard(f, c, p)
      }
      if (n === '疲労') {
        this.fields[f].cards[p].tired = !this.fields[f].cards[p].tired
      }
      if (n === '破棄') {
        this.fields[f].cards.splice(p, 1)
      }
      if (n === '追放') {
        if (f !== 1) {
          this.fields[f].cards.splice(p, 1)
        }
        const newCard = { cid: c, tired: false }
        this.cardPushCheck(3)
        this.fields[3].cards.push(newCard)
      }
      if (n === 'フン') {
        this.gainCard(0, this.tidStart, 0)
      }
      if (n === '勝利') {
        this.win = true
        this.$fire.database.ref('gameVals/gameEndFlag').set(1)
        this.showWin()
      }
      if (n === '発動') {
        this.fbSet('fields/' + f + '/cards/' + p + '/tired', true)
        this.$fire.database
          .ref('gameVals/pVals/' + this.myNo + '/eFlags')
          .set([1, this.selected.cardId, this.selected.keyword.placeId])
      }
      this.$fire.database.ref('fields').set(this.fields)
      const newLogNo = this.gameVals.logNo + 1
      this.$fire.database.ref('gameVals/logNo').set(newLogNo)
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
    cardPushCheck(fid) {
      let pushCheck = 0
      try {
        if (this.fields[fid].cards.length > 0) {
          pushCheck = 1
        }
      } catch (error) {
        this.fields[fid].cards = []
      }
      return pushCheck
    },
    countCards() {
      let count = 0
      const cid = this.selected.cardId
      const fid = this.selected.fieldId
      const myFid = this.myFid

      try {
        for (let i = 0; i <= this.fields[myFid].cards.length; i++) {
          if (this.fields[myFid].cards[i].cid === cid) {
            count++
          }
        }
      } catch (error) {}
      if (fid !== myFid) {
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
      if (fid === this.myFid) {
        cnt++
        console.log(1)
      }
      if (this.fields[fid].cards[pid].tired === false) {
        cnt++
        console.log(2)
      }
      if (cc === this.countCards()) {
        cnt++
        console.log(3)
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
      if (this.myNo === 0) {
        for (let i = 0; this.fields[1].cards.length > i; i++) {
          if (this.fields[1].cards[i].tired === true) {
            if (this.neFieldTired[i] === 1) {
              this.$fire.database
                .ref('fields/1/cards/' + i + '/tired')
                .set(false)
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
#app {
  padding: 20px;
  background-color: #aab2ba;
  background-size: cover;
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
