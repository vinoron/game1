import React from 'react'
import { Div } from '@startupjs/ui'
import PageSlogan from 'components/PageSlogan'
import Highscores from 'components/Highscores'

import './index.styl'

const PHighscores = () => {
  return pug`
    Div.root
      PageSlogan(text=('HIGHSCORES'))
      Highscores
  `
}
export default PHighscores
