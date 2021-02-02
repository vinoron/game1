import { BaseModel } from 'startupjs/orm'

export default class PlayerModel extends BaseModel {
  async create ({ id, name }) {
    const obj = this.scope(`${this.getCollection()}.${id}`)
    await obj.createAsync({ name, created: Date.now() })
  }
}
