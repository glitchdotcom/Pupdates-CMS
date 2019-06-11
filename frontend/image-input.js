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


const ImageInput = ({ label, src, alt, onChangeSrc, onChangeAlt }) => (
  <Flex gap={1}>
    <Box flex="0 1 50%">
      <Input label={label} value={src} onChange={onChangeSrc} />
      <Box padding={{ top: 2 }}>
        <Input label="description" value={alt} onChange={onChangeAlt} />
      </Box>
    </Box>
    <Box flex="0 1 50%">
      <Image src={src} alt={alt} />
    </Box>
  </Flex>
)

export default ImageInput
