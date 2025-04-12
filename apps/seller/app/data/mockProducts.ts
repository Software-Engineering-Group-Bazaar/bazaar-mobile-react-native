// apps/seller/app/data/mockProducts.ts

export interface Product {
    id: string;
    name: string;
    price: string;
    weight: string;
    category: string;
    description?: string;
    imageUrls: string[];
  }
  
  export const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: '$199.99',
      weight: '250g',
      category: 'Electronics',
      description: 'Premium wireless headphones with active noise cancellation, delivering crystal-clear sound quality and exceptional comfort for extended listening sessions.',
      imageUrls: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ],
    },
    {
      id: '2',
      name: 'Smart Watch',
      price: '$299.99',
      weight: '45g',
      category: 'Wearables',
      description: 'Advanced smartwatch featuring health monitoring, fitness tracking, and seamless smartphone integration in a sleek, modern design.',
      imageUrls: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
      ],
    },
    {
      id: '3',
      name: 'Wireless Speaker',
      price: '$149.99',
      weight: '500g',
      category: 'Audio',
      description: 'Portable wireless speaker with 360° sound, waterproof design, and long-lasting battery life for your outdoor adventures.',
      imageUrls: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
        'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=800',
      ],
    },
    {
      id: '4',
      name: 'Noise-Canceling Earbuds',
      price: '$249.99',
      weight: '58g',
      category: 'Audio',
      description: 'True wireless earbuds with advanced noise cancellation, touch controls, and premium sound quality in a compact design.',
      imageUrls: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        'https://images.unsplash.com/photo-1631867675167-90a456a90863?w=800',
      ],
    },
    {
      id: '6',
      name: 'Bluetooth Speaker',
      price: '$89.99',
      weight: '320g',
      category: 'Audio',
      description: 'Compact Bluetooth speaker with deep bass and water-resistant design.',
      imageUrls: [
        'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800',
      ],
    },
  ];
  