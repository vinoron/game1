import React from 'react'
import { Div } from '@startupjs/ui'
import PageSlogan from 'components/PageSlogan'
import GameList from 'components/GameList'

import './index.styl'

const PPastAdminGames = () => {
  return pug`
    Div.root
      PageSlogan(text=('PAST GAMES'))
      GameList(mode="admin" active=false)
  `
}
export default PPastAdminGames
