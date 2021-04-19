import React, { useEffect } from 'react'
import { withRouter } from 'react-router'
import { observer, useValue, model } from 'startupjs'
import { Div, Span, Row, Pagination } from '@startupjs/ui'
import { faHandRock, faHandScissors, faHandPaper, faRunning } from '@fortawesome/free-solid-svg-icons'

import { GAMES_COLLECTION } from '../../const/default'

import './index.styl'

const StatList = ({ gameId }) => {
  let [skip, $skip] = useValue(0)
  let [pages, $skips] = useValue(0)
  let [limit, $limit] = useValue(0)
  let [game, $game] = useValue({})
  let [rounds, $rounds] = useValue([])
  let [players, $players] = useValue([])
  let [loading, $loading] = useValue(false)

  useEffect(() => {
    $loading.set(true)
    const $obj = model.scope(`${GAMES_COLLECTION}.${gameId}`)
    $obj.fetchStat(skip).then(({ data, rounds, players, roundCount, limit }) => {
      $game.set(data)
      $players.set(players)
      $rounds.set(rounds)
      $limit.set(limit)
      $skips.set(Math.ceil(roundCount / limit))
    }).finally(() => {
      $loading.set(false)
    })
  }, [skip])

  const onChangePage = val => {
    $skip.set(val * limit)
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
      if (loading)
        Span #{'Loading...'}
      if (players.length)
        Div.results
          Row.row
            Div.cell Player 1:
            Div.cell #{players[0].name}
            Div.cell #{game.results[players[0].id]}
          Row.row
            Div.cell Player 2:
            Div.cell #{players[1].name}
            Div.cell #{game.results[players[1].id]}
        Row.pagination
          Pagination(pages=pages limit=limit $skip=$skip onChangePage=onChangePage)
        Row.deka
          Row.row
            Div.cell #{'#'}
            Div.cell #{players[0].name}
            Div.cell #{players[1].name}
            Div.cell Total
          each round, index in rounds
            Row.row
              Div.cell #{skip + index + 1}
              Div.cell #{renderType(round.players[players[0].id].type)}
                Span.score #{round.players[players[0].id].score}
              Div.cell #{renderType(round.players[players[1].id].type)}
                Span.score #{round.players[players[1].id].score}
              Div.cell #{round.players[players[0].id].scoreAll} #{'-'} #{round.players[players[1].id].scoreAll}
  `
}
export default withRouter(observer(StatList))
