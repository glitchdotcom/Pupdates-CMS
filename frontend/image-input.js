import React from 'react'
import styled from '@emotion/styled'

import Box from './box'
import Input from './input'

const Image = ({ defaultSrc, ...props }) => (
  <img {...props} onError={() => {}}
)


const ImageInput = ({ src, alt, onChangeSrc, onChangeAlt }) => (
  <Box>
    <Image src={src} alt={alt} />
    <Input
  </Box>
)
