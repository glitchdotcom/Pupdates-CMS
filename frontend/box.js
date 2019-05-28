import React from 'react'
import styled from '@emotion/styled'

const sizes = ['0', '0.25rem', '0.5rem', '1rem', '2rem', '4rem']

function parseSize (size) {
  if (!size) {
    return '0'
  }
  if (typeof size === 'number') {
    return `${sizes[size] || 0}`
  }
  if (size.x || size.y) {
    return `${sizes[size.y] || 0} ${sizes[size.x] || 0}`
  }
  return `${sizes[size.top] || 0} ${sizes[size.right] || 0} ${sizes[size.bottom] || 0} ${sizes[size.left] || 0}`
}

const Box = styled.div`
  padding: ${(props) => parseSize(props.padding)};
`

export default Box
