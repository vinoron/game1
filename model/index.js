import Player from './PlayerModel'
import Game from './GameModel'
import Round from './RoundModel'
import { GAMES_COLLECTION, PLAYERS_COLLECTION, ROUNDS_COLLECTION } from '../const/default'

export default function (racer) {
  racer.orm(`${PLAYERS_COLLECTION}.*`, Player)
  racer.orm(`${GAMES_COLLECTION}.*`, Game)
  racer.orm(`${ROUNDS_COLLECTION}.*`, Round)
}
