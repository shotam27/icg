<template>
  <div class="">
    <div class="">
      {{ myflag }}
    </div>

    <div class="c-3 flex justify-center" @click="phaseIncrement()">送信</div>
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
      try {
        e = this.effects[n[1]][n[2]].efs
      } catch (error) {
        e = [0, 0]
      }
      if (e[0] === 1) {
        this.eTire(n[0])
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
    tire(fid, pid) {
      this.$fire.database
        .ref('fields/' + fid + '/cards/' + pid + '/tired')
        .set(true)
    },
    eTire(p) {
      if (p === 1) {
        this.message = '疲労させるカードを選んでください。'
      }
      if (p === 2) {
        const pid = this.selected.cardPlace
        this.tire(this.opfid, pid)
        this.message = ''
        this.effectEnd()
      }
    },
  },
}
</script>
