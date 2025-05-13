// proba-package/ad-item/index.tsx

import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

// --- Ad specific Types needed for this component and parent ---
export interface AdData {
  id: number;
  imageUrl: string;
  storeId: number;
  productId: number; // Need productId for navigation
  description?: string;
}

// Define the Advertisement type here as it's core to the item being displayed/clicked
export interface Advertisement {
    id: number; // Need ad ID for clicks API
    sellerId: string;
    views: number;
    viewPrice: number;
    clicks: number;
    clickPrice: number; // Need clickPrice for reward API
    conversions: number;
    conversionPrice: number;
    adType: string;
    triggers: string[];
    startTime: string;
    endTime: string;
    isActive: boolean;
    adData: AdData[]; // Array of AdData
    // Note: featureVec is NOT part of Advertisement itself based on the API response structure,
    // it's a sibling property in the 'result' object. We'll handle that in StoresScreen.
}


// Define props for the AdItem component
export interface AdItemProps {
    // Pass the first adData item for display
    adData: AdData;
    // Pass the entire Advertisement object to the press handler
    onPress?: (ad: Advertisement) => void;
    // Also pass the entire Advertisement object to the component itself
    // so the press handler can access its properties (id, clickPrice, etc.)
    ad: Advertisement;
}

// --- Ad Item Component ---
// adData is for display, ad is for the press handler context
const AdItem: React.FC<AdItemProps> = ({ adData, onPress, ad }) => {
    // Handle the press event
    const handlePress = () => {
      // Call the parent's handler, passing the entire ad object
      if (onPress) {
        onPress(ad);
      }
    };

    // Only render if adData is provided (basic validity check)
    if (!adData) {
        console.warn("AdItem received no adData, not rendering.");
        return null;
    }

    return (
        <TouchableOpacity style={styles.adContainer} onPress={handlePress} activeOpacity={0.9}>
            {adData.imageUrl ? (
                <Image
                    source={{ uri: adData.imageUrl }}
                    style={styles.adImage}
                    resizeMode="cover"
                    onError={(e) => console.error("Failed to load ad image:", adData.imageUrl, e.nativeEvent.error)}
                />
            ) : null}
            {adData.description ? (
                <Text style={styles.adDescription}>{adData.description}</Text>
            ) : null}
             {/* Optional: Display a placeholder if no image/description */}
             {!adData.imageUrl && !adData.description ? (
                <Text style={styles.adDescription}>Reklama bez sadržaja.</Text>
             ) : null}
        </TouchableOpacity>
    );
};

// --- Styles specific to AdItem ---
const styles = StyleSheet.create({
  adContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden', // Ensure image corners are rounded
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  adImage: {
    width: '100%', // Image takes full width of its container
    height: 150, // Fixed height for ad images
    resizeMode: 'cover', // Or 'contain', depending on desired look
  },
  adDescription: {
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default AdItem; // Export the component