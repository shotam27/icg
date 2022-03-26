<template>
  <div class="">相手を疲労させる</div>
</template>

<script scoped>
export default {
  data() {
    return {
      effectFlag: 0,
      effVals: {
        cid: 0,
        eNo: 0,
        eId: 0,
      },
    }
  },
  watch: {
    effectFlag(ePhase) {
      if (ePhase === 1) {
        require()
      }
    },
  },
}
</script>
