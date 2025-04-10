// packages/store-item/index.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Store {
  id: number;
  active: boolean;
  categoryid: number;
  name: string;
  address: string;
  description?: string;
  logoUrl?: string; 
}

interface StoreItemProps {
  store: Store;
  onPress?: (store: Store) => void;
}

const StoreItem: React.FC<StoreItemProps> = ({ store, onPress }) => {
  const { name, address, description, active, logoUrl } = store;
  const city = address ? address.split(',').pop()?.trim() : ''; 

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(store)}>
      {logoUrl && (
        <Image source={{ uri: logoUrl }} style={styles.logo} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        {city && <Text style={styles.city}>{city}</Text>}
        <Text style={[
          styles.status,
          active ? styles.statusActive : styles.statusInactive,
        ]}>
          {active ? 'Aktivna' : 'Neaktivna'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 16,
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
    textAlign: 'left',
  },
  city: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 8,
    textAlign: 'left',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    fontSize: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
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