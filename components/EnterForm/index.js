import React, { useState } from 'react'
import { withRouter } from 'react-router'
import { useLocal, observer } from 'startupjs'
import { Div, Checkbox, Button } from '@startupjs/ui'
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
        $user.set({ name: '' })
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
