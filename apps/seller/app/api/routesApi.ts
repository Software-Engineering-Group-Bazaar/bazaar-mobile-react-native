import api from "./defaultApi";
import * as SecureStore from "expo-secure-store";

export async function apiCreateRoute(orderIds: number[], routeData: any) {
    try {
        const response = await api.post("/Delivery/routes", {
            orderIds: orderIds,
            routeData: {
                data: routeData,
                hash: "AAaaAAA",
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
        console.log(response)

        if (response.status !== 200 && response.status !== 201) {
            console.error("Failed to start conversation. Status:", response.status);
        } 

        let route = response.data;
        console.log(response.data)

        return route;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}