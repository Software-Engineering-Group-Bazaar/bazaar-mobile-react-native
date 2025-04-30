// statusTypes.ts
export const OrderStatusEnum = [
    "Requested",
    "Confirmed",
    "Rejected",
    "Ready",
    "Sent",
    "Delivered",
    "Cancelled",
] as const;
  
export type OrderStatus = (typeof OrderStatusEnum)[number];