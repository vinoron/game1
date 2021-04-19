import React from 'react'

import { withRouter } from 'react-router'
import { observer, useValue, useQuery, useSession, model } from 'startupjs'
import { Div, Row, Pagination, Select, Button } from '@startupjs/ui'
import moment from 'moment'


import StatList from 'components/StatList'

import { GAMES_COLLECTION, PAGE_LIMITS } from '../../const/default'

import './index.styl'

const GameList = ({ mode = 'user', active = true, history }) => {
  const [userId] = useSession('userId')
  let [skip, $skip] = useValue(0)
  let [limit, $limit] = useValue(PAGE_LIMITS[0])
  let [openedStatGameId, $openedStatGameId] = useValue(0)

  const query = { $skip: skip, $limit: limit }

  if (!active) {
    query.finishedAt = { $gt: 0 }
  } else {
    query.finishedAt = null
  }
  if (mode === 'user') {
    // найти игры в которых не начата игра, или не закончена
    query.$or = [{ players: { $in: [userId] } }, { $where: 'this.players.length < 2' }]
  }

  let [games] = useQuery(GAMES_COLLECTION, query)
  let [count] = useQuery(GAMES_COLLECTION, { $count: 1 })
  const pages = Math.ceil(count / limit)

  const onChangePage = val => {
    $skip.set(val * limit)
  }
  const onSetLimit = val => {
    $skip.set(0)
    $limit.set(val)
  }

  const onJoin = gameId => () => {
    history.push(`/games/${gameId}`)
  }

  const onFinish = gameId => async () => {
    const $game = model.scope(`${GAMES_COLLECTION}.${gameId}`)
    await $game.finish()
  }

  const toggleStat = gameId => async () => {
    if (openedStatGameId === gameId) {
      $openedStatGameId.set(0)
    } else {
      $openedStatGameId.set(gameId)
    }
  }

  return pug`
    Div.root
      Row.pagination
        Pagination(pages=pages limit=limit $skip=$skip onChangePage=onChangePage)
        Select(
          value=limit
          showEmptyValue=false
          onChange=onSetLimit
          options=PAGE_LIMITS.map(l => ({ label: l, value: l }))
        )
      Row.deka
        Row.row
          Div.cell Name
          Div.cell Created At
          if (active)
            Div.cell Players
          Div.cell Creator Name
          if (mode === 'user')
            Div.gameJoin
        each game in games
          Row.row
            Div.cell #{game.name}
            Div.cell #{moment(game.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
            if (active)
              Div.cell #{game.players.length}
            Div.cell #{game.creatorName}
            if (!active)
              Div.cell
                Button(onClick=(toggleStat(game.id))) #{openedStatGameId === game.id ? 'CLOSE' : 'OPEN'} #{'STAT'}
            else if (mode === 'user')
              Div.cell
                Button(onClick=(onJoin(game.id))) JOIN
            else if (mode === 'admin')
              Div.cell
                Button(onClick=(onFinish(game.id))) FINISH
          if (openedStatGameId === game.id)
            Div.stat
              StatList(gameId=openedStatGameId)
  `
}
export default withRouter(observer(GameList))
