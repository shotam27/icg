<template>
  <div class="p-4">
    <div v-if="selectedRoomId === 9999" class="text-white">
      <div class="text-xl">マッチングルーム</div>
      <hr />

      <div v-for="(room, idx) in rooms" :key="idx" class="p-4">
        <div class="mb-2 text-lg">Room {{ idx }}</div>
        <div class="">Player1</div>
        <div v-if="room.player1 === true" class="ml-2">OCCUPIED</div>
        <div class="ml-2" @click="enterRoom(idx, 0)">ENTER</div>
        <div class="">Player2</div>
        <div v-if="room.player1 === true" class="ml-2">OCCUPIED</div>
        <div class="ml-2" @click="enterRoom(idx, 1)">ENTER</div>
      </div>
    </div>

    <div v-if="selectedRoomId < 9999 && matched === false" class="">
      <div class="">対戦相手が入室するまでお待ちください。。。</div>

      <div class="m-2">退室</div>
    </div>

    <GameComponent
      v-else
      :myno="myno"
      :opno="opno"
      :myfid="myfid"
      :opfid="opfid"
      :rid="selectedRoomId"
    />
  </div>
</template>
<script>
import GameComponent from '~/components/GameComponent'

export default {
  components: {
    GameComponent,
  },
  data() {
    return {
      rooms: [],
      selectedRoomId: 9999,
      matched: false,
      myno: 0,
      opno: 1,
      myfid: 0,
      opfid: 2,
    }
  },
  mounted() {
    this.$fire.database.ref('rooms').on('value', (snapshot) => {
      this.rooms = snapshot.val()
    })
  },

  methods: {
    bookRoom(room, pno) {
      this.entered = !this.entered
      if (pno === 0) {
        this.myno = 0
        this.myfid = 0
        this.opno = 1
        this.myfid = 2
      } else {
        this.opno = 0
        this.opfid = 0
        this.myno = 1
        this.myfid = 2
      }
      this.$fire.database.ref('rooms/' + room + '/' + pno).set(true)
      this.selectedRoomId = this.room
    },
  },
}
</script>
