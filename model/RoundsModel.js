import { BaseModel } from 'startupjs/orm'

export default class RoundsModel extends BaseModel {
  async createByFirstMove (gameId, userId, enemyId, type) {
    const id = this.id()
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
    return id
  }
}
