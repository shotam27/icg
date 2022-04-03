/* eslint-disable require-jsdoc */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp(functions.config().firebase);

exports.resetGame = functions.database.ref("resetFlag")
    .onUpdate(() => {
      let cards = [];
      admin.database().ref("cards").once("value", (snapshot) => {
        cards = snapshot.val();
      });
      console.log(cards.length);

      const init = [
        {"name": "Player1"},
        {"name": "中立", "cards": []},
        {"name": "Player2"},
        {"name": "追放"}];
      let max = cards.length;
      if (max === 0) {
        max = 23;
      }
      const newCids = difRandoms(max, 6);
      for (let i = 0; i <= 5; i++) {
        const newCard = {cid: newCids[i], tired: false};
        init[1].cards.push(newCard);
      }
      admin.database().ref("gameVals/logNo").set(1);
      return admin.database().ref("fields").set(init);
    });


// nの中からm個数字を選別
function difRandoms(max, m) {
  const randoms = [];
  const times = m - 1;
  for (let i = 0; i <= times; i++) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const tmp = Math.floor(Math.random() * max);
      if (!randoms.includes(tmp)) {
        randoms.push(tmp);
        break;
      }
    }
  }
  return randoms;
}
