export const outlets = [
  {
    id: "downtown",
    name: "Fliplyn Downtown",
    description: "Main branch – full menu available",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  },
  {
    id: "mall",
    name: "Fliplyn Mall Express",
    description: "Quick bites & beverages",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349",
  },
  {
    id: "university",
    name: "Fliplyn University",
    description: "Student-friendly meals & combos",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
  },
];

export const categories = [
  {
    id: "c1",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1498804103079-a6351b050096",
    outletId: "downtown",
  },
  {
    id: "c2",
    name: "Snacks",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
    outletId: "downtown",
  },
  {
    id: "c3",
    name: "Meals",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    outletId: "downtown",
  },
  {
    id: "c4",
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
    outletId: "downtown",
  },

  {
    id: "c5",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
    outletId: "mall",
  },
  {
    id: "c6",
    name: "Snacks",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349",
    outletId: "mall",
  },

  {
    id: "c7",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1498804103079-a6351b050096",
    outletId: "university",
  },
  {
    id: "c8",
    name: "Meals",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    outletId: "university",
  },
  {
    id: "c9",
    name: "Snacks",
    image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa",
    outletId: "university",
  },
];

export const menuItems = [
  { id: "i1", name: "Iced Latte", price: 4.99, description: "Smooth espresso over ice", categoryId: "c1" },
  { id: "i2", name: "Mango Smoothie", price: 5.49, description: "Fresh mango blended creamy", categoryId: "c1" },
  { id: "i3", name: "Masala Chai", price: 3.49, description: "Spiced Indian tea", categoryId: "c1" },

  { id: "i4", name: "Loaded Fries", price: 6.99, description: "Cheese & jalapeño topped", categoryId: "c2" },
  { id: "i5", name: "Chicken Wings", price: 8.49, description: "6 pcs with BBQ sauce", categoryId: "c2" },
  { id: "i6", name: "Veg Spring Rolls", price: 5.99, description: "Crispy rolls with dip", categoryId: "c2" },

  { id: "i7", name: "Grilled Chicken Bowl", price: 12.99, description: "Rice, grilled chicken, veggies", categoryId: "c3" },
  { id: "i8", name: "Paneer Tikka Wrap", price: 9.99, description: "Spiced paneer in tortilla", categoryId: "c3" },
  { id: "i9", name: "Classic Burger", price: 10.49, description: "Beef patty, cheese, pickles", categoryId: "c3" },

  { id: "i10", name: "Chocolate Lava Cake", price: 7.99, description: "Warm gooey center", categoryId: "c4" },
  { id: "i11", name: "Mango Cheesecake", price: 6.99, description: "Creamy with mango topping", categoryId: "c4" },

  { id: "i12", name: "Cold Brew", price: 4.49, description: "Slow-steeped for smoothness", categoryId: "c5" },
  { id: "i13", name: "Orange Juice", price: 3.99, description: "Freshly squeezed", categoryId: "c5" },
  { id: "i14", name: "Nachos", price: 5.99, description: "Corn chips with salsa", categoryId: "c6" },
  { id: "i15", name: "Mini Samosas", price: 4.49, description: "8 pcs crispy pastry", categoryId: "c6" },

  { id: "i16", name: "Hot Chocolate", price: 3.99, description: "Rich cocoa drink", categoryId: "c7" },
  { id: "i17", name: "Chicken Biryani", price: 8.99, description: "Fragrant spiced rice", categoryId: "c8" },
  { id: "i18", name: "Veg Thali", price: 7.49, description: "Complete meal platter", categoryId: "c8" },
  { id: "i19", name: "French Fries", price: 3.99, description: "Classic salted fries", categoryId: "c9" },
];

export const mockOrders = [
  {
    id: "ORD-1001",
    tokenNumber: 147,
    date: "2026-03-23 12:30",
    items: [
      { name: "Iced Latte", quantity: 2, price: 4.99 },
      { name: "Loaded Fries", quantity: 1, price: 6.99 },
    ],
    total: 16.97,
    status: "Paid",
  },
  {
    id: "ORD-1002",
    tokenNumber: 148,
    date: "2026-03-22 18:15",
    items: [
      { name: "Grilled Chicken Bowl", quantity: 1, price: 12.99 },
      { name: "Mango Smoothie", quantity: 1, price: 5.49 },
    ],
    total: 18.48,
    status: "Paid",
  },
  {
    id: "ORD-1003",
    tokenNumber: 149,
    date: "2026-03-21 09:45",
    items: [{ name: "Masala Chai", quantity: 3, price: 3.49 }],
    total: 10.47,
    status: "Paid",
  },
];