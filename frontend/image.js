import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'

import Box, { Flex } from './box'
import Input from './input'



const BaseImage = styled.img`
  display: block;
  max-width: 100%;
`

const Image = ({ src, defaultSrc, ...props }) => {
  const [didError, setDidError] = useState(src)
  useEffect(() => { setDidError(false) }, [src])
  const onError = () => { setDidError(true) }
  const usedSrc = didError ? defaultSrc : src
  return <BaseImage {...props} src={usedSrc} onError={onError} /> 
}


