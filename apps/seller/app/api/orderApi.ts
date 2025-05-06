import api from "./defaultApi";

// Dohvatanje narudžbe 
export const getOrderById = async (id: string) => {
  const res = await api.get(`/Order/${id}`);
  const enrichedItems = await Promise.all(
    res.data.orderItems.map(async (item: any) => {
      const p = await api.get(`/Catalog/products/${item.productId}`);
      return {
        ...item,
        productName: p.data.name,
        productImageUrl: p.data.photos?.[0],
      };
    })
  );
  return { ...res.data, items: enrichedItems };
};

// Ažuriranje statusa narudžbe
export const updateOrderStatus = (id: string, newStatus: string) => {
  return api.put(`/Order/update/status/${id}`, { newStatus });
};

// Brisanje narudžbe
export const deleteOrder = (id: string) => {
  return api.delete(`/Order/${id}`);
};
