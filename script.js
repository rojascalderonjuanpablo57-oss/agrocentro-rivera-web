const menuButton = document.querySelector('#menuButton');
const nav = document.querySelector('#mainNav');
const cartCount = document.querySelector('#cartCount');
const favoritesCount = document.querySelector('#favoritesCount');
const toast = document.querySelector('#toast');
const sidePanel = document.querySelector('#sidePanel');
const panelOverlay = document.querySelector('#panelOverlay');
const panelItems = document.querySelector('#panelItems');
const panelTitle = document.querySelector('#panelTitle');
const panelEyebrow = document.querySelector('#panelEyebrow');
const panelWhatsApp = document.querySelector('.panel-whatsapp');
const searchInput = document.querySelector('#searchInput');
const searchButton = document.querySelector('#searchButton');
const wompiCheckoutUrl = 'https://checkout.wompi.co/l/rW84KY';
const storageKey = 'agrocentro-rivera-selection-v1';

const readSelection = () => {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
};
const savedSelection = readSelection();
let cart = Array.isArray(savedSelection.cart) ? savedSelection.cart : [];
let favorites = Array.isArray(savedSelection.favorites) ? savedSelection.favorites : [];
let activeList = 'cart';

const formatCOP = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const productData = card => {
  const variant = card.querySelector('.product-variant')?.selectedOptions[0];
  const baseName = card.dataset.product;
  const name = variant ? `${baseName} — ${variant.dataset.label}` : baseName;
  return { name, category: card.dataset.category, icon: card.dataset.icon || card.querySelector('.product-image').textContent.trim(), image: card.querySelector('.product-image img')?.src || '', price: Number(variant?.value ?? card.dataset.price) || 0, quantity: 1 };
};
const legacyProductNames = { 'Guadañadora Total 42.7 cc': 'Guadañadora Total 43 cc · 2 HP', 'Pistola de pintura Dyllu 450 W': 'Pistola de pintura Dyllu 550 W', 'Pistola rociadora Dyllu UDTEG2A50 550 W': 'Pistola de pintura Dyllu 550 W', 'Manguera para riego': 'Manguera Swan para riego', 'Matiz 200 1 litro': 'Matiz 200', 'Galeón 247 SC 1 litro': 'Galeón 247 SC' };
const refreshSavedProduct = item => {
  const currentName = legacyProductNames[item.name] || item.name;
  const card = Array.from(document.querySelectorAll('.product-card')).find(product => product.dataset.product === currentName);
  return card ? { ...item, ...productData(card), quantity: item.quantity || 1 } : { ...item, price: Number(item.price) || 0 };
};
cart = cart.map(refreshSavedProduct);
favorites = favorites.map(refreshSavedProduct);
const normalizeText = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const persistSelection = () => localStorage.setItem(storageKey, JSON.stringify({ cart, favorites }));
const updateFavoriteButtons = () => document.querySelectorAll('.product-card').forEach(card => {
  const button = card.querySelector('.favorite');
  const selected = favorites.some(item => item.name === card.dataset.product);
  button.textContent = selected ? '♥' : '♡';
  button.classList.toggle('is-favorite', selected);
  button.setAttribute('aria-label', selected ? 'Quitar de favoritos' : 'Añadir a favoritos');
});
const syncCounters = () => { cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0); favoritesCount.textContent = favorites.length; persistSelection(); updateFavoriteButtons(); };
const updateCheckoutButtons = items => {
  const hasItems = items.length > 0;
  const fromFavorites = activeList === 'favorites';
  checkoutButton.disabled = !hasItems;
  panelWhatsApp.disabled = !hasItems;
  checkoutButton.textContent = fromFavorites ? 'Pasar al carrito y continuar' : 'Continuar pedido';
  panelWhatsApp.textContent = fromFavorites ? 'Pasar al carrito para cotizar' : 'Completar datos para cotizar';
};
const cartSummary = () => {
  const totalUnits = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const pendingPrices = cart.filter(item => !item.price).length;
  return `<section class="cart-summary"><div><span>Tu selección</span><strong>${totalUnits} unidad${totalUnits === 1 ? '' : 'es'} en ${cart.length} referencia${cart.length === 1 ? '' : 's'}</strong></div><button type="button" data-clear-cart>Vaciar carrito</button><dl class="cart-totals"><div><dt>Subtotal con precios publicados</dt><dd>${formatCOP(subtotal)}</dd></div><div><dt>Envío</dt><dd>Por confirmar</dd></div><div class="cart-grand-total"><dt>Total de productos</dt><dd>${formatCOP(subtotal)}</dd></div></dl>${pendingPrices ? `<p>${pendingPrices} producto${pendingPrices === 1 ? '' : 's'} aún ${pendingPrices === 1 ? 'requiere' : 'requieren'} confirmar precio antes del pago.</p>` : '<p>El costo de envío se confirma según la dirección de entrega.</p>'}</section>`;
};
const paymentOptions = () => {
  const onlinePaymentReady = cart.length > 0 && cart.every(item => item.price > 0);
  const paymentNote = onlinePaymentReady ? `Total de productos: ${formatCOP(cart.reduce((total, item) => total + item.price * item.quantity, 0))}. Completa los datos para continuar.` : 'Wompi se habilita cuando todos los productos del carrito tengan precio.';
  return `<section class="payment-options"><p class="payment-title">Opciones de pago</p><button type="button" class="payment-method wompi-payment selected" data-payment-note="${paymentNote}"><b class="payment-logo wompi-logo">w</b><span><strong>Wompi</strong><small>${onlinePaymentReady ? 'Disponible después de revisar pedido' : 'Pendiente de completar precios'}</small></span></button><button type="button" class="payment-method" data-payment-note="Para transferencia, completa los datos y un asesor te compartirá los datos bancarios."><b class="payment-logo bancolombia-logo">B</b><span><strong>Transferencia bancaria</strong><small>Consulta al revisar el pedido</small></span></button><button type="button" class="payment-method" data-payment-note="La opción de tarjeta se habilita después de revisar el pedido."><b class="payment-logo cards-logo"><i></i><i></i></b><span><strong>Tarjeta débito o crédito</strong><small>Disponible después de revisar pedido</small></span></button><button type="button" class="payment-method" data-payment-note="Consulta con un asesor la disponibilidad de pago con Addi."><b class="payment-logo image-payment addi-logo" aria-label="Addi"></b><span><strong>Addi</strong><small>Compra ahora, paga después</small></span></button><button type="button" class="payment-method" data-payment-note="Consulta con un asesor la disponibilidad de pago con Sistecrédito."><b class="payment-logo image-payment sistecredito-logo" aria-label="Sistecrédito"></b><span><strong>Sistecrédito</strong><small>Financia tu compra</small></span></button><p class="payment-note">${paymentNote}</p></section>`;
};
const renderPanel = () => {
  const items = activeList === 'cart' ? cart : favorites;
  panelTitle.textContent = activeList === 'cart' ? 'Mi carrito' : 'Mis favoritos';
  panelEyebrow.textContent = items.length ? `${items.length} producto${items.length === 1 ? '' : 's'} ${activeList === 'cart' ? 'para cotizar' : 'guardado' + (items.length === 1 ? '' : 's')}` : (activeList === 'cart' ? 'Productos para cotizar' : 'Guardados para ti');
  updateCheckoutButtons(items);
  if (!items.length) {
    panelItems.innerHTML = `<div class="empty-panel"><strong>${activeList === 'cart' ? 'Tu carrito está vacío' : 'Aún no tienes favoritos'}</strong><p>${activeList === 'cart' ? 'Agrega productos y te cotizamos precio y entrega por WhatsApp.' : 'Toca el corazón de un producto para guardarlo aquí.'}</p><div class="empty-shortcuts">${['Agrícola', 'Herramientas', 'Construcción'].map(category => `<button type="button" data-empty-category="${category}">${category}</button>`).join('')}</div></div>`;
    panelItems.querySelectorAll('[data-empty-category]').forEach(button => button.addEventListener('click', () => { closePanel(); document.querySelector(`.categories .category[data-count-category="${button.dataset.emptyCategory}"]`)?.click(); }));
    return;
  }
  panelItems.innerHTML = items.map((item, index) => `<article class="panel-item"><span class="mini-icon">${item.image ? `<img src="${item.image}" alt="${item.name}" />` : item.icon}</span><div class="panel-product-info"><p>${item.category}</p><h4>${item.name}</h4><div class="panel-price">${item.price ? `${formatCOP(item.price)} c/u${activeList === 'cart' ? `<strong>${formatCOP(item.price * item.quantity)}</strong>` : ''}` : 'Precio por confirmar'}</div>${activeList === 'cart' ? `<div class="quantity-control"><button data-decrease="${index}" aria-label="Disminuir unidades">−</button><input data-quantity="${index}" aria-label="Unidades de ${item.name}" type="number" min="1" max="5000" value="${item.quantity}" /><button data-increase="${index}" aria-label="Aumentar unidades">+</button><small>máx. 5.000</small></div>` : ''}<button class="panel-remove" data-remove="${index}">Quitar</button></div></article>`).join('') + (activeList === 'cart' ? cartSummary() + paymentOptions() : '');
  panelItems.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => { items.splice(Number(button.dataset.remove), 1); syncCounters(); renderPanel(); }));
  panelItems.querySelector('[data-clear-cart]')?.addEventListener('click', () => { cart = []; syncCounters(); renderPanel(); announce('Carrito vaciado'); });
  panelItems.querySelectorAll('[data-increase]').forEach(button => button.addEventListener('click', () => { const item = cart[Number(button.dataset.increase)]; item.quantity = Math.min(5000, item.quantity + 1); syncCounters(); renderPanel(); }));
  panelItems.querySelectorAll('[data-decrease]').forEach(button => button.addEventListener('click', () => { const item = cart[Number(button.dataset.decrease)]; item.quantity = Math.max(1, item.quantity - 1); syncCounters(); renderPanel(); }));
  panelItems.querySelectorAll('[data-quantity]').forEach(input => input.addEventListener('change', () => { const item = cart[Number(input.dataset.quantity)]; item.quantity = Math.min(5000, Math.max(1, Number.parseInt(input.value, 10) || 1)); syncCounters(); renderPanel(); }));
  panelItems.querySelectorAll('.payment-method').forEach(method => method.addEventListener('click', () => { panelItems.querySelectorAll('.payment-method').forEach(button => button.classList.remove('selected')); method.classList.add('selected'); const note = panelItems.querySelector('.payment-note'); if (note && method.dataset.paymentNote) note.textContent = method.dataset.paymentNote; }));
};
const labelThunderboltHost = () => {
  const anonymousHosts = Array.from(document.body.children).filter(element => element.tagName === 'DIV' && !element.id && !element.className);
  anonymousHosts.at(-1)?.classList.add('thunderbolt-host');
};
labelThunderboltHost();
new MutationObserver(labelThunderboltHost).observe(document.body, { childList: true });
const setPurchasePanelState = isOpen => document.body.classList.toggle('purchase-panel-open', isOpen);
const openPanel = list => { activeList = list; renderPanel(); sidePanel.classList.add('open'); panelOverlay.classList.add('open'); sidePanel.setAttribute('aria-hidden', 'false'); setPurchasePanelState(true); };
const closePanel = () => { sidePanel.classList.remove('open'); panelOverlay.classList.remove('open'); sidePanel.setAttribute('aria-hidden', 'true'); if (!checkoutModal.classList.contains('open')) setPurchasePanelState(false); };
const announce = message => { toast.textContent = message; toast.classList.add('show'); window.setTimeout(() => toast.classList.remove('show'), 1900); };

