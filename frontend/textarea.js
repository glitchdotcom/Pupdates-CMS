import React from 'react'
import styled from '@emotion/styled'
import Box from './box'

const Label = styled.label`
  display: block;
`

const BaseTextArea = styled.textarea`
  display: block;
  font: inherit;
  width: 100%;
  border: 1px solid #eee;
  padding: 0.25rem;
  min-height: 6rem;
`

const TextArea = ({ value, onChange, label }) => (
  <Label>
    <Box padding={{ bottom: 1 }}>
      {label}
    </Box>
    <BaseTextArea value={value} onChange={(e) => onChange(e.target.value)} />
  </Label>
)

export default TextArea
