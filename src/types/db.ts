export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  productId: string;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  productId: string;
};

export type ProductSpec = {
  id: string;
  label: string;
  value: string;
  productId: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryWithCount = Category & {
  _count: { products: number };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  featured: boolean;
  available: boolean;
  isNew: boolean;
  isOffer: boolean;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
  images: ProductImage[];
  colors: ProductColor[];
  specs: ProductSpec[];
  category: Category;
  _count?: { images: number; colors: number };
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type QuoteRequest = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string | null;
  units: number | null;
  message: string | null;
  status: string;
  createdAt: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  active: boolean;
  order: number;
  createdAt?: string;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  bgColor: string;
  active: boolean;
  order: number;
  format: "wide" | "square";
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt?: string;
};
