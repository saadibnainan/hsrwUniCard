
export interface StudentProfile {
  name: string;
  email: string;
  studentId: string; // Matrikelnummer
  birthDate: string;
  degreeProgram: string;
  campus: "Kleve" | "Kamp-Lintfort";
  validUntil: string;
  cardSerial: string;
  chipUid: string;
  isBlocked: boolean;
  isLost: boolean;
  issueNumber: number;
  physicalCardStatus: "None" | "Ordered" | "Shipped" | "Delivered";
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  dueDate: string;
  renewCount: number;
  isOverdue: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // positive for top-up, negative for spend
  date: string;
  category: "Mensa" | "Library" | "Transit" | "Admin";
}

export interface AuditLog {
  timestamp: string;
  type: "INFO" | "SECURITY" | "TRANSACTION" | "ERROR";
  message: string;
}

// Initial Data
export const INITIAL_PROFILE: StudentProfile = {
  name: "Mushfiqur Joy",
  email: "mushfiqur.joy@hsrw.org",
  studentId: "32363",
  birthDate: "04.12.2001",
  degreeProgram: "B.Sc in Mobility & Logistics",
  campus: "Kamp-Lintfort",
  validUntil: "30.09.2026",
  cardSerial: "HSRW-9847-32363",
  chipUid: "04:A2:F3:8C:55:6A:80",
  isBlocked: false,
  isLost: false,
  issueNumber: 1,
  physicalCardStatus: "None",
};

export const INITIAL_BOOKS: LibraryBook[] = [
  {
    id: "lib-101",
    title: "Introduction to Full-Stack Web Development",
    author: "Dr. J. Doe",
    dueDate: "2026-06-12",
    renewCount: 0,
    isOverdue: false,
  },
  {
    id: "lib-102",
    title: "Principles of UI/UX Design & Typography",
    author: "M. A. Rahman",
    dueDate: "2026-06-17",
    renewCount: 0,
    isOverdue: false,
  },
  {
    id: "lib-103",
    title: "Human-Computer Interaction in Higher Education",
    author: "Prof. S. Müller",
    dueDate: "2026-06-22",
    renewCount: 0,
    isOverdue: false,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    description: "Mensa Kamp-Lintfort - Lunch",
    amount: -3.10,
    date: "2026-06-08T12:30:00Z",
    category: "Mensa",
  },
  {
    id: "tx-2",
    description: "Mensa Kamp-Lintfort - Coffee",
    amount: -1.20,
    date: "2026-06-07T14:15:00Z",
    category: "Mensa",
  },
  {
    id: "tx-3",
    description: "Library Kamp-Lintfort - Late Fee",
    amount: -1.50,
    date: "2026-06-05T10:00:00Z",
    category: "Library",
  },
  {
    id: "tx-4",
    description: "Mensa Card Top-up (PayPal)",
    amount: 20.00,
    date: "2026-06-04T09:45:00Z",
    category: "Mensa",
  },
];

export const CANTEEN_MENUS = {
  "Kamp-Lintfort": [
    { id: "m-kl-1", name: "Green Lentil Dal with Coconut Milk & Basmati Rice", category: "Vegan", priceStudent: 2.50, priceStaff: 4.50 },
    { id: "m-kl-2", name: "Jäger-Schnitzel (Pork) with French Fries & Side Salad", category: "Meat", priceStudent: 3.50, priceStaff: 5.50 },
    { id: "m-kl-3", name: "Gnocchi in Rich Spinach Cream Sauce", category: "Vegetarian", priceStudent: 2.90, priceStaff: 4.90 },
    { id: "m-kl-4", name: "Vanilla Panna Cotta with Fresh Raspberry Coulis", category: "Dessert", priceStudent: 0.95, priceStaff: 1.50 },
  ],
  "Kleve": [
    { id: "m-kv-1", name: "Crispy Sweet Potato & Chickpea Curry", category: "Vegan", priceStudent: 2.60, priceStaff: 4.60 },
    { id: "m-kv-2", name: "Baked Salmon Fillet with Dill-Lemon Sauce & Wild Rice", category: "Fish", priceStudent: 4.50, priceStaff: 6.80 },
    { id: "m-kv-3", name: "Pasta Bolognese (Halal Beef) with Shredded Grana Padano", category: "Meat", priceStudent: 3.10, priceStaff: 5.10 },
    { id: "m-kv-4", name: "Decadent Double Chocolate Mousse", category: "Dessert", priceStudent: 0.90, priceStaff: 1.40 },
  ]
};
