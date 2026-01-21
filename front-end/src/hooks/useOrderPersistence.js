import { useEffect } from 'react';

const STORAGE_KEY = 'restaurant_order_v1';

export function useOrderPersistence({
  cart,
  setCart,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  paymentMethod,
  setPaymentMethod,
  orderNumber,
  setOrderNumber,
  prepTime,
  setPrepTime
}) {
  // 🔄 Carregar do localStorage na inicialização
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);

      setCart(data.cart || []);
      setCustomerName(data.customerName || '');
      setCustomerPhone(data.customerPhone || '');
      setPaymentMethod(data.paymentMethod || '');
      setOrderNumber(data.orderNumber || null);
      setPrepTime(data.prepTime || 0);
    } catch (err) {
      console.error('Erro ao restaurar pedido:', err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setCart, setCustomerName, setCustomerPhone, setOrderNumber, setPaymentMethod, setPrepTime]);

  // 💾 Persistir sempre que algo relevante mudar
  useEffect(() => {
    const payload = {
      cart,
      customerName,
      customerPhone,
      paymentMethod,
      orderNumber,
      prepTime
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    cart,
    customerName,
    customerPhone,
    paymentMethod,
    orderNumber,
    prepTime
  ]);

  // 🧹 Limpeza explícita
  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { clearStorage };
}