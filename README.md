# Recurly benefits

Apparently it has a very nice admin dashboard. Nothing I care about since I don't understand anything there, but I understand that's very effective for the business side of things. However, I don't think that the Stripe dashboard is going to be _that_ less powerful.

# Recurly issues so far

- Does not seem to have any advantages in term of integrations compared with Stripe - Ask Liz if Recurly-specific work has already been made on the Finance side of things, and how long would it take to switch that work to Stripe, just in case.

- The node client library is [unsupported](https://dev.recurly.com/docs/client-libraries), [unmaintained](https://github.com/cgerrior/node-recurly/issues/8#issuecomment-261316557), [undocumented](https://github.com/cgerrior/node-recurly#usage), does not have an npm package, and is not promise-based. We would start having technical debt before writing a single line of code.

- Documentation in general is lacking, very difficult to navigate, very complicated, and way worse than the one provided by Stripe.

- All the API is in XML. Couple this with the unsupported client and terrible documentation, and this means that whenever something breaks, it will be way more difficult to figure out how to fix it.

- There is no way to have test data in the production environment. This alone is a deal breaker for me.