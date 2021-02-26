import React from 'react'
import { withRouter } from 'react-router'
import { Div } from '@startupjs/ui'

import PageSlogan from 'components/PageSlogan'
import CreateGameForm from 'components/CreateGameForm'

import './index.styl'

const PCreateGame = ({ match: { params } }) => {
  return pug`
    Div.root
      PageSlogan(text='BUILD IT!')
      CreateGameForm(id=params.id)

  `
}
export default withRouter(PCreateGame)
