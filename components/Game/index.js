import React, { useCallback, useEffect, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { Icon, Alert, Div, Span, Row, Pagination, Select, Button, H3, Tag, Link, Avatar, Hr, TextInput, Multiselect } from '@startupjs/ui'
import { observer, useValue, useQuery, useLocal, useDoc } from '@startupjs/react-sharedb'
import { withRouter } from 'react-router'
import uuid from 'uuid'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'
import { BASE_URL } from '@env'

import { GAMES_COLLECTION, ROUNDS_COLLECTION, PAGE_LIMITS } from '../../const/default'

import './index.styl'

const Game = ({ match: { params }, history }) => {
  const [userId] = useLocal('_session.userId')
  const [game, $game] = useDoc(GAMES_COLLECTION, params.id)
  const [alertMessage, $alertMessage] = useValue('')
  const [currentRoundIndex, $currentRoundIndex] = useValue(game && (game.rounds.length - 1))
  const roundId = game && game.rounds[currentRoundIndex]
  const [round, $round] = useDoc(ROUNDS_COLLECTION, roundId)
  const lobbyFull = game && game.players.length > 1

  if (game && !game.players.includes(userId) && lobbyFull) {
    return pug`
      Div.gameStatus #{'YOU HAVE NOT ACCESS TO PLAY THIS GAME, TRY ANOTHER'}
    `
  }

  const isJoined = game && game.players.includes(userId)

  const enemyId = game && (game.players[0] === userId ? game.players[1] : game.players[0])
  const yourMove = game && round && round.players && round.players[userId] && round.players[userId].type

  const onJoin = () => {
    if (game.players.length === 0) {
      $game.setEach({ players: [userId] })
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
      const newRoundId = uuid()
      $round.createByFirstMove(newRoundId, game.id, userId, enemyId, type)
      // create new round
      $game.setEach({
        rounds: [...game.rounds, newRoundId]
      })
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
                Div.row
                  Div.headcell #{'Round'}
                  Div.cell #{currentRoundIndex + 1}
                if (round && round.finished)
                  Div.row
                    Div.headcell #{'Your move'}
                    Div.cell #{renderType(round.players[userId].type)}
                  Div.row
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
                    Div.types
                      Button.type(onClick=onSelect('O') iconPosition='center') #{renderType('O')}
                      Button.type(onClick=onSelect('V') iconPosition='center') #{renderType('V')}
                      Button.type(onClick=onSelect('I') iconPosition='center') #{renderType('I')}
                      Button.capitulate(onClick=onSelect('C') iconPosition='center') #{renderType('C')}
        Div.gameInfo
          Div.row
            Div.headcell #{'Game Name'}
            Div.cell #{game.name}
          Div.row
            Div.headcell #{'Game Author'}
            Div.cell #{game.creatorName}
          if (round && round.finished)
            Div.row
              Div.headcell #{'Your score'}
              Div.cell #{round.players[userId].scoreAll || 0}
            Div.row
              Div.headcell #{'Your opponent score'}
              Div.cell #{round.players[enemyId].scoreAll || 0}
  `
}
export default withRouter(observer(Game))