menuButton?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelector('#cartButton').addEventListener('click', () => openPanel('cart'));
document.querySelector('#favoritesButton').addEventListener('click', () => openPanel('favorites'));
document.querySelector('#closePanel').addEventListener('click', closePanel);
panelOverlay.addEventListener('click', closePanel);
document.querySelectorAll('.add-cart').forEach(button => button.addEventListener('click', () => {
  const product = productData(button.closest('.product-card'));
  const existing = cart.find(item => item.name === product.name);
  if (existing) existing.quantity = Math.min(5000, existing.quantity + 1); else cart.push(product);
  syncCounters(); announce(`${product.name} añadido al carrito`);
}));
document.querySelectorAll('.product-variant').forEach(select => select.addEventListener('change', () => {
  const option = select.selectedOptions[0];
  const price = Number(option.value) || 0;
  const priceLabel = select.closest('.product-card').querySelector('[data-variant-price]');
  if (priceLabel) priceLabel.textContent = `${formatCOP(price)} · ${option.dataset.label.toLowerCase()}`;
}));
document.querySelectorAll('.best-add').forEach(button => button.addEventListener('click', () => {
  const sourceCard = document.querySelector(`.product-card[data-product="${button.dataset.product}"]`);
  if (!sourceCard) return;
  const product = productData(sourceCard);
  const existing = cart.find(item => item.name === product.name);
  if (existing) existing.quantity = Math.min(5000, existing.quantity + 1); else cart.push(product);
  syncCounters(); announce(`${product.name} añadido al carrito`);
}));
const productPreview = document.querySelector('#productPreview');
const productPreviewImage = document.querySelector('#productPreviewImage');
const productPreviewCategory = document.querySelector('#productPreviewCategory');
const productPreviewTitle = document.querySelector('#productPreviewTitle');
const productPreviewDescription = document.querySelector('#productPreviewDescription');
const closeProductPreview = () => productPreview?.close();
const openProductPreview = card => {
  const image = card.querySelector('.product-image.photo img, .best-image img');
  if (!productPreview) return;
  // Algunos productos no tienen foto; la ficha se abre igual mostrando su ícono.
  productPreviewImage.hidden = !image;
  productPreviewImage.closest('.product-preview-image-wrap').dataset.icon = image ? '' : (card.dataset.icon || card.querySelector('.product-image')?.textContent.trim() || '');
  if (image) {
    productPreviewImage.src = image.currentSrc || image.src;
    productPreviewImage.alt = image.alt;
  }
  productPreviewCategory.textContent = card.querySelector('p')?.textContent.trim() || '';
  productPreviewTitle.textContent = card.querySelector('h3')?.textContent.trim() || card.dataset.product;
  productPreviewDescription.textContent = card.querySelector('strong')?.textContent.trim() || '';
  fillProductDetail(card);
  if (!productPreview.open) productPreview.showModal();
  productPreview.scrollTop = 0;
  document.body.classList.add('product-preview-open');
};
document.querySelectorAll('.product-image.photo, .best-seller-card .best-image').forEach(surface => {
  const card = surface.closest('.product-card, .best-seller-card');
  if (!card) return;
  surface.tabIndex = 0;
  surface.setAttribute('role', 'button');
  surface.setAttribute('aria-label', `Ver ficha de ${card.dataset.product || card.querySelector('h3')?.textContent.trim() || 'este producto'}`);
  surface.addEventListener('click', () => openProductPreview(card));
  surface.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProductPreview(card); }
  });
});
document.querySelector('#closeProductPreview')?.addEventListener('click', closeProductPreview);
productPreview?.addEventListener('click', event => { if (event.target === productPreview) closeProductPreview(); });
productPreview?.addEventListener('close', () => document.body.classList.remove('product-preview-open'));
document.addEventListener('click', event => {
  const button = event.target.closest('.favorite');
  if (!button) return;
  event.preventDefault(); event.stopPropagation();
  const product = productData(button.closest('.product-card'));
  const existing = favorites.findIndex(item => item.name === product.name);
  if (existing >= 0) { favorites.splice(existing, 1); announce('Producto eliminado de favoritos'); } else { favorites.push(product); announce('Producto guardado en favoritos'); }
  syncCounters();
});
const catalogSection = document.querySelector('#productos');
const catalogCards = Array.from(catalogSection.querySelectorAll('.product-card:not([hidden])'));
const catalogCount = document.querySelector('#catalogCount');
const catalogEmpty = document.querySelector('#catalogEmpty');
const catalogCategoryButtons = Array.from(document.querySelectorAll('[data-catalog-category]'));
const setActiveCategory = category => catalogCategoryButtons.forEach(button => {
  const active = button.dataset.catalogCategory === category;
  button.classList.toggle('active', active);
  button.setAttribute('aria-pressed', String(active));
});
const filterCatalog = (matches, category = '') => {
  let count = 0;
  catalogCards.forEach(card => {
    const visible = matches(card);
    card.classList.toggle('search-hidden', !visible);
    if (visible) count += 1;
  });
  setActiveCategory(category);
  catalogCount.textContent = count === catalogCards.length
    ? `${count} productos disponibles`
    : `${count} de ${catalogCards.length} productos`;
  catalogEmpty.hidden = count > 0;
  return count;
};
const showCatalog = () => {
  document.body.classList.add('catalog-view');
  if (location.hash !== '#productos') location.hash = 'productos';
  requestAnimationFrame(() => catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' }));
};
const renderHashView = () => {
  document.body.classList.add('catalog-ready');
  document.body.classList.toggle('catalog-view', location.hash === '#productos');
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }));
};
window.addEventListener('hashchange', renderHashView);
filterCatalog(() => true);
renderHashView();
const searchProducts = () => {
  const terms = normalizeText(searchInput.value).split(' ').filter(Boolean);
  const matches = filterCatalog(card => !terms.length || terms.every(term => normalizeText(`${card.dataset.product} ${card.dataset.category}`).includes(term)));
  showCatalog();
  announce(matches ? `${matches} producto${matches === 1 ? '' : 's'} encontrado${matches === 1 ? '' : 's'}` : 'No encontramos ese producto todavía');
};
searchButton.addEventListener('click', searchProducts);
searchInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchProducts(); } });
searchInput.addEventListener('input', () => {
  if (searchInput.value.trim()) return;
  filterCatalog(() => true);
});
document.querySelectorAll('.categories .category').forEach(category => category.addEventListener('click', event => {
  event.preventDefault();
  const selectedCategory = category.querySelector('strong').textContent.trim();
  const matches = filterCatalog(card => card.dataset.category === selectedCategory, selectedCategory);
  searchInput.value = '';
  showCatalog();
  announce(`${matches} producto${matches === 1 ? '' : 's'} en ${selectedCategory}`);
}));
catalogCategoryButtons.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.catalogCategory;
  const matches = filterCatalog(card => !category || card.dataset.category === category, category);
  searchInput.value = '';
  announce(category ? `${matches} producto${matches === 1 ? '' : 's'} en ${category}` : 'Todos los productos');
}));
document.querySelectorAll('a[href="#productos"]:not(.category):not([data-brand-filter])').forEach(link => link.addEventListener('click', () => {
  filterCatalog(() => true);
  searchInput.value = '';
  document.body.classList.add('catalog-view');
}));
const brandsMenuButton = document.querySelector('#brandsMenuButton');
const brandsMenu = document.querySelector('#brandsMenu');
brandsMenuButton?.addEventListener('click', () => {
  const isOpen = brandsMenu.classList.toggle('open');
  brandsMenuButton.setAttribute('aria-expanded', String(isOpen));
});
const extraBrands = [
  { name: 'Knox', className: 'knox', logo: 'assets/logo-knox-leistung.png' },
];
const allBrandsLink = brandsMenu?.querySelector('[data-brand-filter=""]');
extraBrands.forEach(({ name }) => {
  if (brandsMenu?.querySelector(`[data-brand-filter="${name}"]`)) return;
  const link = document.createElement('a');
  link.href = '#productos';
  link.dataset.brandFilter = name;
  link.textContent = name;
  allBrandsLink?.before(link);
});
const brandGrid = document.querySelector('.brands-grid');
extraBrands.forEach(({ name, className, logo }) => {
  if (brandGrid?.querySelector(`.${className}`)) return;
  const chip = document.createElement('span');
  chip.className = `brand-chip logo-brand external-brand ${className}`;
  chip.innerHTML = `<img src="${logo}" alt="Logo ${name}" />`;
  brandGrid?.appendChild(chip);
});
document.querySelectorAll('[data-brand-filter]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const brand = link.dataset.brandFilter;
  const brandProducts = { Agroser: ['Sistoato', 'Lancelot', 'Inimectin', 'Trabuko', 'Matiz', 'Banazole', 'Galeón'], SQM: ['Amilsol'] };
  filterCatalog(card => {
    const matchesName = normalizeText(`${card.dataset.product} ${card.querySelector('p')?.textContent || ''}`).includes(normalizeText(brand));
    const matchesBrand = (brandProducts[brand] || []).some(product => card.dataset.product.includes(product));
    return !brand || matchesName || matchesBrand;
  });
  searchInput.value = brand;
  brandsMenu.classList.remove('open'); brandsMenuButton.setAttribute('aria-expanded', 'false');
  showCatalog();
  announce(brand ? `Productos de ${brand}` : 'Todos los productos');
}));
document.addEventListener('click', event => { if (!event.target.closest('.nav-brands')) { brandsMenu?.classList.remove('open'); brandsMenuButton?.setAttribute('aria-expanded', 'false'); } });
const checkoutButton = document.querySelector('#checkoutButton');
const checkoutModal = document.querySelector('#checkoutModal');
const checkoutItems = document.querySelector('#checkoutItems');
const checkoutCount = document.querySelector('#checkoutCount');
const checkoutTotals = document.querySelector('#checkoutTotals');
const checkoutNotice = document.querySelector('#checkoutNotice');
const checkoutForm = document.querySelector('#checkoutForm');
const checkoutActions = document.querySelector('#checkoutActions');
let deliveryMethod = 'Domicilio';
const renderCheckout = () => {
  const units = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const pendingPrices = cart.filter(item => !item.price).length;
  checkoutCount.textContent = `${units} artículo${units === 1 ? '' : 's'} en el carrito`;
  checkoutItems.innerHTML = cart.map(item => `<div class="checkout-item"><span>${item.quantity}×</span><strong>${item.name}<small>${item.price ? `${formatCOP(item.price)} c/u` : 'Precio por confirmar'}</small></strong><b>${item.price ? formatCOP(item.price * item.quantity) : 'Pendiente'}</b></div>`).join('');
  checkoutTotals.innerHTML = `<div><span>Subtotal</span><strong>${formatCOP(subtotal)}</strong></div><div><span>Envío</span><strong>${deliveryMethod === 'Recoger en tienda' ? formatCOP(0) : 'Por confirmar'}</strong></div><div class="checkout-grand-total"><span>Total de productos</span><strong>${formatCOP(subtotal)}</strong></div>`;
  checkoutNotice.textContent = pendingPrices ? `${pendingPrices} producto${pendingPrices === 1 ? '' : 's'} ${pendingPrices === 1 ? 'tiene' : 'tienen'} el precio pendiente. Confirma el pedido por WhatsApp antes de pagar.` : deliveryMethod === 'Domicilio' ? 'El valor del envío se confirma según la dirección antes de pagar.' : 'Recoger en tienda no genera costo de envío.';
};
const openCheckout = () => {
  if (!cart.length) { announce('Agrega productos antes de continuar'); return; }
  sidePanel.classList.remove('open');
  panelOverlay.classList.remove('open');
  sidePanel.setAttribute('aria-hidden', 'true');
  checkoutActions.hidden = true;
  renderCheckout(); checkoutModal.classList.add('open'); checkoutModal.setAttribute('aria-hidden', 'false'); setPurchasePanelState(true);
};
const closeCheckout = () => { checkoutModal.classList.remove('open'); checkoutModal.setAttribute('aria-hidden', 'true'); setPurchasePanelState(false); };
const moveFavoritesToCart = () => {
  favorites.forEach(item => {
    const existing = cart.find(product => product.name === item.name);
    if (existing) existing.quantity = Math.min(5000, existing.quantity + (item.quantity || 1));
    else cart.push({ ...item, quantity: item.quantity || 1 });
  });
  syncCounters();
};
const beginCheckout = () => {
  if (activeList === 'favorites') {
    if (!favorites.length) { announce('Guarda productos en favoritos para continuar'); return; }
    moveFavoritesToCart();
  }
  openCheckout();
};
checkoutButton?.addEventListener('click', beginCheckout);
panelWhatsApp?.addEventListener('click', beginCheckout);
document.querySelector('#closeCheckout')?.addEventListener('click', closeCheckout);
document.querySelectorAll('[data-delivery]').forEach(button => button.addEventListener('click', () => {
  deliveryMethod = button.dataset.delivery;
  document.querySelectorAll('[data-delivery]').forEach(option => option.classList.toggle('selected', option === button));
  document.querySelector('#addressField').hidden = deliveryMethod !== 'Domicilio';
  document.querySelector('#customerAddress').required = deliveryMethod === 'Domicilio';
  renderCheckout();
}));
checkoutForm?.addEventListener('submit', event => {
  event.preventDefault();
  const details = { name: document.querySelector('#customerName').value.trim(), phone: document.querySelector('#customerPhone').value.trim(), email: document.querySelector('#customerEmail').value.trim(), id: document.querySelector('#customerId').value.trim(), address: document.querySelector('#customerAddress').value.trim() };
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const allItemsHavePrice = cart.every(item => item.price > 0);
  const products = cart.map(item => `• ${item.name} — ${item.quantity} unidad${item.quantity === 1 ? '' : 'es'} — ${item.price ? formatCOP(item.price * item.quantity) : 'precio por confirmar'}`).join('\n');
  const message = `Hola, deseo confirmar este pedido:\n\n${products}\n\nTotal de productos con precio publicado: ${formatCOP(subtotal)}\nEnvío: ${deliveryMethod === 'Recoger en tienda' ? formatCOP(0) : 'por confirmar'}\n\nForma de recibir: ${deliveryMethod}\nCliente: ${details.name}\nCelular: ${details.phone}\nCorreo: ${details.email}\nDocumento: ${details.id}${deliveryMethod === 'Domicilio' ? `\nDirección: ${details.address}` : ''}\n\nPor favor confirmar disponibilidad${allItemsHavePrice ? ' y valor del envío' : ', precios pendientes y valor final'}.`;
  document.querySelector('#checkoutWhatsApp').href = `https://wa.me/573132639129?text=${encodeURIComponent(message)}`;
  const wompiButton = document.querySelector('#checkoutWompi');
  if (allItemsHavePrice) {
    wompiButton.href = wompiCheckoutUrl;
    wompiButton.hidden = false;
    wompiButton.textContent = `Pagar ${formatCOP(subtotal)} con Wompi`;
  } else {
    wompiButton.removeAttribute('href');
    wompiButton.hidden = true;
  }
  checkoutActions.hidden = false;
  announce(allItemsHavePrice ? 'Pedido listo para pagar' : 'Confirma los precios pendientes por WhatsApp');
});
syncCounters();
const brandLogoOverrides = {
  bler: { src: 'https://pinturasbler.com/wp-content/uploads/2020/07/Logo-BLER-TRANS.png', alt: 'Bler' },
  minerales: { src: 'https://d2d8zmg70jcjrl.cloudfront.net/images/upload/115999/sml/6690640a8d3948.33738342.jpg', alt: 'Minerales del Sur' }
};
Object.entries(brandLogoOverrides).forEach(([brand, logo]) => {
  const chip = document.querySelector(`.brand-chip.${brand}`);
  if (!chip) return;
  chip.classList.remove('wordmark');
  chip.classList.add('logo-brand');
  chip.innerHTML = `<img src="${logo.src}" alt="${logo.alt}" />`;
});
const totalLogo = document.querySelector('.brand-chip.total img');
if (totalLogo) {
  totalLogo.src = 'https://static.wixstatic.com/media/811b94_b6003ee24e0e4a59b4fab93da012b7d8~mv2.png';
  totalLogo.alt = 'Total';
}
const pintulandLogo = document.querySelector('.brand-chip.pintuland img');
if (pintulandLogo) {
  pintulandLogo.src = 'https://iconape.com/wp-content/files/pr/297825/png/297825.png';
  pintulandLogo.alt = 'Pintuland';
}
const backToTop = document.querySelector('#backToTop');
const updateBackToTop = () => {
  const visible = window.scrollY > 420;
  backToTop.classList.toggle('is-visible', visible);
  backToTop.setAttribute('aria-hidden', String(!visible));
  backToTop.tabIndex = visible ? 0 : -1;
};
window.addEventListener('scroll', updateBackToTop, { passive: true });
backToTop.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
});
updateBackToTop();
// Estado de la tienda según el horario real, en hora de Colombia.
(() => {
  const statusBox = document.querySelector('#storeStatus');
  const statusText = document.querySelector('#storeStatusText');
  if (!statusBox || !statusText) return;
  // Bloques [apertura, cierre] en minutos desde la medianoche; índice 0 = domingo.
  const schedule = [
    [[480, 720]],
    [[360, 720], [840, 1080]],
    [[360, 720], [840, 1080]],
    [[360, 720], [840, 1080]],
    [[360, 720], [840, 1080]],
    [[360, 720], [840, 1020]],
    [[420, 720]]
  ];
  const formatTime = minutes => {
    const h = Math.floor(minutes / 60);
    const m = String(minutes % 60).padStart(2, '0');
    if (h === 12 && m === '00') return '12:00 m.';
    return `${h % 12 || 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`;
  };
  const update = () => {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const now = Number(get('hour')) * 60 + Number(get('minute'));
    const open = schedule[day].find(([start, end]) => now >= start && now < end);
    statusBox.classList.toggle('is-open', Boolean(open));
    if (open) {
      statusText.textContent = `Abierto ahora, hasta las ${formatTime(open[1])}`;
      return;
    }
    const laterToday = schedule[day].find(([start]) => start > now);
    if (laterToday) {
      statusText.textContent = `Cerrado ahora. Abrimos hoy a las ${formatTime(laterToday[0])}`;
      return;
    }
    const nextDay = (day + 1) % 7;
    statusText.textContent = `Cerrado ahora. Abrimos mañana a las ${formatTime(schedule[nextDay][0][0])}`;
  };
  update();
  setInterval(update, 60000);
})();
// Número de referencias por categoría en las tarjetas de inicio.
document.querySelectorAll('[data-count-category]').forEach(tile => {
  const total = document.querySelectorAll(`.product-card[data-category="${tile.dataset.countCategory}"]:not([hidden])`).length;
  tile.querySelector('.cat-count').textContent = total ? `${total} referencia${total === 1 ? '' : 's'}` : 'Pregunta por disponibilidad';
});
// Aparición suave de categorías y tarjetas al entrar en pantalla.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealTargets = document.querySelectorAll('.categories .category, .best-seller-card, #productos .product-card, .promo, .about');
  revealTargets.forEach((element, index) => {
    element.dataset.reveal = '';
    element.style.transitionDelay = `${(index % 4) * 70}ms`;
  });
  document.documentElement.classList.add('reveal-ready');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
    // Quita el retraso escalonado para que el hover responda al instante.
    setTimeout(() => { entry.target.style.transitionDelay = ''; }, 900);
  }), { rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(element => revealObserver.observe(element));
  // Al filtrar o buscar, los productos que quedan en el catálogo vuelven a entrar en cascada.
  const replayCatalog = () => requestAnimationFrame(() => {
    const visibleCards = Array.from(document.querySelectorAll('#productos .product-card:not(.search-hidden):not([hidden])'));
    visibleCards.forEach((card, index) => {
      card.classList.remove('is-visible');
      card.style.transitionDelay = `${Math.min(index, 11) * 45}ms`;
    });
    void document.body.offsetHeight;
    visibleCards.forEach(card => card.classList.add('is-visible'));
    setTimeout(() => visibleCards.forEach(card => { card.style.transitionDelay = ''; }), 1200);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-catalog-category], .categories .category, #searchButton, .search-option, .search-all, [data-brand-filter], .empty-shortcuts button')) replayCatalog();
  });
  searchInput.addEventListener('keydown', event => { if (event.key === 'Enter') replayCatalog(); });
}
// Marca en el menú la sección que está en pantalla.
(() => {
  const navLinks = Array.from(document.querySelectorAll('#mainNav > a[href^="#"]'));
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const visible = new Map();
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.isIntersecting));
    const current = sections.find(section => visible.get(section));
    navLinks.forEach(link => {
      const isCurrent = Boolean(current) && link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach(section => spy.observe(section));
})();
// Buscador con resultados en vivo mientras se escribe.
(() => {
  const searchBox = document.querySelector('.site-header .search');
  if (!searchBox) return;
  const allCards = Array.from(document.querySelectorAll('#productos .product-card:not([hidden])'));
  const escapeHTML = value => value.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  const results = document.createElement('div');
  results.id = 'searchResults';
  results.className = 'search-results';
  results.setAttribute('role', 'listbox');
  results.hidden = true;
  searchBox.insertAdjacentElement('afterend', results);
  searchInput.setAttribute('aria-controls', 'searchResults');
  searchInput.setAttribute('aria-autocomplete', 'list');
  searchInput.setAttribute('autocomplete', 'off');
  let activeIndex = -1;
  let timer;

  const place = () => {
    const box = searchBox.getBoundingClientRect();
    const header = searchBox.closest('.site-header').getBoundingClientRect();
    results.style.left = `${box.left - header.left}px`;
    results.style.top = `${box.bottom - header.top + 6}px`;
    results.style.width = `${box.width}px`;
  };
  const close = () => { results.hidden = true; activeIndex = -1; searchInput.removeAttribute('aria-activedescendant'); };
  const options = () => Array.from(results.querySelectorAll('[role="option"]'));
  const setActive = index => {
    const list = options();
    if (!list.length) return;
    activeIndex = (index + list.length) % list.length;
    list.forEach((option, i) => option.classList.toggle('is-active', i === activeIndex));
    searchInput.setAttribute('aria-activedescendant', list[activeIndex].id);
    list[activeIndex].scrollIntoView({ block: 'nearest' });
  };
  const showProduct = name => {
    filterCatalog(card => card.dataset.product === name);
    searchInput.value = name;
    close();
    showCatalog();
  };
  const render = () => {
    const query = searchInput.value.trim();
    const terms = normalizeText(query).split(' ').filter(Boolean);
    if (terms.join('').length < 2) { close(); return; }
    const matches = allCards.filter(card => {
      const text = normalizeText(`${card.dataset.product} ${card.dataset.category} ${card.querySelector('p')?.textContent || ''}`);
      return terms.every(term => text.includes(term));
    });
    if (!matches.length) {
      const message = encodeURIComponent(`Hola, ¿tienen ${query}?`);
      results.innerHTML = `<div class="search-empty"><strong>No encontramos “${escapeHTML(query)}” en la página.</strong><span>Puede que lo tengamos en tienda.</span><a href="https://wa.me/573132639129?text=${message}" target="_blank" rel="noopener">Preguntar por WhatsApp</a></div>`;
    } else {
      results.innerHTML = matches.slice(0, 6).map((card, index) => {
        const image = card.querySelector('.product-image img');
        const price = card.querySelector('.product-price')?.textContent.trim() || 'Precio por confirmar';
        const name = escapeHTML(card.dataset.product);
        return `<div class="search-option" role="option" id="searchOption${index}" data-name="${name}">${image ? `<img src="${image.getAttribute('src')}" alt="" />` : '<span class="search-thumb"></span>'}<span class="search-option-text"><small>${card.dataset.category}</small><strong>${escapeHTML(card.querySelector('h3')?.textContent.trim() || card.dataset.product)}</strong><em>${escapeHTML(price)}</em></span><button type="button" class="search-add" aria-label="Añadir ${name} al carrito">+</button></div>`;
      }).join('') + `<button type="button" class="search-all">Ver ${matches.length === 1 ? 'el resultado' : `los ${matches.length} resultados`} en el catálogo</button>`;
    }
    activeIndex = -1;
    place();
    results.hidden = false;
  };

  searchInput.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 110); });
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim().length >= 2) render(); });
  searchInput.addEventListener('keydown', event => {
    if (results.hidden) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(activeIndex + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(activeIndex - 1); }
    else if (event.key === 'Escape') { close(); }
    else if (event.key === 'Enter') {
      const option = options()[activeIndex];
      if (option) { event.preventDefault(); event.stopImmediatePropagation(); showProduct(option.dataset.name); }
      else close();
    }
  }, true);
  results.addEventListener('mousedown', event => event.preventDefault());
  results.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    const addButton = event.target.closest('.search-add');
    if (addButton && option) {
      document.querySelector(`#productos .product-card[data-product="${CSS.escape(option.dataset.name)}"] .add-cart`)?.click();
      addButton.textContent = '✓';
      addButton.classList.add('is-added');
      return;
    }
    if (option) { showProduct(option.dataset.name); return; }
    if (event.target.closest('.search-all')) { close(); searchButton.click(); }
  });
  // Los clics simulados (como el + que pulsa el botón del catálogo) no deben cerrar la lista.
  document.addEventListener('click', event => { if (event.isTrusted && !searchBox.contains(event.target) && !results.contains(event.target)) close(); });
  window.addEventListener('resize', () => { if (!results.hidden) place(); });
})();

