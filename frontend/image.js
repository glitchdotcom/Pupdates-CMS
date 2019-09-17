import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'

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

export default Image
