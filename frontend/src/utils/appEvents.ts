// Tiny window-event bus so the navbar badges can refresh live when the cart or
// favorites change anywhere in the app, without prop drilling.

export const CART_CHANGED = 'mv:cart-changed';
export const FAVORITES_CHANGED = 'mv:favorites-changed';

export const emitCartChanged = (): void => {
  window.dispatchEvent(new Event(CART_CHANGED));
};

export const emitFavoritesChanged = (): void => {
  window.dispatchEvent(new Event(FAVORITES_CHANGED));
};

export const onCartChanged = (handler: () => void): (() => void) => {
  window.addEventListener(CART_CHANGED, handler);
  return () => window.removeEventListener(CART_CHANGED, handler);
};

export const onFavoritesChanged = (handler: () => void): (() => void) => {
  window.addEventListener(FAVORITES_CHANGED, handler);
  return () => window.removeEventListener(FAVORITES_CHANGED, handler);
};
