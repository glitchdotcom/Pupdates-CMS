import React from 'react'
import styled from '@emotion/styled'

const sizes = ['0', '0.25rem', '0.5rem', '1rem', '2rem', '4rem']

const Box = styled.div`
  padding: ${({ padding: { top, right, bottom, left } = {} }) => 
    `${sizes[top] || 0} ${sizes[right] || 0} ${sizes[bottom] || 0} ${sizes[left] || 0}`};
`

export default Box
