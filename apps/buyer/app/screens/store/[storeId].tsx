import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text } from "react-native";

const Store = () => {
    const router = useRouter();
    const { storeId } = useLocalSearchParams();
    return (
        <Text>
            Store ID: {storeId}
        </Text>
    ); 
};

export default Store;