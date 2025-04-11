// apps/seller/app/data/mockStores.ts

export interface Store {
    id: string;
    name: string;
    address: string;
    description?: string;
    image: string;
    categoryLabel: string;
  }
  
  export const mockStores: Store[] = [
    {
      id: '1',
      name: 'Green Market',
      address: '123 Main Street, City',
      description: 'Fresh organic produce and local goods.',
      categoryLabel: 'Market',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80',
    },
    {
      id: '2',
      name: 'Fresh Foods',
      address: '456 Oak Avenue, Town',
      description: 'Quality groceries and fresh produce.',
      categoryLabel: 'Groceries',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80',
    },

      {
        id: '4',
        name: 'Healthy Hub',
        address: '12 Healthy Way, Wellness City',
        description: 'Organic snacks, vitamins and eco products.',
        categoryLabel: 'Health Store',
        image: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=500&q=80',
      },
      {
        id: '5',
        name: 'EcoMart',
        address: '88 Green Blvd, Ecotown',
        description: 'Zero-waste products and sustainable goods.',
        categoryLabel: 'Eco Shop',
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&q=80',

      },
      
  ];
  