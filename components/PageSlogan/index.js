import React from 'react'
import { Div, Span } from '@startupjs/ui'

import './index.styl'

const PageSlogan = ({ text }) => pug`
  Div.root
    Span.text #{text}
`
export default PageSlogan
