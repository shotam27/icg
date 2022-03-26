<script>
export default {
  data() {
    return {
      fields: [],
      gameVals: [],
      selected: [],
    }
  },
  mounted() {
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
}
</script>
