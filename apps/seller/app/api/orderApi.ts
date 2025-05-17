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

  let addressDetails = null;
  if (res.data.addressId) {
    try {
      const addressRes = await api.get(`/user-profile/address/${res.data.addressId}`);
      addressDetails = addressRes.data;
    } catch (err) {
      console.error("Failed to fetch address:", err);
    }
  }

  return {
    ...res.data,
    items: enrichedItems,
    expectedReadyAt: res.data.expectedReadyAt,
    addressDetails, // nova polja
  };
};


// Kreiranje konverzacije
export const apiCreateConversation = async (targetUserId: number, storeId: number, orderId: number) => {
  try {
    console.log(targetUserId, storeId, orderId);
    const response = await api.post("/Chat/conversations/find-or-create", {
      targetUserId: targetUserId,
      storeId: storeId,
      orderId: orderId,
      productId: null,
    });
    console.log("ovdje", response.data);

    if (response.status === 200 || response.status === 201) {
      const conversationId = response.data.id;
      return conversationId;
    } else {
      console.error("Failed to start conversation. Status:", response.status);
    }
  } catch (error) {
    console.error("Error starting conversation:", error);
  }
};

// Ažuriranje statusa narudžbe s dodatnim podacima
export const updateOrderStatus = (
  id: string,
  newStatus: string,
  adminDelivery?: boolean,
  estimatedPreparationTimeInMinutes?: number
) => {
  return api.put(`/Order/update/status/${id}`, {
    newStatus,
    adminDelivery,
    estimatedPreparationTimeInMinutes,
  });
};

// Brisanje narudžbe
export const deleteOrder = (id: string) => {
  return api.delete(`/Order/${id}`);
};
