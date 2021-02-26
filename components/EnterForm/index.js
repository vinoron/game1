import React, { useState } from 'react'
import uuid from 'uuid'
import { Div, Link, Checkbox, Button } from '@startupjs/ui'
import { withRouter } from 'react-router'
import { useLocal, observer } from '@startupjs/react-sharedb'
import Title from 'components/Title'

import './index.styl'

const EnterForm = ({ id, history }) => {
  const [adminFlag, setAdminFlag] = useState(false)
  const [user, $user] = useLocal('$game.user')

  const onEnter = () => {
    if (adminFlag) {
      history.push('/admin')
    } else {
      history.push('/games')
      if (!user) {
        $user.set({ id: uuid(), name: '' })
      }
    }
  }

  return pug`
    Div.root
      Title Let's start!
      Div.check
        Checkbox(label='Enter as admin' value=adminFlag onChange=setAdminFlag)
      Div.enter
        Button.button(onClick=onEnter variant='flat') #{'ENTER'}
  `
}
export default withRouter(observer(EnterForm))
