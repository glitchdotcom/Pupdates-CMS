import React from 'react'
import styled from '@emotion/styled'
import Box, { Flex } from './box'

const Label = styled.label`
  display: block;
`

const BaseInput = styled.input`
  font: inherit;
  width: 100%;
  border: 1px solid #eee;
  padding: 0.25rem;
`


const Input = ({ value, onChange, label, type = 'text', condensed }) => condensed ? (
  <Flex as="label" align="center" gap={1}>
    <Box>{label}</Box>
    <Box flex="1 0 auto">
      <BaseInput type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </Box>
  </Flex>
) : (
  <Label>
    <Box padding={{ bottom: 1 }}>
      {label}
    </Box>
    <BaseInput type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  </Label>
)

export default Input
