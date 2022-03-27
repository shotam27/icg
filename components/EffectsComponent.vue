<script>
export default {
  props: ['hoge1', 'hoge2'],
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
  },
}
</script>