// Respuesta visible al añadir: el botón confirma y el contador del carrito salta.
document.addEventListener('click', event => {
  const button = event.target.closest('.add-cart, .best-add');
  if (!button) return;
  [document.querySelector('#cartButton'), document.querySelector('#mobileCart')].forEach(counter => {
    if (!counter) return;
    counter.classList.remove('bump');
    void counter.offsetWidth;
    counter.classList.add('bump');
  });
  if (button.classList.contains('is-added')) return;
  const label = button.textContent;
  button.classList.add('is-added');
  button.textContent = 'Agregado al carrito';
  setTimeout(() => { button.classList.remove('is-added'); button.textContent = label; }, 1400);
});

// Barra inferior para celular.
(() => {
  const mobileCartCount = document.querySelector('#mobileCartCount');
  const desktopCount = document.querySelector('#cartCount');
  if (!mobileCartCount || !desktopCount) return;
  const syncMobileCount = () => {
    mobileCartCount.textContent = desktopCount.textContent;
    mobileCartCount.hidden = desktopCount.textContent === '0';
  };
  new MutationObserver(syncMobileCount).observe(desktopCount, { childList: true, characterData: true, subtree: true });
  syncMobileCount();
  document.querySelector('#mobileCart')?.addEventListener('click', () => document.querySelector('#cartButton').click());
  document.querySelector('#mobileSearch')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => searchInput.focus(), 350);
  });
})();


