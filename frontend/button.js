import React from 'react'
import styled from '@emotion/styled'

const BaseButton = styled.button`
  appearance: none;
  text-align: inherit;
  font: inherit;
  color: inherit;
  border: none;
  border-radius: 0;
  margin: none;
  padding: none;
  background-color: transparent;
`

export const TransparentButton = styled(BaseButton)`
  display: block;
  width: 100%;
`

const Button = styled(({ className, type = "button", ...props }) => (
  <BaseButton className={className} type={type} {...props} />
))`
  border-radius: 0.5rem;
  border: 2px solid #222;
  padding: 0.25rem 1rem;
  text-align: center;
`

export default Button
