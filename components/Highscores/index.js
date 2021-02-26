import React from 'react'
import { Div, Span } from '@startupjs/ui'
import { useQuery } from '@startupjs/react-sharedb'
import moment from 'moment'

import { GAMES_COLLECTION } from '../../const/default'

import './index.styl'

const HIGHSCORE_LIMIT = 5

const Highscores = () => {
  const query = {
    finishedAt: { $gt: 0 },
    $orderby: { 'winner.score': -1 },
    'winner.score': { $gt: 0 },
    $limit: HIGHSCORE_LIMIT
  }

  let [games] = useQuery(GAMES_COLLECTION, query)

  return pug`
    Div.root
      each game in games
        Div.row
          Div.cell #{game.winner.name}
          Div.cell #{game.name}
          Div.cell #{game.winner.score}
          Div.cell #{moment(game.finishedAt).format('MMMM Do YYYY, h:mm:ss a')}
  `
}
export default Highscores
