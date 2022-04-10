<template>
  <div class="">
    <div class="p-4">
      <div v-if="selectedRoomId === 9999" class="text-white">
        <div class="flex justify-between items-end">
          <div class="text-xl">ルームマッチング</div>

          <div class="" @click="resetRoom">reset</div>
        </div>

        <hr />

        <div v-for="(room, idx) in rooms" :key="idx" class="p-4">
          <div class="flex contents-center">
            <div class="mb-2 text-lg whitespace-nowrap mr-4">
              Room {{ idx }}
            </div>

            <hr />
          </div>

          <div
            v-for="(player, idx2) in room.availability"
            :key="idx2"
            class="p-2"
          >
            <div class="">Player {{ idx2 + 1 }}</div>
            <div
              v-if="player === true"
              class="ml-2 text-red-200"
              @click="enterRoom(idx, idx2)"
            >
              OCCUPIED
            </div>
            <div
              v-else
              class="ml-2 text-green-200"
              @click="enterRoom(idx, idx2)"
            >
              ENTER
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedRoomId < 9999 && getIsGameMade === false" class="">
        <GameInitComponent
          :rooms="rooms"
          :myno="myno"
          :rid="selectedRoomId"
          :matched="matched"
        />

        <div class="m-2" @click="changeRoom(selectedRoomId, false)">退室</div>
      </div>
    </div>

    <GameComponent
      v-if="getIsGameMade === true"
      :myno="myno"
      :opno="opno"
      :myfid="myfid"
      :opfid="opfid"
      :rid="selectedRoomId"
      :game="rooms[selectedRoomId].game"
      :clphase="rooms[selectedRoomId].game.gameVals.pVals[myno].phase"
    />
  </div>
</template>
<script>
import GameComponent from '~/components/GameComponent'
import GameInitComponent from '~/components/GameInitComponent'

export default {
  components: {
    GameComponent,
    GameInitComponent,
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
      initRoom: {
        0: { availability: { 0: false, 1: false }, game: false },
        1: { availability: { 0: false, 1: false }, game: false },
        2: { availability: { 0: false, 1: false }, game: false },
      },
    }
  },
  computed: {
    getIsGameMade() {
      let r = false
      try {
        if (this.rooms[this.selectedRoomId].game !== false) {
          r = true
        }
      } catch (error) {
        r = false
      }
      return r
    },
  },
  mounted() {
    this.$fire.database.ref('rooms').on('value', (snapshot) => {
      this.rooms = snapshot.val()
    })
  },

  methods: {
    resetRoom() {
      this.$fire.database.ref('rooms').set(this.initRoom)
    },
    changeRoom(room, enterOrNot) {
      this.$fire.database
        .ref('rooms/' + room + '/availability/' + this.myno)
        .set(enterOrNot)
      this.selectedRoomId = room
      if (enterOrNot) {
        this.$fire.database
          .ref('rooms/' + room + '/availability/' + this.opno)
          .on('value', (snapshot) => {
            this.matched = snapshot.val()
          })
      } else {
        this.$fire.database
          .ref('rooms/' + room + '/availability/' + this.opno)
          .off()
        this.matched = false
        this.selectedRoomId = 9999
      }
    },
    enterRoom(room, pno) {
      if (pno === 0) {
        this.myno = 0
        this.myfid = 0
        this.opno = 1
        this.opfid = 2
      } else {
        this.opno = 0
        this.opfid = 0
        this.myno = 1
        this.myfid = 2
      }
      this.changeRoom(room, true)
    },
  },
}
</script>
