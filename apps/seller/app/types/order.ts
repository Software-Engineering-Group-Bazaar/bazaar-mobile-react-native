export type OrderStatus =
  | 'pending' // čeka na odobrenje
  | 'approved' // odobrena
  | 'ready'
  | 'sent'
  | 'delivered'
  | 'rejected'
  | 'canceled';
 
 
 export interface OrderProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
 }
 
 
 export interface Order {
  id: number;
  buyerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
 }
 