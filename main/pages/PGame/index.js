import React, { useEffect, useState } from 'react'
import { Div } from '@startupjs/ui'
import Game from 'components/Game'
import PageSlogan from 'components/PageSlogan'

import './index.styl'

const PGame = () => {
  return pug`
    Div.root
      PageSlogan(text='GAME')
      Game
  `
}
export default PGame
