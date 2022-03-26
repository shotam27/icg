<template>
  <div class="">
    <div class="" @click="resetFlag()">reset:{{ count }}</div>
    <div class="">
      {{ counts }}
    </div>
    <div class="">
      {{ onoff }}
    </div>

    <div class="">
      {{ fields }}
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      count: 0,
      onoff: false,
      fields: [],
    }
  },
  mounted() {
    this.$fire.database.ref('count').on('value', (snapshot) => {
      this.count = snapshot.val()
    })
    this.$fire.database.ref('counts').on('value', (snapshot) => {
      this.counts = snapshot.val()
    })
    this.$fire.database.ref('fields').on('value', (snapshot) => {
      this.fields = snapshot.val()
    })
  },
  methods: {
    countUp() {
      this.count++
      this.$fire.database.ref('count').set(this.count)
    },
    resetFlag() {
      this.onoff = !this.onoff
      this.$fire.database.ref('resetFlag').set(this.onoff)
    },
  },
}
</script>
