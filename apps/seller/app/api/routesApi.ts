import api from "./defaultApi";
import * as SecureStore from "expo-secure-store";

export async function apiCreateRoute(orderIds: number[], routeDataJSON: any) {
    try {
        const routePayload = {
            orderIds: orderIds,
            routeData: {
                data: routeDataJSON,
                hash: "nes",
            }
        }
        const response = await api.post('/Delivery/routes', JSON.stringify(routePayload), {
            headers: {
                'Content-Type': 'application/json',  // Ensure JSON format
            }
        });

        if (response.status === 200 || response.status === 201) {
            const routeId = response.data.id;
            SecureStore.setItem("routeId", routeId.toString());
        } else {
            console.error("Failed to start conversation. Status:", response.status);
        }

        console.log('Route created successfully.',);
        return response.data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}

export async function apiGetRoute(routeId: number) {
    try {
        const response = await api.get(`/Delivery/routes/${routeId}`);
  
        if (response.status !== 200 && response.status !== 201) {
            console.error("Failed to fetch route. Status:", response.status);
            return;
        }

        const { id, ownerId, orderIds, routeData } = response.data;

        return routeData.data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}