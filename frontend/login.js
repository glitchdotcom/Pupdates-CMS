import React, { useState } from 'react'
import styled from '@emotion/styled'
import { useDispatch } from 'react-redux'
import { actions } from './current-user'
import Button from './button'

const FormError = styled.div`
  color: white;
  background-color: red;
  font-weight: bold;
  padding: 0.5rem;
`

const EmailForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  
  const onSubmitForm = (e) => {
    e.preventDefault()
    dispatch({ 
      ...actions.submittedEmail(email), 
      onSuccess: onSubmit,
      onError: () => { setError('oops') },
    })
  }
  return (
    <>
      <form onSubmit={onSubmitForm}>
        <label>
          <div>Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
          {error && <FormError>{error}</FormError>}
        </label>
        <Button type="submit">Get access code</Button>
      </form>
      <Button onClick={onSubmit}>Enter sign-in code</Button>
    </>
  )
}

const CodeForm = () => {
  const [code, setCode] = useState('') 
  const dispatch = useDispatch()
  
  const onSubmitForm = (e) => {
    e.preventDefault()
    dispatch(actions.submittedSignInCode(code))
  }
  return (
    <form onSubmit={onSubmitForm}>
      <label>
        <div>Sign in code</div>
        <input type="text" value={code} onChange={e => setCode(e.target.value)}/>
      </label>
      <Button type="submit">submit</Button>
    </form>
  )
}

const LoginPage = styled.section`
  margin: 1em auto;
  max-width: 300px;
  border: 1px solid #eee;
  padding: 1rem;
`

const Login = () => {
  const [status, setStatus] = useState('init') // init | submittedEmail 
  const submitEmail = () => {
    setStatus('submittedEmail')  
  }
  
  return (
    <LoginPage>
      {status === 'init' && <EmailForm onSubmit={submitEmail} />}
      {status === 'submittedEmail' && <CodeForm />}
    </LoginPage>
  )
}

export default Login