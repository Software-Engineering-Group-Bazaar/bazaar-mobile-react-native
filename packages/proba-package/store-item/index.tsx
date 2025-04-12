// packages/store-item/index.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
}

interface StoreItemProps {
  store: Store;
  onPress?: (store: Store) => void;
}

const StoreItem: React.FC<StoreItemProps> = ({ store, onPress }) => {
  const { name, address, description, isActive, logoUrl } = store;
  const city = address ? address.split(',').pop()?.trim() : '';
  const shortDescription = description?.substring(0, 50) + (description?.length > 50 ? '...' : '');

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(store)}>
      {logoUrl && (
        <View style={styles.logoContainer}>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        {shortDescription && <Text style={styles.description}>{shortDescription}</Text>}
        {city && <Text style={styles.city}>{city}</Text>}
        <View style={styles.statusContainer}>
          <Text style={[
            styles.status,
            isActive ? styles.statusActive : styles.statusInactive,
          ]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: '#ffc1a6', 
  },
  logoContainer: {
    alignItems: 'center', 
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  infoContainer: {
    flex: 1,
    alignItems: 'center', 
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 6,
    textAlign: 'center', 
  },
  city: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    fontSize: 10,
  },
  statusActive: {
    backgroundColor: '#f0fff4',
    color: '#1c7430',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
});

export default StoreItem;