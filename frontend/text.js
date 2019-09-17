import styled from '@emotion/styled'

const sizes = ['inherit', '3rem', '2rem', '1.5rem', '1rem', '0.8rem']

const Text = styled.div`
  font-size: ${({ size }) => sizes[size || 0]};
  font-weight: ${({ weight }) => weight || 'inherit'};
`

export default Text
