import { BaseModel } from 'startupjs/orm'

export default class GamesModel extends BaseModel {
  async create (fields) {
    const id = this.id()
    const obj = this.scope(`${this.getCollection()}.${id}`)
    await obj.createAsync({
      ...fields,
      createdAt: Date.now(),
      players: [],
      rounds: [],
      results: [],
      startedAt: null,
      finishedAt: null
    })
    return id
  }
}
