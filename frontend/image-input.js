import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'

import Box, { Flex } from './box'
import Input from './input'


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
