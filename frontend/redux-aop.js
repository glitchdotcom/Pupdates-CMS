// matchers
export const any = () => true

export const not = (matchFn) => (action) => !matchFn(action)

export const matchTypes = (...actionTypes) => (action) => action.type && actionTypes.includes(action.type)

export function before (matchFn, handler) {
    return (store) => (next) => (action) => {
        if (!matchFn(action)) return next(action)
        const nextAction = handler(store, action)
        if (nextAction !== undefined) return next(nextAction)
    }
}

function after (matchFn, handler) {
  return (store) => (next) => (action) => {
    if (!matchFn(action)) return next
    handler(store, next(action))
  }
}
