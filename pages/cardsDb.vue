<template>
  <div id="cards">
    <div class="sm:flex p-4 h-2/3">
      <div class="hidden sm:flex flex-col box p-2 flex-wrap w-1/5">
        <div
          v-for="(card, idx) in cardList"
          :key="idx"
          :class="{ aqua: isNew() < idx }"
          class="list"
          @click="selectedCard(idx)"
        >
          <div class="">{{ idx }} : {{ card.name }}</div>
        </div>
      </div>
      <input v-model="selected" type="number" class="sm:hidden box mb-5 px-4" />
      <div v-if="cardList.length > 0" class="sm:ml-6 box p-3 sm:w-1/4">
        {{ cardList[selected].name }}

        <div
          v-for="(effect, idx2) in cardList[selected].effects"
          :key="idx2"
          class="box-2 mt-6 p-2 flex-col"
        >
          <div class="">
            {{ effect.count }}
          </div>

          <div class="">
            {{ effect.keywords[0] }}
          </div>

          <div class="">
            {{ effect.text }}
          </div>
        </div>
      </div>

      <div class="hidden sm:flex flex-col ml-6 w-1/6">
        <div class="box mb-6 p-2" @click="getStorage(storageStatus)">
          {{ storageStatus }}
        </div>
        <div class="box mb-6 p-2" @click="submit()">更新</div>
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
      newCards: [
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
              keywords: ['侵略'],
              text: '10IP消費する。相手は侵略持ちを好きなだけ疲労させる。その後、疲労していない相手のカードの数だけ同種を獲得する。相手の反応持ちの数だけIPを獲得する。',
            },
            {
              count: 3,
              keywords: ['勝利'],
              text: '同種を10枚所持している時。',
            },
          ],
        },
      ],

      cardList: [],
      selected: 0,
    }
  },
  watch: {
    cards() {
      this.cardList = this.deepCopy(this.cards)
      this.cardList = this.cardList.concat(this.deepCopy(this.newCards))
    },
  },
  mounted() {
    this.cardList = this.cardList.concat(this.deepCopy(this.newCards))
    console.log(this.deepCopy(this.newCards))
  },
  methods: {
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
  },
}
</script>
<style scoped>
#cards {
  color: rgb(207, 207, 207);
  background: rgb(32, 32, 32);
  height: 100vh;
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
</style>
