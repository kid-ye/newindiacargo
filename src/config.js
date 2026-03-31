export const API_URL = import.meta.env.VITE_API_URL;

export const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
export const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
export const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const SHIPPING_RATES = { train: 70, air: 130, express: 180 };

export const SHIPPING_MODES = [
  { value: 'train', label: '🚂 Train', sub: `₹${SHIPPING_RATES.train}/kg` },
  { value: 'air', label: '✈️ Air', sub: `₹${SHIPPING_RATES.air}/kg` },
  { value: 'express', label: '⚡ Express', sub: `₹${SHIPPING_RATES.express}/kg · Metro only` },
];

export const ORDER_STATUSES = ['Placed', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
