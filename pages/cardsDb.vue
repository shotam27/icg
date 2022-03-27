<template>
  <div id="cards">
    <div class="sm:flex p-4 h-2/3">
      <div
        v-if="selectedEffectSwitch === false"
        class="box flex mb-5 flex-wrap"
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
        <div class="flex mb-2">
          <div class="m-1">
            {{ selectedEffect.cid }}
          </div>
          <div class="m-1">
            {{ selectedEffect.cname }}
          </div>
          <div class="m-1">-{{ selectedEffect.eid }}</div>
          <div class="m-1">-{{ selectedEffect.efs }}</div>
        </div>

        <div class="flex">
          <input
            v-model.number="selectedEffect.efs[0]"
            type="number"
            class="mx-2 px-2 w-1/6 flex justify-center text-black box"
          />
          <input
            v-model="selectedEffect.efs[1]"
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
      effects: [],
      newCards: [],

      cardList: [],
      selected: 0,
      selectedEffectSwitch: false,
      selectedEffect: {
        cid: 0,
        eid: 0,
        cname: '',
        efs: [1, 0],
      },
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
      const send = { cname: info.cname, efs: info.efs }
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
  color: rgb(207, 207, 207);
  background: rgb(32, 32, 32);
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