// Indicador de pasos del pedido: pasa al paso 2 cuando aparecen las opciones para confirmar.
(() => {
  const actions = document.querySelector('#checkoutActions');
  const steps = document.querySelectorAll('.checkout-steps li');
  if (!actions || steps.length < 2) return;
  const sync = () => {
    const reviewed = !actions.hidden;
    steps[0].classList.toggle('is-current', !reviewed);
    steps[0].classList.toggle('is-done', reviewed);
    steps[1].classList.toggle('is-current', reviewed);
  };
  new MutationObserver(sync).observe(actions, { attributes: true, attributeFilter: ['hidden'] });
  sync();
})();

// Ficha de producto: amplía la vista previa con precio, cantidad, carrito, favoritos y relacionados.
let detailCard = null;
function catalogCardFor(card) {
  if (card.classList.contains('product-card') && card.closest('#productos')) return card;
  const name = card.dataset.product || card.querySelector('[data-product]')?.dataset.product;
  return name ? document.querySelector(`#productos .product-card[data-product="${CSS.escape(name)}"]`) || card : card;
}
function fillProductDetail(sourceCard) {
  const card = catalogCardFor(sourceCard);
  detailCard = card;
  const label = card.querySelector('p')?.textContent.trim() || '';
  const [category, brand] = label.split(' · ');
  const name = card.querySelector('h3')?.textContent.trim() || card.dataset.product;
  document.querySelector('#productPreviewCategory').textContent = brand || category || '';
  const categoryLink = document.querySelector('#detailCategoryLink');
  categoryLink.textContent = card.dataset.category || category || 'Productos';
  categoryLink.dataset.detailCategory = card.dataset.category || '';

  const priceText = card.querySelector('.product-price')?.textContent.trim();
  document.querySelector('#detailPrice').textContent = priceText || 'Precio por confirmar';
  document.querySelector('#detailPrice').classList.toggle('is-pending', !priceText || !/\d/.test(priceText));

  const cardVariant = card.querySelector('.product-variant');
  const variantField = document.querySelector('#detailVariantField');
  const variantSelect = document.querySelector('#detailVariant');
  variantField.hidden = !cardVariant;
  if (cardVariant) {
    variantSelect.innerHTML = cardVariant.innerHTML;
    variantSelect.value = cardVariant.value;
  }
  document.querySelector('#detailQuantity').value = 1;
  syncDetailFavorite();

  const siteUrl = `${location.origin}${location.pathname}`;
  document.querySelector('#detailAsk').href = `https://wa.me/573132639129?text=${encodeURIComponent(`Hola, quiero información sobre ${name}.`)}`;
  document.querySelector('#detailShare').href = `https://wa.me/?text=${encodeURIComponent(`${name} en Agrocentro Rivera: ${siteUrl}`)}`;

  const related = Array.from(document.querySelectorAll(`#productos .product-card[data-category="${CSS.escape(card.dataset.category || '')}"]:not([hidden])`))
    .filter(other => other !== card && other.querySelector('.product-image img'))
    .slice(0, 4);
  document.querySelector('.detail-related').hidden = !related.length;
  document.querySelector('#detailRelated').innerHTML = related.map(other => {
    const img = other.querySelector('.product-image img');
    return `<button type="button" class="detail-related-item" data-related="${other.dataset.product.replace(/"/g, '&quot;')}"><img src="${img.getAttribute('src')}" alt="" /><span>${other.querySelector('h3')?.textContent.trim() || other.dataset.product}</span><small>${other.querySelector('.product-price')?.textContent.trim() || 'Precio por confirmar'}</small></button>`;
  }).join('');
}
function syncDetailFavorite() {
  if (!detailCard) return;
  const saved = favorites.some(item => item.name === productData(detailCard).name);
  const button = document.querySelector('#detailFavorite');
  button.textContent = saved ? '♥ Guardado en favoritos' : '♡ Guardar en favoritos';
  button.classList.toggle('is-saved', saved);
}
(() => {
  const dialog = document.querySelector('#productPreview');
  if (!dialog) return;
  const quantityInput = document.querySelector('#detailQuantity');
  const clampQuantity = value => Math.min(5000, Math.max(1, Number.parseInt(value, 10) || 1));

  dialog.querySelectorAll('[data-detail-step]').forEach(button => button.addEventListener('click', () => {
    quantityInput.value = clampQuantity(Number(quantityInput.value) + Number(button.dataset.detailStep));
  }));
  quantityInput.addEventListener('change', () => { quantityInput.value = clampQuantity(quantityInput.value); });

  document.querySelector('#detailVariant').addEventListener('change', event => {
    const cardVariant = detailCard?.querySelector('.product-variant');
    if (!cardVariant) return;
    cardVariant.value = event.target.value;
    cardVariant.dispatchEvent(new Event('change'));
    document.querySelector('#detailPrice').textContent = detailCard.querySelector('.product-price')?.textContent.trim() || '';
  });

  document.querySelector('#detailAdd').addEventListener('click', event => {
    if (!detailCard) return;
    const quantity = clampQuantity(quantityInput.value);
    detailCard.querySelector('.add-cart')?.click();
    const item = cart.find(entry => entry.name === productData(detailCard).name);
    if (item && quantity > 1) {
      item.quantity = Math.min(5000, item.quantity + quantity - 1);
      syncCounters();
    }
    const button = event.currentTarget;
    button.classList.add('is-added');
    button.textContent = quantity > 1 ? `${quantity} unidades agregadas` : 'Agregado al carrito';
    setTimeout(() => { button.classList.remove('is-added'); button.textContent = 'Agregar al carrito'; }, 1600);
  });

  document.querySelector('#detailFavorite').addEventListener('click', () => {
    detailCard?.querySelector('.favorite')?.click();
    syncDetailFavorite();
  });

  dialog.addEventListener('click', event => {
    const related = event.target.closest('[data-related]');
    if (related) {
      const card = document.querySelector(`#productos .product-card[data-product="${CSS.escape(related.dataset.related)}"]`);
      if (card) openProductPreview(card);
      return;
    }
    const toCatalog = event.target.closest('[data-detail-catalog], [data-detail-category]');
    if (!toCatalog) return;
    const category = toCatalog.dataset.detailCategory || '';
    dialog.close();
    const filterButton = document.querySelector(`[data-catalog-category="${CSS.escape(category)}"]`);
    if (filterButton) filterButton.click();
    showCatalog();
  });

  // Tocar cualquier parte de la tarjeta abre la ficha, salvo sus botones y selectores.
  // La foto ya tiene su propio manejador (también con teclado), por eso se excluye aquí.
  document.addEventListener('click', event => {
    const card = event.target.closest('.product-card, .best-seller-card');
    if (!card || event.target.closest('button, a, select, input, label, .product-image.photo, .best-image')) return;
    openProductPreview(card);
  });
})();

// Etiquetas de los productos.
// "Nuevo" aparece sola durante DIAS_COMO_NUEVO a partir de data-added="AAAA-MM-DD" de cada producto.
// "Oferta" aparece en los productos que tengan el atributo data-oferta (por ejemplo: data-oferta).
const DIAS_COMO_NUEVO = 30;
(() => {
  const today = new Date();
  document.querySelectorAll('#productos .product-card').forEach(card => {
    card.querySelectorAll('.badge').forEach(badge => badge.remove());
    let label = '';
    let kind = '';
    if (card.hasAttribute('data-oferta')) {
      label = 'Oferta';
      kind = 'offer';
    } else if (card.dataset.added) {
      const added = new Date(`${card.dataset.added}T00:00:00-05:00`);
      const days = (today - added) / 86400000;
      if (days >= 0 && days <= DIAS_COMO_NUEVO) label = 'Nuevo';
    }
    if (!label) return;
    const badge = document.createElement('span');
    badge.className = `badge${kind ? ` ${kind}` : ''}`;
    badge.textContent = label;
    card.prepend(badge);
  });
})();
