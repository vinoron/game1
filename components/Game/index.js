import React from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, useSession, useDoc, useModel } from 'startupjs'
import { Alert, Div, Span, Button, Row } from '@startupjs/ui'
import uuid from 'uuid'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'

import { GAMES_COLLECTION, ROUNDS_COLLECTION } from '../../const/default'

import './index.styl'

const Game = ({ match: { params }, history }) => {
  const [userId] = useSession('userId')
  const [game, $game] = useDoc(GAMES_COLLECTION, params.id)
  const [alertMessage, $alertMessage] = useValue('')
  const [currentRoundIndex, $currentRoundIndex] = useValue(game && (game.rounds.length - 1))
  const roundId = game && game.rounds[currentRoundIndex]
  const [round, $round] = useDoc(ROUNDS_COLLECTION, roundId)
  const $rounds = useModel(ROUNDS_COLLECTION)
  const lobbyFull = game && game.players.length > 1

  if (game && !game.players.includes(userId) && lobbyFull) {
    return pug`
      Span.gameStatus #{'YOU HAVE NOT ACCESS TO PLAY THIS GAME, TRY ANOTHER'}
    `
  }

  const isJoined = game && game.players.includes(userId)

  const enemyId = game && game.players.find(id => id !== userId)
  const yourMove = game && round && round.players && round.players[userId] && round.players[userId].type

  const onJoin = () => {
    if (game.players.length === 0) {
      $game.set('players', [userId])
      return
    }
    if (game.players.length === 1 && !isJoined) {
      $game.setEach({
        players: [...game.players, userId],
        startedAt: Date.now()
      })
      return
    }
    if (game.players.length === 2) {
      $alertMessage.set('Lobby is full, please select another game')
    }
  }

  const onSelect = (type) => async () => {
    if (game.finishedAt) return
    if (!game.rounds[currentRoundIndex]) {
      const newRoundId = await $rounds.createByFirstMove(game.id, userId, enemyId, type)
      // create new round
      $game.set('rounds', [...game.rounds, newRoundId])
    } else if (!round.finished) {
      // add to exists round and count scores
      const previousRoundId = currentRoundIndex > 0 && game.rounds[currentRoundIndex - 1]
      await $round.setSecondMove(roundId, userId, enemyId, type, previousRoundId)
    }
  }

  const onNextRound = () => {
    $currentRoundIndex.set(currentRoundIndex + 1)
  }

  const renderType = type => {
    const map = {
      O: pug` Icon(icon=faHandRock)`,
      V: pug` Icon(icon=faHandScissors)`,
      I: pug` Icon(icon=faHandPaper)`,
      C: pug` Icon(icon=faRunning)`
    }
    return map[type]
  }

  return pug`
    Div.root
      Div.game
        if (alertMessage)
          Alert(variant='warning') #{'alertMessage'}  
        if (!game)
          Div.gameStatus #{'GAME NOT FOUND'}
        else 
          if (game.finishedAt > 0)
            Div.gameStatus #{'GAME FINISHED'}
          else
            if (!lobbyFull)
              if (isJoined)
                Div.gameStatus #{'You are joined. Waiting another player'}
              else
                Button(onClick=onJoin variant='flat') #{'Join'}
            else
              Div.gameStatus #{'GAME STARTED!'}
              Div.gameInfo
                Row.row
                  Div.headcell #{'Round'}
                  Div.cell #{currentRoundIndex + 1}
                if (round && round.finished)
                  Row.row
                    Div.headcell #{'Your move'}
                    Div.cell #{renderType(round.players[userId].type)}
                  Row.row
                    Div.headcell #{'Your opponent move'}
                    Div.cell #{renderType(round.players[enemyId].type)}
                  Div.result
                    if (round.players[userId].score > round.players[enemyId].score)
                      Div.win #{'YOU WIN!'}
                    else if (round.players[userId].score < round.players[enemyId].score)
                      Div.lose #{'YOU LOSE!'}
                    else
                      Div.draw #{'DRAW!'}
                    Button.type(onClick=onNextRound) #{'NEXT'}
                else
                  if yourMove
                    Div
                      Span #{'Your choice'}
                      Span #{renderType(yourMove)}
                    Div.gameStatus #{'You are moved in this round. Waiting another player'}
                  else
                    Row.types
                      Button.type(onClick=onSelect('O') iconPosition='center' icon=renderType('O'))
                      Button.type(onClick=onSelect('V') iconPosition='center' icon=renderType('V'))
                      Button.type(onClick=onSelect('I') iconPosition='center' icon=renderType('I'))
                      Button.capitulate(onClick=onSelect('C') iconPosition='center' icon=renderType('C'))
        Div.gameInfo
          Row.row
            Div.headcell #{'Game Name'}
            Div.cell #{game.name}
          Row.row
            Div.headcell #{'Game Author'}
            Div.cell #{game.creatorName}
          if (round && round.finished)
            Row.row
              Div.headcell #{'Your score'}
              Div.cell #{round.players[userId].scoreAll || 0}
            Row.row
              Div.headcell #{'Your opponent score'}
              Div.cell #{round.players[enemyId].scoreAll || 0}
  `
}
export default withRouter(observer(Game))
