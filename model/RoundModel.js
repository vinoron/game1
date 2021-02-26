import { BaseModel } from 'startupjs/orm'
import uuid from 'uuid'

export default class RoundModel extends BaseModel {
  async createByFirstMove (id, gameId, userId, enemyId, type) {
    const obj = this.scope(`${this.getCollection()}.${id}`)
    await obj.createAsync({
      gameId: gameId,
      createdAt: Date.now(),
      finishedAt: null,
      finished: false,
      players: {
        [userId]: { type },
        [enemyId]: {}
      },
      winner: '',
      comboFor: '',
      comboValue: 0
    })
  }

  async setSecondMove (id, userId, enemyId, type, previousRoundId) {
    const $previousRound = this.scope(`${this.getCollection()}.${previousRoundId}`)
    await this.fetchAsync($previousRound)
    const previousRound = $previousRound.get()
    const $round = this.scope(`${this.getCollection()}.${id}`)
    await this.fetchAsync($round)
    const round = $round.get()
    round.players[userId] = { type }
    round.finished = true
    round.finishedAt = Date.now()

    const enemyMove = round.players[enemyId].type
    let winner = ''
    if (type !== enemyMove) {
      switch (type) {
        case 'C':
          winner = enemyId
          break
        case 'V':
          winner = enemyMove === 'I' ? userId : enemyId
          break
        case 'O':
          winner = enemyMove === 'V' ? userId : enemyId
          break
        case 'I':
          winner = enemyMove === 'O' ? userId : enemyId
          break
      }
    }

    const isDraw = winner === ''
    const previousComboFor = previousRound ? previousRound.comboFor : ''
    const previousComboValue = previousRound ? previousRound.comboValue : 0
    const isCombo = previousComboFor === winner

    let winnerScore = 0
    if (winner) {
      if (!previousRound || (previousRound && previousRound.winner !== winner) ) {
        winnerScore = 1
      }
      if (isCombo) {
        winnerScore = previousComboValue
      }
    }

    round.winner = winner
    round.comboFor = isDraw ? previousComboFor : winner

    const userScore = userId === winner ? winnerScore : 0
    const userScoreAll = previousRound ? previousRound.players[userId].scoreAll + userScore : userScore
    round.players[userId].score = userScore
    round.players[userId].scoreAll = userScoreAll

    const enemyScore = enemyId === winner ? winnerScore : 0
    const enemyScoreAll = previousRound ? previousRound.players[enemyId].scoreAll + enemyScore : enemyScore
    round.players[enemyId].score = enemyScore
    round.players[enemyId].scoreAll = enemyScoreAll

    round.comboValue = isDraw ? previousComboValue : (winner === userId ? userScoreAll : enemyScoreAll)

    return $round.setEachAsync('', {
      ...round
    })
  }
}
