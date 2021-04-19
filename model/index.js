import Players from './PlayersModel'
import Game from './GameModel'
import Games from './GamesModel'
import Rounds from './RoundsModel'
import Round from './RoundModel'
import { GAMES_COLLECTION, PLAYERS_COLLECTION, ROUNDS_COLLECTION } from '../const/default'

export default function (racer) {
  racer.orm(`${PLAYERS_COLLECTION}`, Players)
  racer.orm(`${GAMES_COLLECTION}`, Games)
  racer.orm(`${GAMES_COLLECTION}.*`, Game)
  racer.orm(`${ROUNDS_COLLECTION}`, Rounds)
  racer.orm(`${ROUNDS_COLLECTION}.*`, Round)
}
