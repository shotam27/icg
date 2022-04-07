<template>
  <div id="cards">
    <div class="sm:flex p-4 h-2/3">
      <div
        v-if="selectedEffectSwitch === false"
        class="box flex mb-5 flex-wrap p-2"
      >
        <div
          v-for="(card, idx) in cardList"
          :key="idx"
          class="m-1"
          :class="{ aqua: isNew() < idx, pink: selected === idx }"
        >
          <div class="p-1 text-xs" @click="selectedCard(idx)">
            {{ idx }}
          </div>
        </div>
      </div>
      <div v-else class="box mb-5 p-4">
        <div class="mb-2">
          <div class="flex">
            <div class="mx-1">
              {{ selectedEffect.cname }}
            </div>
            <div class="mx-1 ml-2">eid:{{ selectedEffect.eid }}</div>
          </div>

          <div class="flex">
            <div class="mx-1 text-xs">
              {{ showEid }}
            </div>
            <div class="mx-1 text-xs">
              {{ showHid }}
            </div>
            <div class="mx-1 text-xs">引数:{{ selectedEffect.efs[2] }}</div>
          </div>
        </div>

        <div class="flex">
          <input
            v-model.number="selectedEffect.efs[0]"
            type="number"
            class="mx-2 px-2 w-1/6 flex justify-center text-black box"
          />
          <input
            v-model.number="selectedEffect.efs[1]"
            type="number"
            class="mx-2 px-2 w-1/6 flex justify-center text-black box"
          />
          <input
            v-model.number="selectedEffect.efs[2]"
            type="number"
            class="mx-2 px-2 w-1/6 flex justify-center text-black box"
          />

          <div class="box mx-2 px-2" @click="sendEffect()">更新</div>
        </div>
      </div>

      <div v-if="cardList.length > 0" class="sm:ml-6 box p-3 sm:w-1/4 mb-5">
        {{ selected }} : {{ cardList[selected].name }}
        <div
          v-for="(effect, idx2) in cardList[selected].effects"
          :key="idx2"
          class="box-2 mt-6 p-2 flex-col"
          @click="effectsClicked(idx2)"
        >
          <div class="flex items-center">
            <div class="text-lg mr-2">
              {{ effect.count }}
            </div>
            <div class="mr-3">
              {{ effect.keywords[0] }}
            </div>

            <div v-if="eifExistCheck(idx2) === 1" class="">
              {{ effects[selected][idx2].efs }}
            </div>
          </div>

          <div class="text-sm">
            {{ effect.text }}
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:ml-6 sm:w-1/6">
        <div class="box mb-6 p-2" @click="getStorage(storageStatus)">
          {{ storageStatus }}
        </div>
        <div class="box mb-6 p-2 hidden sm:flex" @click="submit()">更新</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      count: 0,
      storageStatus: '上書き',
      cards: [],
      effects: [],
      newCards: [],

      cardList: [
        {
          name: 'ゴリラ',
          effects: [
            { count: 1, keywords: ['侵略'], text: '一匹疲労させる。' },
            {
              count: 2,
              keywords: ['強化'],
              text: '同種を一枚疲労させ、同種を一枚生成する。',
            },
            {
              count: 3,
              keywords: ['侵略'],
              text: '同種を一枚疲労させ、疲労済を一枚追放する',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が6を超えていた場合。',
            },
          ],
        },
        {
          name: 'ライオン',
          effects: [
            {
              count: 1,
              keywords: ['侵略'],
              text: '増加IP2消費し、一匹追放する',
            },
            {
              count: 2,
              keywords: ['侵略'],
              text: 'IP10消費し、一匹追放する。自身の疲労取り除く',
            },
            {
              count: 3,
              keywords: ['侵略'],
              text: '追放されたカードを好きなだけ相手フィールドに置く。相手のカード全ての疲労を取り除く。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が6を超えていた場合。',
            },
          ],
        },
        {
          name: 'シカ',
          effects: [
            {
              count: 1,
              keywords: ['獲得時'],
              text: '中立フィールドの同種を回復する。',
            },
            {
              count: 2,
              keywords: ['強化'],
              text: '同種を一枚疲労させ、同種を一枚生成する。',
            },
            {
              count: 3,
              keywords: ['強化'],
              text: '同種を疲労させ、追放から一匹獲得する',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '自フィールドにカードが10枚ある場合、勝利。',
            },
          ],
        },
        {
          name: 'サボテン',
          effects: [
            { count: 1, keywords: ['反応'], text: 'IP＋2' },
            { count: 2, keywords: ['獲得時'], text: '増加IP＋1' },
            { count: 3, keywords: ['敵ターン開始時'], text: '一匹疲労させる' },
            {
              count: 3,
              keywords: ['勝利'],
              text: '累計IPが30を超えている場合。',
            },
          ],
        },
        {
          name: 'ハチ',
          effects: [
            { count: 1, keywords: ['侵略'], text: '一匹疲労させる' },
            {
              count: 2,
              keywords: ['強化'],
              text: '自分の反応持ちカードの効果を発動できる。',
            },
            {
              count: 3,
              keywords: ['侵略'],
              text: '自分のハチを二匹疲労させ、一匹追放する。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が6を超えていた場合。',
            },
          ],
        },
        {
          name: 'ジュゴン',
          effects: [
            {
              count: 1,
              keywords: ['水棲'],
              text: '疲労時、このカードは相手の効果を受け付けない',
            },
            {
              count: 2,
              keywords: ['強化'],
              text: '5IP消費し、ジュゴンを生成する',
            },
            {
              count: 3,
              keywords: ['強化'],
              text: '相手の反応持ちの数だけ、ジュゴンを回復させる',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '自フィールドに水棲持ちが8体いる場合。',
            },
          ],
        },
        {
          name: 'ワカメ',
          effects: [
            { count: 1, keywords: ['水棲'], text: '獲得時、IP＋2' },
            {
              count: 2,
              keywords: ['侵略'],
              text: '相手のフィールドにワカメを生成する。中立フィールドのワカメを回復する。',
            },
            { count: 3, keywords: ['反応'], text: 'IP＋10' },
            { count: 3, keywords: ['勝利'], text: '累計IPが30以上の場合。' },
          ],
        },
        {
          name: 'マグロ',
          effects: [
            {
              count: 1,
              keywords: ['水棲'],
              text: '獲得時、IP＋5。ラウンド終了時、このカードが疲労していない場合、追放する',
            },
            {
              count: 1,
              keywords: ['侵略'],
              text: '自分のIPを3消費し、相手のカードを疲労させる。',
            },
            { count: 2, keywords: ['侵略'], text: '相手のカードを追放する。' },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が6を超えていた場合。',
            },
          ],
        },
        {
          name: 'とうちゅうかそう',
          effects: [
            {
              count: 1,
              keywords: ['侵略'],
              text: '自分のIPを5消費し、相手のカードを疲労させる。',
            },
            { count: 2, keywords: ['反応'], text: 'IP＋5' },
            {
              count: 3,
              keywords: ['侵略'],
              text: '相手の侵略持ちカードを発動させる。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '相手の勝利条件を、自分のものとして発動できる。枚数の条件は無視する。',
            },
          ],
        },
        {
          name: 'ブナシメジ',
          effects: [
            {
              count: 1,
              keywords: ['強化'],
              text: '自フィールドに反応持ちがいる場合、5IP消費してブナシメジを生成する',
            },
            {
              count: 2,
              keywords: ['自動'],
              text: '１ラウンドにつき一度のみ、自分の反応持ちが追放された場合、自分のブナシメジを一体追放しなければならない',
            },
            { count: 3, keywords: ['反応'], text: 'IP＋5' },
            { count: 7, keywords: ['勝利'], text: 'IP40以上。' },
          ],
        },
        {
          name: 'ハイエナ',
          effects: [
            {
              count: 1,
              keywords: ['侵略'],
              text: '自分が他に侵略持ちを所持している場合、相手を一体疲労する。',
            },
            {
              count: 2,
              keywords: ['侵略'],
              text: '自分のハイエナを一体疲労させ、一体追放する。',
            },
            { count: 3, keywords: ['侵略'], text: '疲労済を一体追放する。' },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が6を超えていた場合。',
            },
          ],
        },
        {
          name: 'Mアカミミガメ',
          effects: [
            {
              count: 1,
              keywords: ['水棲'],
              text: 'ラウンド終了時、自フィールドに同種以外の追放可能なカードがある場合、それを一体追放しなければならない。',
            },
            {
              count: 2,
              keywords: ['侵略'],
              text: '相手はMアカミミガメを一体獲得する。自分はMアカミミガメを一体追放する。',
            },
            {
              count: 3,
              keywords: ['強化'],
              text: '同種を一体疲労させ、同種を生成する。',
            },
            { count: 3, keywords: ['勝利'], text: '追放が10体になった時。' },
          ],
        },
        {
          name: 'サンゴ',
          effects: [
            {
              count: 1,
              keywords: ['水棲'],
              text: 'このカードは追放されない。',
            },
            {
              count: 2,
              keywords: ['強化'],
              text: '同種を疲労させ、追放から獲得する。追放が０の場合、サンゴを生成する。',
            },
            {
              count: 3,
              keywords: ['反応'],
              text: '中立から好きなカードを選び、疲労させる。疲労させたカードを追放に置く。',
            },
            { count: 3, keywords: ['勝利'], text: 'IP40以上。' },
          ],
        },
        {
          name: 'チューリップ',
          effects: [
            {
              count: 1,
              keywords: ['反応'],
              text: 'IP＋1。この効果で疲労しない。',
            },
            { count: 2, keywords: ['獲得時'], text: 'このカードを回復する。' },
            {
              count: 3,
              keywords: ['侵略'],
              text: '相手に好きなカードを、中立から一体獲得させる。IP＋10。',
            },
            { count: 3, keywords: ['勝利'], text: 'IP40以上。' },
          ],
        },
        {
          name: 'タンポポ',
          effects: [
            {
              count: 1,
              keywords: ['追放時'],
              text: 'IP＋10。中立フィールドの同種を回復させる。',
            },
            { count: 2, keywords: ['反応'], text: 'IP＋5' },
            {
              count: 3,
              keywords: ['反応'],
              text: 'IP＋3。この効果で疲労しない。',
            },
            { count: 3, keywords: ['勝利'], text: 'IP40以上の時。' },
          ],
        },
        {
          name: 'ウサギ',
          effects: [
            {
              count: 1,
              keywords: ['強化'],
              text: '自フィールドに同種がいない場合、同種を獲得する。',
            },
            {
              count: 2,
              keywords: ['強化'],
              text: '同種を疲労させ、同種を獲得する。',
            },
            {
              count: 3,
              keywords: ['強化'],
              text: '5IP使用して同種を獲得する。この効果で疲労しない。',
            },
            { count: 10, keywords: ['勝利'], text: '条件なし。' },
          ],
        },
        {
          name: 'ハエ',
          effects: [
            { count: 1, keywords: ['獲得時'], text: 'このカードを回復する。' },
            { count: 1, keywords: ['侵略'], text: '一体疲労させる。' },
            {
              count: 3,
              keywords: ['侵略'],
              text: '相手のフィールドにフントークンがある場合、2体疲労させる。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が7を超えていた場合。',
            },
          ],
        },
        {
          name: 'サメ',
          effects: [
            {
              count: 1,
              keywords: ['水棲'],
              text: '疲労時、このカードは相手の効果を受け付けない',
            },
            {
              count: 2,
              keywords: ['侵略'],
              text: '自分は5IP消費する。相手のフィールドから一体を追放する。相手の水棲の効果を無視する。',
            },
            { count: 3, keywords: ['侵略'], text: '追放から一体除外する。' },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が6を超えていた場合。',
            },
          ],
        },
        {
          name: 'Eクロロティカ',
          effects: [
            {
              count: 1,
              keywords: ['強化'],
              text: '自分の反応持ちを一体追放し、このカードを生成する。5IP獲得する。',
            },
            { count: 2, keywords: ['反応'], text: 'IP＋5' },
            {
              count: 3,
              keywords: ['強化'],
              text: '反応持ちを一体疲労させ、このカードを生成する。5IP獲得する。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '反応持ちが６体以上いる場合。',
            },
          ],
        },
        {
          name: 'テナガザル',
          effects: [
            {
              count: 1,
              keywords: ['侵略'],
              text: '自分はカードを一枚を破棄する。破棄したカードを相手フィールドに生成する。自分は5IP獲得する。',
            },
            { count: 2, keywords: ['強化'], text: 'フントークンを生成する。' },
            {
              count: 3,
              keywords: ['侵略'],
              text: '自分はカードを一枚を破棄する。破棄したカードを相手フィールドに生成する。この効果で疲労しない。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '１ラウンドで侵略した回数が7を超えていた場合。',
            },
          ],
        },
        {
          name: 'オウム',
          effects: [
            { count: 1, keywords: ['侵略'], text: '一体疲労させる。' },
            {
              count: 2,
              keywords: ['強化'],
              text: '同種を一体疲労させ、同種を生成する',
            },
            {
              count: 3,
              keywords: ['獲得時'],
              text: '中立フィールドの同種を回復する。',
            },
            { count: 5, keywords: ['勝利'], text: '条件なし。' },
          ],
        },
        {
          name: 'スカンク',
          effects: [
            { count: 1, keywords: ['侵略'], text: '一体疲労させる。' },
            { count: 2, keywords: ['強化'], text: 'フントークンを生成する。' },
            {
              count: 3,
              keywords: ['侵略'],
              text: 'フントークンを破棄し、一体追放する。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: 'フントークンを5以上所持している場合。',
            },
          ],
        },
        {
          name: 'カ',
          effects: [
            {
              count: 1,
              keywords: ['獲得時'],
              text: '中立フィールドの同種を回復する。',
            },
            { count: 2, keywords: ['獲得時'], text: 'このカードを回復する。' },
            { count: 2, keywords: ['侵略'], text: '一体疲労させる。' },
            { count: 10, keywords: ['勝利'], text: '条件なし。' },
          ],
        },
        {
          name: '超超アルパカ',
          effects: [
            { count: 1, keywords: ['侵略'], text: '一体追放する。' },
            {
              count: 2,
              keywords: ['侵略'],
              text: '一体追放する。同種を生成する。',
            },
            { count: 3, keywords: ['獲得時'], text: 'このカードを回復する。' },
            {
              count: 4,
              keywords: ['勝利'],
              text: '同じターンに６回侵略した場合。',
            },
          ],
        },
      ],
      selected: 0,
      selectedEffectSwitch: false,
      selectedEffect: {
        cid: 0,
        eid: 0,
        cname: '',
        efs: [0, 0, 99],
      },
      showEid: '',
      showHid: '',
      eid: [
        ['なし'],
        ['なし', '一匹疲労', '一匹生成', 'フン生成'],
        ['なし', '中立回復', '自身回復', 'nIP', 'nMIP'],
      ],
      hid: ['なし', '疲労発動系', '獲得時発動系'],
    }
  },
  computed: {
    log() {
      const n = this.selectedEffect.efs[0] + this.selectedEffect.efs[1]
      return n
    },
  },
  watch: {
    cards() {
      this.cardList = this.deepCopy(this.cards)
      this.cardList = this.cardList.concat(this.deepCopy(this.newCards))
    },
    log() {
      const newVals = this.selectedEffect
      const h = newVals.efs[1]
      const e = newVals.efs[0]
      try {
        this.showHid = this.hid[h]
      } catch (error) {
        this.showHid = 'なし'
      }
      try {
        this.showEid = this.eid[h][e]
      } catch (error) {
        this.showEid = 'なし'
      }
    },
    deep: true,
  },
  mounted() {
    this.cardList = this.cardList.concat(this.deepCopy(this.newCards))
    console.log(this.deepCopy(this.newCards))
    this.$fire.database.ref('effects').on('value', (snapshot) => {
      this.effects = snapshot.val()
    })
  },
  methods: {
    effectsClicked(eid) {
      this.selectedEffectSwitch = !this.selectedEffectSwitch
      const cid = this.selected
      this.selectedEffect.cid = cid
      this.selectedEffect.eid = eid
      this.selectedEffect.cname = this.cardList[cid].name
    },
    sendEffect() {
      const info = this.selectedEffect
      const count = this.cards[info.cid].effects[info.eid].count
      const send = { cname: info.cname, ccount: count, efs: info.efs }
      this.$fire.database.ref('effects/' + info.cid + '/' + info.eid).set(send)
    },
    selectedCard(cid) {
      this.selected = cid
    },
    deepCopy(n) {
      return JSON.parse(JSON.stringify(n))
    },
    submit() {
      this.$fire.database.ref('cards').set(this.cardList)
    },
    getStorage(n) {
      if (n === '上書き') {
        this.$fire.database.ref('cards').on('value', (snapshot) => {
          this.cards = snapshot.val()
        })
        this.storageStatus = '追加'
      } else {
        this.cards = []
        this.storageStatus = '上書き'
      }
    },
    isNew() {
      return this.cards.length - 1
    },
    eifExistCheck(n) {
      let pushCheck = 0
      try {
        if (this.effects[this.selected][n].efs.length > 1) {
          pushCheck = 1
        }
        pushCheck = 1
      } catch (error) {
        pushCheck = 2
      }
      return pushCheck
    },
  },
}
</script>
<style scoped>
#cards {
  background-color: rgb(32, 32, 32);
  color: rgb(207, 207, 207);
  min-height: 100vh;
}
div {
  cursor: default;
  transition: all 0.5s ease-out;
}
.box {
  border-radius: 4px;
  box-shadow: 0px 0px 12px aqua;
}
.box-2 {
  border-left: solid 1px aqua;
}
.box-2:hover {
  border-color: rgb(234, 0, 255);
}
.box:hover {
  box-shadow: 0px 0px 12px rgb(234, 0, 255);
}
.list:hover {
  margin-left: 4px;
}
.aqua {
  color: aqua;
}
.pink {
  color: rgb(234, 0, 255);
}
</style>
