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
    const headerInput = document.querySelector('.header__input')
    const headerButton = document.querySelector('.header__button')
    const headerLogo = document.querySelector('.header__logo')
    const searchIcon = document.querySelector('.icon-search')
    const plusIcon = document.querySelector('.icon-plus')

    headerInput?.classList.toggle('show')
    headerButton?.classList.toggle('show')
    headerLogo?.classList.toggle('show')
    searchIcon?.classList.toggle('show')
    plusIcon?.classList.toggle('show')
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
  const itemCode = event.target?.dataset?.id

  if (action === 'delete' && itemCode && modalForm) {
    modalForm.setAttribute('action', `/admin/todos-os-produtos/${itemCode}/${action}`)
    modal.openModal()
  }
}

// Set new product id when creating a new product
addProduct?.addEventListener('click', () => {
  productId?.setId?.()
})
