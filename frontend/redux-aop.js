// matchers
export const any = () => true

export const not = (matchFn) => (action) => !matchFn(action)

export const matchTypes = (...actionTypes) => {
  const actionTypeStrings = actionTypes.map(t => String(t))
  return (action) => action.type && actionTypeStrings.includes(action.type)
}

// middleware
export function before (matchFn, handler) {
  return (store) => (next) => (action) => {
    if (!matchFn(action)) return next(action)
    const nextAction = handler(store, action)
    if (nextAction !== undefined) return next(nextAction)
  }
}

export function after (matchFn, handler) {
  return (store) => (next) => (action) => {
    if (!matchFn(action)) return next(action)
    return handler(store, next(action))
  }
}
