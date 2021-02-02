import React from 'react'
import { H1 } from '@startupjs/ui'

import './index.styl'

const Title = ({ children }) => pug`
  H1.root
    =children
`

export default Title
