import { BaseModel } from 'startupjs/orm'
import { ROUNDS_COLLECTION, PLAYERS_COLLECTION } from '../const/default'

const ROUND_PAGE_LIMIT = 10

export default class GameModel extends BaseModel {
  async fetchStat (skip = 0) {
    const data = this.get()
    const page = Math.floor(skip / ROUND_PAGE_LIMIT)
    const roundsIdSlicedByPage = data.rounds.slice(page * ROUND_PAGE_LIMIT, (page + 1) * ROUND_PAGE_LIMIT)

    const $players = this.query(PLAYERS_COLLECTION, { _id: { $in: data.players } })
    await $players.fetchAsync()
    const players = $players.get()

    const $rounds = this.query(ROUNDS_COLLECTION, { _id: { $in: roundsIdSlicedByPage }, $orderby: { startedAt: 1 } })
    await $rounds.fetchAsync()
    const rounds = $rounds.get()
    const roundCount = data.rounds.length
    return { data, rounds, roundCount, players, limit: ROUND_PAGE_LIMIT }
  }

  async finish () {
    const data = this.get()
    const playersScore = {}
    const $lastRound = this.scope(`${ROUNDS_COLLECTION}.${data.rounds[data.rounds.length - 1]}`)
    await $lastRound.fetchAsync()
    let lastRound = $lastRound.get()
    // если прервали раунд, берем предпоследний
    if (!lastRound.finished) {
      const roundIndex = data.rounds.length - 2
      if (roundIndex >= 0) {
        const $prevLastRound = this.scope(`${ROUNDS_COLLECTION}.${data.rounds[roundIndex]}`)
        await $prevLastRound.fetchAsync()
        lastRound = $prevLastRound.get()
      }
    }

    if (lastRound.finished) {
      playersScore[data.players[0]] = lastRound.players[data.players[0]].scoreAll
      playersScore[data.players[1]] = lastRound.players[data.players[1]].scoreAll
    }

    const $players = this.query(PLAYERS_COLLECTION, { _id: { $in: data.players } })
    await $players.fetchAsync()
    const players = $players.get()

    let winnerId = ''
    if (playersScore[data.players[0]] > playersScore[data.players[1]]) {
      winnerId = data.players[0]
    }
    if (playersScore[data.players[0]] < playersScore[data.players[1]]) {
      winnerId = data.players[1]
    }
    // для highscore
    const winner = {
      id: winnerId,
      score: winnerId ? playersScore[winnerId] : 0,
      name: players.find(p => p.id === winnerId).name
    }
    await this.setEach({ finishedAt: Date.now(), results: playersScore, winner })
  }
}
