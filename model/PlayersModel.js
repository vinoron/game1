import { BaseModel } from 'startupjs/orm'

export default class PlayersModel extends BaseModel {
  async addUser (data, sessionUserId) {
    await this.add({
      id: sessionUserId,
      ...data,
      created: Date.now()
    })
    return this.id()
  }
}
