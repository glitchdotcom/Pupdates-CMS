import React, { useState, useReducer } from 'react'
import styled from '@emotion/styled'
import { useDispatch } from 'react-redux'
import { createReducer } from 'redux-starter-kit'

import { useAsyncFunction } from './app-core'
import { useCurrentUser } from './current-user'
import { useResource, useChildResource, actions as resourceActions } from './resources'
import Button from './button'
import Input from './input'
import TextArea from './textarea'
import Box, { Flex } from './box'


const featureCalloutsReducer = ({
  update: (state, { payload: { id, value }}) => {
    Object.assign(state.find(item => item.id === id), value)
  }
})

const SectionTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
`

const FeatureCalloutTitle = styled.h2`
  font-weight: bold;
`

const FeatureCallout = ({ value, onChange }) => (
  <Box flex="1 0 auto">
    <FeatureCalloutTitle>{value.id}</FeatureCalloutTitle>
    <Input label="Label" value={value.label} onChange={(label) => onChange({ label })}/>
    <TextArea label="Description" value={value.description} onChange={(description) => onChange({ description })} />
    <Input label="Call to action" value={value.cta} onChange={(cta) => onChange({ cta })}/>
    <Input label="Link url" value={value.href} onChange={(href) => onChange({ href })}/>
  </Box>
)

const FeatureCallouts = ({ content }) => {
  const [state, dispatch] = useReducer(featureCalloutsReducer, content)
  return (
    <Flex gap={1}>
      {state.map(item => (
        <FeatureCallout key={item.id} value={item} onChange={(value) => dispatch({ type: 'update', payload: { id: item.id, value } })} />
      ))}
    </Flex>
  )
}

const defaultContent = [{ id: 'apps' }, { id: 'create' }, { id: 'teams' }]

const Editor = () => (
  <section>
    <SectionTitle>Feature Callouts</SectionTitle>
    <FeatureCallouts content={defaultContent} />
    <SectionTitle>Unified Stories</SectionTitle>
    <SectionTitle>Featured Embed</SectionTitle>
    <SectionTitle>Apps We Love</SectionTitle>
    <SectionTitle>Curated Collections</SectionTitle>
    <SectionTitle>Start Building</SectionTitle>
  </section>
)



export default Editor

