import Modal from './modal.js'
import ProductId from './product-id.js'

const modal = Modal()
const productId = ProductId()

const deleteBtn = document.querySelectorAll('.icon-delete')
const prodLink = document.querySelectorAll('.products__card--view')
const addProduct = document.querySelector('.add')
const searchBtn = document.querySelectorAll('.header__search')
const menuToggle = document.querySelector('#header-menu-toggle')
const menuClose = document.querySelector('#header-menu-close')
const mobileMenu = document.querySelector('.header__mobile-menu')
const menuOverlay = document.querySelector('.header__overlay')
const mobileThemeToggle = document.querySelector('#mobile-theme-toggle')

const toggleMobileMenu = open => {
  if (!mobileMenu || !menuOverlay) return
  const action = open ? 'add' : 'remove'
  mobileMenu.classList[action]('active')
  menuOverlay.classList[action]('active')
  document.body.classList[action]('menu-open')
  document.documentElement.classList[action]('menu-open')
  mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true')
}

menuToggle?.addEventListener('click', () => toggleMobileMenu(true))
menuClose?.addEventListener('click', () => toggleMobileMenu(false))
menuOverlay?.addEventListener('click', () => toggleMobileMenu(false))
mobileThemeToggle?.addEventListener('click', () => {
  document.querySelector('#theme-toggle')?.click()
  toggleMobileMenu(false)
})

// Open search bar on mobile
searchBtn.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.header__input').classList.toggle('show')
    document.querySelector('.header__button').classList.toggle('show')
    document.querySelector('.header__logo').classList.toggle('show')
    document.querySelector('.icon-search').classList.toggle('show')
    document.querySelector('.icon-plus').classList.toggle('show')
  })
})

// Open modal and set route to form action when delete button is clicked
deleteBtn.forEach(btn => {
  btn.addEventListener('click', event => handleClick(event, 'delete'))
})

prodLink.forEach(link => {
  const itemCode = link.dataset.id
  if (itemCode) {
    link.setAttribute('href', `/produto/${itemCode}`)
  }
})

function handleClick(event, action) {
  event.preventDefault()
  const modalForm = document.querySelector('.modal form')
  // get data-id value in DOM for each target of click event
  const itemCode = event.target.dataset.id

  if (action == 'delete') {
    // Set URL route to modal form action attribute
    modalForm.setAttribute('action', `/admin/todos-os-produtos/${itemCode}/${action}`)
    modal.openModal()
  }
}

// Set new product id when creating a new product
addProduct.addEventListener('click', event => {
  productId.setId()
})
