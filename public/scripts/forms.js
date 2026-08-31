import {validate, checkLength} from './validation.js'

const loginInputs = document.querySelectorAll('[data-type]')

loginInputs.forEach(input => {
  // check if input is price type and, if so, import Simple Mask Money according to its documentation
  if (input.dataset.type === 'price') {
    SimpleMaskMoney.setMask(input, {
      // afterFormat(e) {
      //   console.log('afterFormat', e)
      // },
      // allowNegative: false,
      // beforeFormat(e) {
      //   console.log('beforeFormat', e)
      // },
      // negativeSignAfter: false,
      prefix: 'R$ ',
      // suffix: '',
      fixed: true,
      fractionDigits: 2,
      decimalSeparator: ',',
      thousandsSeparator: '.',
      cursor: 'move'
    })
  }

  input.addEventListener('blur', event => {
    validate(event.target)
  })
})

const contactInputs = document.querySelectorAll('[data-type="contact"]')

contactInputs.forEach(input => {
  input.addEventListener('keyup', event => {
    checkLength(event.target)
  })
})

contactInputs.forEach(input => {
  input.addEventListener('blur', event => {
    validate(event.target)
  })
})

const themeToggle = document.querySelector('#theme-toggle')
const currentTheme = localStorage.getItem('theme')

if (themeToggle) {
  // Verifica se o usuário já tinha uma preferência salva
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme)
    if (currentTheme === 'dark') {
      themeToggle.textContent = '☀️' // Ícone de sol para voltar ao claro
    }
  }

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme')

    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light')
      themeToggle.textContent = '🌙'
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
      themeToggle.textContent = '☀️'
      localStorage.setItem('theme', 'dark')
    }
  })
}