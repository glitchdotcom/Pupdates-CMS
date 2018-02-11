/* global recurly */

window.addEventListener("load", (e) => {
  console.log("LOADED")
  
  recurly.configure("ewr1-p2q4CkseaWl7fKQMPGKtn0")
  
  const form = document.getElementById("recurly-form")
  form.addEventListener("submit", (e) => {
    console.log("SUBMITTED")
    e.preventDefault()
    recurly.token(form, (err, token) => {
      if (err) {
        console.log(err.code, err.fields)
      } else {
        form.submit()
      }
    })
  })
})
