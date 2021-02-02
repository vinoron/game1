import React from 'react'
import { Div } from '@startupjs/ui'
import PageSlogan from 'components/PageSlogan'
import EnterForm from 'components/EnterForm'

import './index.styl'

const PHome = () => {
  return pug`
    Div.root
      PageSlogan(text='HOME')
      EnterForm
  `
}
export default PHome
