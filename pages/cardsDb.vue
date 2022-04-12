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

        <div class="flex mt-2">
          <input
            v-model.number="selectedEffect.related"
            type="number"
            class="mx-2 px-2 w-1/6 flex justify-center text-black box"
          />

          <div class="box mx-2 px-2" @click="sendRelated()">更新</div>
        </div>
      </div>

      <div v-if="cardList.length > 0" class="sm:ml-6 box p-3 sm:w-1/4 mb-5">
        <div class="">{{ selected }} : {{ cardList[selected].name }}</div>

        <div class="text-xs">関連：{{ getRelated }}</div>

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
      relatedCards: [],
      effects: [],
      newCards: [],

      cardList: [],
      selected: 0,
      selectedEffectSwitch: false,
      selectedEffect: {
        cid: 0,
        eid: 0,
        cname: '',
        efs: [0, 0, 99],
        related: 0,
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
    getRelated() {
      let r = '関連カードなし'
      try {
        const rcid = this.relatedCards[this.selected][0]
        r = this.cardList[rcid].name
      } catch (error) {}
      return r
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
    this.$fire.database.ref('relatedCards').on('value', (snapshot) => {
      this.relatedCards = snapshot.val()
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
    sendRelated() {
      const info = this.selectedEffect
      this.$fire.database
        .ref('relatedCards/' + info.cid + '/0')
        .set(info.related)
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
