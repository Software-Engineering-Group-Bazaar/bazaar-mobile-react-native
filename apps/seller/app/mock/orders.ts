// 📦 File: apps/seller/mock/orders.ts
import { Order } from '../types/order';

const mockOrders: Order[] = [
  {
    id: 24,
    buyerEmail: 'buyer@example.com',
    products: [
      { id: 1, name: 'LED TV Samsung 55"', quantity: 1, price: 960 },
      { id: 2, name: 'Muška jakna zimska', quantity: 2, price: 120 },
    ],
    totalAmount: 1200,
    status: 'pending',
    createdAt: '2024-02-20T10:30:00Z',
  },
  {
    id: 25,
    buyerEmail: 'marko@gmail.com',
    products: [
      { id: 3, name: 'Apple Watch', quantity: 1, price: 400 },
    ],
    totalAmount: 400,
    status: 'approved',
    createdAt: '2024-02-22T14:05:00Z',
  },
  {
    id: 26,
    buyerEmail: 'ana@test.com',
    products: [
      { id: 4, name: 'Maslinovo ulje 1L', quantity: 5, price: 10 },
    ],
    totalAmount: 50,
    status: 'canceled',
    createdAt: '2024-03-01T09:15:00Z',
  },
  {
    id: 27,
    buyerEmail: 'kenan@test.com',
    products: [
      { id: 1, name: 'LED TV Samsung 55"', quantity: 1, price: 1200 }
    ],
    totalAmount: 1200,
    status: 'approved',
    createdAt: '2025-04-15T09:30:00Z'
  },
  {
    id: 28,
    buyerEmail: 'amina@test.com',
    products: [
      { id: 3, name: 'Muška jakna zimaska', quantity: 2, price: 150 }
    ],
    totalAmount: 300,
    status: 'pending',
    createdAt: '2025-04-15T10:45:00Z'
  },
  {
    id: 29,
    buyerEmail: 'edin@test.com',
    products: [
      { id: 7, name: 'Laptop Dell XPS 13', quantity: 1, price: 2200 }
    ],
    totalAmount: 2200,
    status: 'sent',
    createdAt: '2025-04-15T12:00:00Z'
  },
  {
    id: 30,
    buyerEmail: 'sara@test.com',
    products: [
      { id: 5, name: 'Biciklo MTB', quantity: 1, price: 700 }
    ],
    totalAmount: 700,
    status: 'delivered',
    createdAt: '2025-04-15T13:20:00Z'
  },
  {
    id: 31,
    buyerEmail: 'almin@test.com',
    products: [
      { id: 8, name: 'Pametni sat Garmin', quantity: 1, price: 350 }
    ],
    totalAmount: 350,
    status: 'ready',
    createdAt: '2025-04-15T14:45:00Z'
  },
  {
    id: 32,
    buyerEmail: 'lejla@test.com',
    products: [
      { id: 9, name: 'Kafa 1kg', quantity: 3, price: 12 }
    ],
    totalAmount: 36,
    status: 'rejected',
    createdAt: '2025-04-15T16:00:00Z'
  }
];

export default mockOrders;
