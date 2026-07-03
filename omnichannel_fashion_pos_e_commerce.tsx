import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Monitor, 
  Database, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  TrendingUp, 
  Layers, 
  Package, 
  Users, 
  CreditCard, 
  Tag, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  AlertTriangle,
  RefreshCw,
  Printer,
  CheckCircle,
  FileText,
  X,
  Filter,
  Check
} from 'lucide-react';


// เริ่มต้นข้อมูลจำลองสินค้าแฟชั่นที่มีความละเอียดระดับ Variational SKU (Size/Color/Stock)
const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'เสื้อยืด & เสื้อเชิ้ต', slug: 'tops', count: 4 },
  { id: 'cat-2', name: 'แจ็กเก็ต & คาร์ดิแกน', slug: 'outerwear', count: 2 },
  { id: 'cat-3', name: 'กางเกง & กระโปรง', slug: 'bottoms', count: 2 },
  { id: 'cat-4', name: 'เดรส', slug: 'dresses', count: 1 },
  { id: 'cat-5', name: 'เครื่องประดับ & กระเป๋า', slug: 'accessories', count: 1 }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Minimalist Autumn Blazer',
    category: 'cat-2',
    price: 1890,
    cost: 850,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80',
    description: 'เบลเซอร์ทรงสลิมคัต ดีไซน์มินิมอล ใส่ได้ทั้งงานทางการและกึ่งลำลอง ผ้าเนื้อพรีเมียมไม่ร้อน',
    salesCount: 42,
    variations: {
      colors: ['Cream', 'Charcoal Black', 'Warm Taupe'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: {
        'Cream-S': 5, 'Cream-M': 8, 'Cream-L': 4, 'Cream-XL': 2,
        'Charcoal Black-S': 7, 'Charcoal Black-M': 10, 'Charcoal Black-L': 6, 'Charcoal Black-XL': 3,
        'Warm Taupe-S': 4, 'Warm Taupe-M': 5, 'Warm Taupe-L': 3, 'Warm Taupe-XL': 1,
      }
    }
  },
  {
    id: 'prod-2',
    name: 'Oversized Premium Cotton Tee',
    category: 'cat-1',
    price: 590,
    cost: 220,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    description: 'เสื้อยืดผ้าฝ้ายพรีเมียมหนานุ่มพิเศษ ทรง Oversized สวมใส่สบายระบายอากาศยอดเยี่ยม',
    salesCount: 118,
    variations: {
      colors: ['White', 'Heather Gray', 'Sage Green', 'Navy Blue'],
      sizes: ['M', 'L', 'XL'],
      stock: {
        'White-M': 15, 'White-L': 18, 'White-XL': 12,
        'Heather Gray-M': 10, 'Heather Gray-L': 14, 'Heather Gray-XL': 8,
        'Sage Green-M': 8, 'Sage Green-L': 9, 'Sage Green-XL': 5,
        'Navy Blue-M': 12, 'Navy Blue-L': 15, 'Navy Blue-XL': 10,
      }
    }
  },
  {
    id: 'prod-3',
    name: 'Linen Summer Wrap Dress',
    category: 'cat-4',
    price: 1450,
    cost: 600,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80',
    description: 'เดรสป้ายสไตล์เกาหลี ทำจากผ้าลินินแท้ 100% สวมใส่ง่าย ระบายความร้อนดีเยี่ยม เหมาะสำหรับหน้าร้อน',
    salesCount: 29,
    variations: {
      colors: ['Olive Green', 'Oatmeal', 'Blush Pink'],
      sizes: ['S', 'M', 'L'],
      stock: {
        'Olive Green-S': 3, 'Olive Green-M': 6, 'Olive Green-L': 2,
        'Oatmeal-S': 5, 'Oatmeal-M': 8, 'Oatmeal-L': 4,
        'Blush Pink-S': 4, 'Blush Pink-M': 5, 'Blush Pink-L': 1,
      }
    }
  },
  {
    id: 'prod-4',
    name: 'Urban Cargo Pants Modern Fit',
    category: 'cat-3',
    price: 1290,
    cost: 520,
    image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=500&auto=format&fit=crop&q=80',
    description: 'กางเกงคาร์โก้ทรงโมเดิร์น ไม่พองจนเกินไป ทนทานสูง เหมาะกับไลฟ์สไตล์ลุยๆ แบบคนเมือง',
    salesCount: 74,
    variations: {
      colors: ['Army Green', 'Sand Khaki', 'Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: {
        'Army Green-S': 6, 'Army Green-M': 9, 'Army Green-L': 5, 'Army Green-XL': 2,
        'Sand Khaki-S': 4, 'Sand Khaki-M': 10, 'Sand Khaki-L': 6, 'Sand Khaki-XL': 3,
        'Black-S': 8, 'Black-M': 12, 'Black-L': 8, 'Black-XL': 4,
      }
    }
  },
  {
    id: 'prod-5',
    name: 'Cropped Heavyweight Denim Jacket',
    category: 'cat-2',
    price: 1950,
    cost: 900,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80',
    description: 'แจ็กเก็ตยีนส์ฟอกทรงครอปพรีเมียม ตัดเย็บเย็บแบบคลาสสิก เพิ่มความมั่นใจให้กับทุกลุค',
    salesCount: 18,
    variations: {
      colors: ['Indigo Wash', 'Light Acid Wash'],
      sizes: ['S', 'M', 'L'],
      stock: {
        'Indigo Wash-S': 3, 'Indigo Wash-M': 5, 'Indigo Wash-L': 2,
        'Light Acid Wash-S': 4, 'Light Acid Wash-M': 4, 'Light Acid Wash-L': 1,
      }
    }
  },
  {
    id: 'prod-6',
    name: 'Aesthetic Tan Leather Crossbody',
    category: 'cat-5',
    price: 2450,
    cost: 1100,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=80',
    description: 'กระเป๋าสะพายข้างหนังแท้สีแทน ขนาดกะทัดรัด แข็งแรงทนทาน ใส่ของได้หลากหลาย',
    salesCount: 55,
    variations: {
      colors: ['Tan Gold', 'Matte Black'],
      sizes: ['One Size'],
      stock: {
        'Tan Gold-One Size': 12,
        'Matte Black-One Size': 15,
      }
    }
  }
];

const INITIAL_CUSTOMERS = [
  { id: 'cust-1', name: 'คุณ อนัญญา รักดี', phone: '0812345678', points: 340, tier: 'Gold', email: 'ananya@mail.com', totalSpent: 12400 },
  { id: 'cust-2', name: 'คุณ ภานุวัฒน์ แสงทวี', phone: '0898765432', points: 120, tier: 'Silver', email: 'panuwat@mail.com', totalSpent: 4500 },
  { id: 'cust-3', name: 'คุณ ณัฐรดา เกียรติสกุล', phone: '0854445555', points: 850, tier: 'Platinum', email: 'nathrada@mail.com', totalSpent: 28900 },
  { id: 'cust-4', name: 'คุณ วรวุฒิ นามสว่าง', phone: '0871112233', points: 45, tier: 'Silver', email: 'worawut@mail.com', totalSpent: 1800 }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    timestamp: '2026-06-02 09:15',
    channel: 'POS (หน้าร้าน)',
    customer: 'คุณ ณัฐรดา เกียรติสกุล',
    items: [
      { name: 'Minimalist Autumn Blazer', color: 'Cream', size: 'M', price: 1890, quantity: 1 }
    ],
    discount: 100,
    total: 1790,
    profit: 940,
    paymentMethod: 'PromptPay'
  },
  {
    id: 'ORD-1002',
    timestamp: '2026-06-02 10:30',
    channel: 'Online Store',
    customer: 'คุณ อนัญญา รักดี',
    items: [
      { name: 'Oversized Premium Cotton Tee', color: 'White', size: 'L', price: 590, quantity: 2 },
      { name: 'Aesthetic Tan Leather Crossbody', color: 'Tan Gold', size: 'One Size', price: 2450, quantity: 1 }
    ],
    discount: 0,
    total: 3630,
    profit: 2090,
    paymentMethod: 'บัตรเครดิต'
  },
  {
    id: 'ORD-1003',
    timestamp: '2026-06-01 15:45',
    channel: 'POS (หน้าร้าน)',
    customer: 'ลูกค้าทั่วไป (Walk-in)',
    items: [
      { name: 'Urban Cargo Pants Modern Fit', color: 'Black', size: 'L', price: 1290, quantity: 1 },
      { name: 'Oversized Premium Cotton Tee', color: 'Navy Blue', size: 'XL', price: 590, quantity: 1 }
    ],
    discount: 50,
    total: 1830,
    profit: 1090,
    paymentMethod: 'เงินสด'
  }
];

export default function App() {
  
  // เลือกแท็บการทำงานหลัก: 'ecommerce' (หน้าร้านลูกค้า) | 'pos' (หน้าคิดเงินพนักงาน) | 'admin' (ห้องควบคุมข้อมูล)
  const [activeMode, setActiveMode] = useState('ecommerce');
  
  // States ของระบบข้อมูลหลัก (Central Hub States)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // E-commerce States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlineCart, setOnlineCart] = useState([]);
  const [isOnlineCartOpen, setIsOnlineCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [onlineSuccessModal, setOnlineSuccessModal] = useState(null);

  // POS States
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posSelectedCategory, setPosSelectedCategory] = useState('all');
  const [posCart, setPosCart] = useState([]);
  const [posDiscount, setPosDiscount] = useState(0); // บาท
  const [posSelectedCustomer, setPosSelectedCustomer] = useState(null);
  const [posPaymentMethod, setPosPaymentMethod] = useState('PromptPay');
  const [showPOSCheckoutModal, setShowPOSCheckoutModal] = useState(false);
  const [posAmountPaid, setPosAmountPaid] = useState('');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '' });

  // Backoffice States
  const [adminTab, setAdminTab] = useState('dashboard'); // dashboard | products | categories | customers | reports
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // ฟังก์ชันช่วยเหลือคำนวณหาสต็อกรายสินค้า
  const getSkuStock = (product, color, size) => {
    if (!product || !product.variations) return 0;
    const skuKey = `${color}-${size}`;
    return product.variations.stock[skuKey] || 0;
  };

  // รวมสต็อกของทุก SKU ในหนึ่งสินค้า
  const getProductTotalStock = (product) => {
    if (!product || !product.variations || !product.variations.stock) return 0;
    return Object.values(product.variations.stock).reduce((sum, qty) => sum + qty, 0);
  };


  // เมื่อเกิดการสั่งซื้อขึ้น (ทั้ง POS หรือ E-commerce) จะตัดสต็อกระบบกลางทันที
  const processInventoryDeduction = (items) => {
    const updatedProducts = products.map(prod => {
      let prodDeducted = false;
      const newStock = { ...prod.variations.stock };

      items.forEach(item => {
        // หาตัวสินค้าที่ตรงกัน
        if (prod.name === item.name) {
          const skuKey = `${item.color}-${item.size}`;
          if (newStock[skuKey] !== undefined) {
            newStock[skuKey] = Math.max(0, newStock[skuKey] - item.quantity);
            prodDeducted = true;
          }
        }
      });

      if (prodDeducted) {
        // อัปเดตยอดขายสะสม (Sales Count)
        const totalQuantitySold = items
          .filter(item => item.name === prod.name)
          .reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...prod,
          salesCount: prod.salesCount + totalQuantitySold,
          variations: {
            ...prod.variations,
            stock: newStock
          }
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
  };

  // การสั่งซื้อผ่านทาง E-commerce
  const handleOnlineCheckout = (e) => {
    e.preventDefault();
    if (onlineCart.length === 0) return;

    // คำนวณราคาและต้นทุนรวม
    const totalAmount = onlineCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCost = onlineCart.reduce((sum, item) => {
      const originalProduct = products.find(p => p.name === item.name);
      return sum + ((originalProduct ? originalProduct.cost : item.price * 0.5) * item.quantity);
    }, 0);

    const newOrder = {
      id: `ORD-OL${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      channel: 'Online Store',
      customer: 'ลูกค้าออนไลน์ทั่วไป',
      items: [...onlineCart],
      discount: 0,
      total: totalAmount,
      profit: totalAmount - totalCost,
      paymentMethod: 'บัตรเครดิต'
    };

    // บันทึกคำสั่งซื้อ
    setOrders([newOrder, ...orders]);
    // ตัดสต็อกกลาง
    processInventoryDeduction(onlineCart);
    // ล้างตะกร้าสินค้าออนไลน์
    setOnlineCart([]);
    setIsOnlineCartOpen(false);
    // แสดง Modal สำเร็จ
    setOnlineSuccessModal(newOrder);
  };

  // การชำระเงินฝั่ง POS
  const handlePOSCheckout = () => {
    if (posCart.length === 0) return;

    const totalAmount = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - posDiscount;
    const finalTotal = Math.max(0, totalAmount);
    const paid = parseFloat(posAmountPaid) || finalTotal;

    const totalCost = posCart.reduce((sum, item) => {
      const originalProduct = products.find(p => p.name === item.name);
      return sum + ((originalProduct ? originalProduct.cost : item.price * 0.5) * item.quantity);
    }, 0);

    // สร้าง Order
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      channel: 'POS (หน้าร้าน)',
      customer: posSelectedCustomer ? posSelectedCustomer.name : 'ลูกค้าทั่วไป (Walk-in)',
      items: [...posCart],
      discount: posDiscount,
      total: finalTotal,
      profit: finalTotal - totalCost,
      paymentMethod: posPaymentMethod
    };

    // บันทึก Order ลงระบบ
    setOrders([newOrder, ...orders]);
    // ตัดสต็อกสินค้าในคลัง
    processInventoryDeduction(posCart);

    // จัดการระบบสมาชิกและการสะสมแต้ม (ทุก 100 บาท ได้ 1 แต้ม)
    if (posSelectedCustomer) {
      const earnedPoints = Math.floor(finalTotal / 100);
      const updatedCustomers = customers.map(cust => {
        if (cust.id === posSelectedCustomer.id) {
          const newPoints = cust.points + earnedPoints;
          const newTotalSpent = cust.totalSpent + finalTotal;
          // เลื่อนระดับ Tier ตามยอดสะสม
          let newTier = 'Silver';
          if (newTotalSpent >= 25000) newTier = 'Platinum';
          else if (newTotalSpent >= 10000) newTier = 'Gold';

          return {
            ...cust,
            points: newPoints,
            totalSpent: newTotalSpent,
            tier: newTier
          };
        }
        return cust;
      });
      setCustomers(updatedCustomers);
    }

    // ล้างค่าหน้ารายการสั่งซื้อของ POS
    setLastReceipt({
      ...newOrder,
      amountPaid: paid,
      change: paid - finalTotal
    });
    setPosCart([]);
    setPosDiscount(0);
    setPosSelectedCustomer(null);
    setPosAmountPaid('');
    setShowPOSCheckoutModal(false);
    setShowReceiptModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ส่วนหัวแสดงการเลือกโหมด (Business Control Bar) */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-600 text-white shadow-md">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">AESTHETE</h1>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">Fashion Engine</p>
              </div>
            </div>

            {/* แถบสลับระบบการทำงานขององค์กร */}
            <div className="flex p-1 bg-slate-100 rounded-xl space-x-1 border border-slate-200">
              <button
                onClick={() => setActiveMode('ecommerce')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeMode === 'ecommerce' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Monitor className="h-4 w-4 text-indigo-500" />
                <span className="hidden sm:inline">Online Store</span>
                <span className="sm:hidden">Online</span>
              </button>

              <button
                onClick={() => setActiveMode('pos')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeMode === 'pos' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <span>POS หน้าร้าน</span>
              </button>

              <button
                onClick={() => setActiveMode('admin')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeMode === 'admin' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Database className="h-4 w-4 text-amber-500" />
                <span className="hidden sm:inline">คลังและข้อมูลกลาง</span>
                <span className="sm:hidden">คลัง</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 1. SECTION: E-COMMERCE VIEW (หน้าร้านออนไลน์ของลูกค้า) */}
      {/* ---------------------------------------------------- */}
      {activeMode === 'ecommerce' && (
        <div className="flex-1 flex flex-col">
          {/* Hero Banner แฟชั่นทันสมัย */}
          <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80')" }}></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-indigo-300 mb-6 border border-white/20">
                <Sparkles className="h-3 w-3" /> คอลเลกชันฤดูใบไม้ร่วงใหม่ล่าสุด
              </span>
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                ESSENTIALS FOR <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-indigo-300">MODERN LIFE</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-xl mb-8">
                การผสมผสานความร่วมสมัยกับการใช้งานได้จริง นิยามใหม่ของตู้เสื้อผ้าแฟชั่นสตรีทสไตล์พรีเมียม
              </p>
              <button 
                onClick={() => {
                  const element = document.getElementById('catalog-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-all transform hover:-translate-y-0.5"
              >
                ช้อปเลยตอนนี้
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Catalog & Shop Content */}
          <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
            <div className="flex flex-col md:flex-row gap-8">
              {/* แผงฟิลเตอร์หมวดหมู่ด้านซ้าย (สำหรับหน้าจอคอม) */}
              <aside className="w-full md:w-64 shrink-0">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Filter className="h-4 w-4 text-indigo-600" />
                    หมวดหมู่สินค้า
                  </h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full flex justify-between items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>ทั้งหมด</span>
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-bold">
                        {products.length}
                      </span>
                    </button>
                    {categories.map(cat => {
                      const catProductsCount = products.filter(p => p.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex justify-between items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full font-bold">
                            {catProductsCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* รายการสินค้าทางด้านขวา */}
              <section className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedCategory === 'all' 
                      ? 'สินค้าทั้งหมด' 
                      : categories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  {/* ปุ่มเปิดตะกร้าสินค้าออนไลน์ลอยตัว */}
                  <button
                    onClick={() => setIsOnlineCartOpen(true)}
                    className="relative flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-slate-800 transition"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    ตะกร้าสินค้า
                    {onlineCart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                        {onlineCart.reduce((sum, i) => sum + i.quantity, 0)}
                      </span>
                    )}
                  </button>
                </div>

                {/* สินค้ากริด */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
                    .map(product => {
                      const totalStock = getProductTotalStock(product);
                      const isOutOfStock = totalStock === 0;

                      return (
                        <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
                          <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                                <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                                  สินค้าหมดชั่วคราว
                                </span>
                              </div>
                            )}
                            {totalStock > 0 && totalStock < 10 && (
                              <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> เหลือไม่มาก! ({totalStock})
                              </span>
                            )}
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-xs text-indigo-600 font-bold tracking-wider mb-1">
                                {categories.find(c => c.id === product.category)?.name}
                              </p>
                              <h4 className="font-bold text-slate-900 text-base mb-1 hover:text-indigo-600 transition truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                                {product.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <span className="text-lg font-black text-slate-900">
                                ฿{product.price.toLocaleString()}
                              </span>
                              <button
                                onClick={() => {
                                  setQuickViewProduct(product);
                                  setSelectedColor(product.variations.colors[0]);
                                  setSelectedSize(product.variations.sizes[0]);
                                }}
                                className="px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-200"
                              >
                                เลือกไซส์/สี
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            </div>
          </main>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. SECTION: POINT OF SALE VIEW (ระบบบันทึกคำสั่งซื้อหน้าร้าน) */}
      {/* ---------------------------------------------------- */}
      {activeMode === 'pos' && (
        <div className="flex-1 flex flex-col lg:flex-row bg-slate-100 max-h-[calc(100vh-64px)] overflow-hidden">
          {/* ฝั่งซ้าย: ตัวกรองและรายการสินค้าหน้าร้าน */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {/* ค้นหาและตัวกรองด่วน */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={posSearchQuery}
                    onChange={(e) => setPosSearchQuery(e.target.value)}
                    placeholder="ค้นหาสินค้าแฟชั่นด้วยชื่อ หรือสแกนคิวอาร์บาร์โค้ด..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  {posSearchQuery && (
                    <button 
                      onClick={() => setPosSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* ปุ่มแสดงหมวดหมู่ด่วน */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
                  <button
                    onClick={() => setPosSelectedCategory('all')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      posSelectedCategory === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setPosSelectedCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        posSelectedCategory === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ตารางแสดงสินค้าสำหรับ POS ทัชสกรีนได้ง่าย */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products
                .filter(p => {
                  const matchCat = posSelectedCategory === 'all' || p.category === posSelectedCategory;
                  const matchSearch = p.name.toLowerCase().includes(posSearchQuery.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map(product => {
                  const totalStock = getProductTotalStock(product);
                  return (
                    <div 
                      key={product.id}
                      className={`bg-white rounded-2xl border p-3 flex flex-col justify-between hover:border-emerald-500 cursor-pointer transition shadow-xs relative ${
                        totalStock === 0 ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      onClick={() => {
                        if (totalStock === 0) return;
                        // สำหรับ POS หากกดทันที จะดึง Variational ตัวเลือกแรกที่มีสต็อกของสินค้านั้นเข้าตะกร้าโดยอัตโนมัติ
                        let defaultColor = product.variations.colors[0];
                        let defaultSize = product.variations.sizes[0];
                        
                        // ค้นหา SKU แรกที่ยังมีสต็อก
                        let found = false;
                        for (let col of product.variations.colors) {
                          for (let sz of product.variations.sizes) {
                            if (getSkuStock(product, col, sz) > 0) {
                              defaultColor = col;
                              defaultSize = sz;
                              found = true;
                              break;
                            }
                          }
                          if (found) break;
                        }

                        // เพิ่มชิ้นสินค้าลงตะกร้า POS
                        const uniqueCartId = `${product.id}-${defaultColor}-${defaultSize}`;
                        const existingItemIndex = posCart.findIndex(i => i.cartId === uniqueCartId);

                        if (existingItemIndex > -1) {
                          const currentQty = posCart[existingItemIndex].quantity;
                          const maxStock = getSkuStock(product, defaultColor, defaultSize);
                          if (currentQty < maxStock) {
                            const newCart = [...posCart];
                            newCart[existingItemIndex].quantity += 1;
                            setPosCart(newCart);
                          }
                        } else {
                          setPosCart([...posCart, {
                            cartId: uniqueCartId,
                            id: product.id,
                            name: product.name,
                            color: defaultColor,
                            size: defaultSize,
                            price: product.price,
                            quantity: 1,
                            maxStock: getSkuStock(product, defaultColor, defaultSize)
                          }]);
                        }
                      }}
                    >
                      {/* รูปภาพขนาดย่อม */}
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                          สต็อกรวม: {totalStock}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <h5 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight mb-1">
                          {product.name}
                        </h5>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                          <span className="text-sm font-black text-slate-900">฿{product.price}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold">
                            {product.variations.colors.length} สี / {product.variations.sizes.length} ไซส์
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {}
          {/* ฝั่งขวา: รายละเอียดใบเสร็จ ตะกร้า และชำระเงิน POS */}
          <div className="w-full lg:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0">
            {/* ส่วนเลือกโปรไฟล์สมาชิก */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ค้นหา/เลือก สมาชิกสะสมแต้ม</label>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-bold hover:text-emerald-700"
                >
                  <Plus className="h-3 w-3" /> เพิ่มสมาชิกใหม่
                </button>
              </div>

              {posSelectedCustomer ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{posSelectedCustomer.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black text-white ${
                        posSelectedCustomer.tier === 'Platinum' ? 'bg-indigo-600' :
                        posSelectedCustomer.tier === 'Gold' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}>
                        {posSelectedCustomer.tier} Member
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{posSelectedCustomer.phone} | คะแนนปัจจุบัน: <strong className="text-emerald-700">{posSelectedCustomer.points}</strong> แต้ม</p>
                  </div>
                  <button 
                    onClick={() => setPosSelectedCustomer(null)}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    onChange={(e) => {
                      const selected = customers.find(c => c.id === e.target.value);
                      setPosSelectedCustomer(selected || null);
                    }}
                    value=""
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    <option value="">เลือกสมาชิกจากหมายเลขโทรศัพท์หรือชื่อ...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - {c.tier} Tier
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* รายการสินค้าในรถเข็น POS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] lg:max-h-none">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                <span>รายการตะกร้าหน้าร้าน</span>
                <span>({posCart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น)</span>
              </h4>

              {posCart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <ShoppingBag className="h-10 w-10 text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm">ตะกร้าว่างเปล่า กดเลือกสินค้าเพื่อเริ่มการขาย</p>
                </div>
              ) : (
                posCart.map(item => (
                  <div key={item.cartId} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h6 className="font-bold text-slate-900 text-sm">{item.name}</h6>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">สี: {item.color}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">ไซส์: {item.size}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPosCart(posCart.filter(i => i.cartId !== item.cartId));
                        }}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50">
                      <span className="font-bold text-slate-800 text-sm">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                      
                      {/* จัดการเพิ่ม/ลดจำนวน */}
                      <div className="flex items-center gap-2.5">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => {
                            const newCart = [...posCart];
                            const idx = newCart.findIndex(i => i.cartId === item.cartId);
                            newCart[idx].quantity -= 1;
                            setPosCart(newCart);
                          }}
                          className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold text-slate-800">{item.quantity}</span>
                        <button
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => {
                            const newCart = [...posCart];
                            const idx = newCart.findIndex(i => i.cartId === item.cartId);
                            newCart[idx].quantity += 1;
                            setPosCart(newCart);
                          }}
                          className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ส่วนคำนวณเงิน */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>ราคารวมยอดสุทธิ</span>
                <span className="font-bold text-slate-900">
                  ฿{posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                </span>
              </div>
              
              {/* ส่วนลดหน้าร้าน */}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-rose-500" /> ส่วนลดหน้าร้าน (บาท)</span>
                <input
                  type="number"
                  min="0"
                  value={posDiscount}
                  onChange={(e) => setPosDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-2 py-1 text-right rounded-md border border-slate-200 text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-base font-bold text-slate-800">ยอดชำระทั้งสิ้น</span>
                <span className="text-2xl font-black text-emerald-600">
                  ฿{Math.max(0, posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - posDiscount).toLocaleString()}
                </span>
              </div>

              {/* ชำระเงินด่วน */}
              <button
                disabled={posCart.length === 0}
                onClick={() => {
                  setPosAmountPaid(Math.max(0, posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - posDiscount).toString());
                  setShowPOSCheckoutModal(true);
                }}
                className="w-full mt-2 py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-center shadow-md hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <CreditCard className="h-4 w-4" /> ดำเนินการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. SECTION: ADMIN DASHBOARD (ศูนย์กลางข้อมูลหลักและการควบคุมธุรกิจ) */}
      {/* ---------------------------------------------------- */}
      {activeMode === 'admin' && (
        <div className="flex-1 flex flex-col md:flex-row bg-slate-100">
          {/* เมนูด้านข้างสำหรับการควบคุมในแบบแอดมิน */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 p-4 space-y-1">
            <div className="px-4 py-3 text-[10px] font-black tracking-widest text-indigo-400 uppercase">ควบคุมระบบข้อมูล</div>
            
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${
                adminTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> ภาพรวมธุรกิจ (BI Center)
            </button>

            <button
              onClick={() => setAdminTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${
                adminTab === 'products' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" /> จัดการสินค้าในคลัง
            </button>

            <button
              onClick={() => setAdminTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${
                adminTab === 'categories' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" /> จัดการหมวดหมู่สินค้า
            </button>

            <button
              onClick={() => setAdminTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${
                adminTab === 'customers' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" /> ระบบสมาชิก Unified CRM
            </button>

            <button
              onClick={() => setAdminTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${
                adminTab === 'reports' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" /> ประวัติการขาย Omnichannel
            </button>
          </aside>

          {}
          {/* ข้อมูลภายในแต่ละแท็บแอดมิน */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-64px)]">
            
            {/* แท็บ 3.1: ภาพรวมความฉลาดทางธุรกิจ (BI Dashboard) */}
            {adminTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">ศูนย์วิเคราะห์ธุรกิจกลาง (Omnichannel Central Hub)</h3>
                  <p className="text-slate-500 text-sm">ข้อมูลสรุปแบบเรียลไทม์ เชื่อมโยงข้อมูลยอดขายออฟไลน์ (POS) และหน้าร้านช้อปปิ้งออนไลน์เข้าด้วยกัน</p>
                </div>

                {/* KPI การเงินหลัก */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-slate-400 text-xs font-bold uppercase">ยอดขายรวมสุทธิ</span>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">
                      ฿{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                    </h4>
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3.5 w-3.5" /> +12.4% จากสัปดาห์ก่อน
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-slate-400 text-xs font-bold uppercase">กำไรสุทธิโดยประมาณ</span>
                    <h4 className="text-2xl font-black text-indigo-600 mt-1">
                      ฿{orders.reduce((sum, o) => sum + o.profit, 0).toLocaleString()}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">มาร์จินกำไรเฉลี่ย: ~51.2%</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-slate-400 text-xs font-bold uppercase">ออเดอร์ทั้งหมด</span>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">
                      {orders.length} รายการ
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      POS: {orders.filter(o => o.channel.includes('POS')).length} | ออนไลน์: {orders.filter(o => o.channel.includes('Online')).length}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-slate-400 text-xs font-bold uppercase">จำนวนสินค้าในคลังรวม</span>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">
                      {products.reduce((sum, p) => sum + getProductTotalStock(p), 0)} SKU ชิ้น
                    </h4>
                    <p className="text-xs text-amber-600 font-bold mt-1">
                      {products.filter(p => getProductTotalStock(p) < 15).length} รายการสต็อกเหลือน้อย
                    </p>
                  </div>
                </div>

                {/* ชาร์ตและการแสดงข้อมูลยอดจำหน่าย */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* กราฟแท่งยอดขายด้วย SVG (รับประกันความปลอดภัยของสคริปต์ภายนอก) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
                    <h5 className="font-bold text-slate-800 text-sm mb-4">แนวโน้มยอดขายแบ่งตามช่องทาง (Revenue Breakdown)</h5>
                    <div className="h-64 flex flex-col justify-between">
                      {/* แท่งกราฟจำลองช่องทางการจำหน่าย */}
                      <div className="flex-1 flex items-end justify-around gap-4 pb-4">
                        <div className="flex flex-col items-center gap-2 w-full max-w-[80px]">
                          <div className="bg-indigo-600 w-full rounded-t-lg transition-all duration-500" style={{ height: '140px' }}></div>
                          <span className="text-xs font-bold text-slate-800">Online</span>
                          <span className="text-[10px] text-indigo-600 font-black">
                            ฿{orders.filter(o => o.channel.includes('Online')).reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-2 w-full max-w-[80px]">
                          <div className="bg-emerald-500 w-full rounded-t-lg transition-all duration-500" style={{ height: '180px' }}></div>
                          <span className="text-xs font-bold text-slate-800">POS Store</span>
                          <span className="text-[10px] text-emerald-600 font-black">
                            ฿{orders.filter(o => o.channel.includes('POS')).reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-slate-150 pt-2 flex justify-between text-xs text-slate-400">
                        <span>ฐานข้อมูลรวบรวม ณ เวลาปัจจุบัน {new Date().toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  </div>

                  {/* สินค้าขายดี 5 อันดับแรก (Top Selling Leaders) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h5 className="font-bold text-slate-800 text-sm mb-4">สินค้าดาวรุ่งยอดนิยม (Leaderboard)</h5>
                    <div className="space-y-4">
                      {products
                        .sort((a, b) => b.salesCount - a.salesCount)
                        .slice(0, 4)
                        .map((p, idx) => (
                          <div key={p.id} className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center ${
                              idx === 0 ? 'bg-amber-100 text-amber-700' :
                              idx === 1 ? 'bg-slate-150 text-slate-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {idx + 1}
                            </span>
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <h6 className="text-xs font-bold text-slate-950 truncate">{p.name}</h6>
                              <p className="text-[10px] text-slate-400">หมวดหมู่: {categories.find(c => c.id === p.category)?.name}</p>
                            </div>
                            <span className="text-xs font-extrabold text-slate-900 shrink-0">
                              {p.salesCount} ชิ้น
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* รายการแจ้งเตือนสต็อกวิกฤต (Low Stock Alarm) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <h5 className="font-bold text-rose-600 text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> รายการสินค้าสต็อกวิกฤตที่ต้องเติม (น้อยกว่า 15 ชิ้นรวม)
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                          <th className="py-2">ภาพ</th>
                          <th className="py-2">ชื่อสินค้าแฟชั่น</th>
                          <th className="py-2">สถานะสียอดนิยม</th>
                          <th className="py-2 text-right">สต็อกคงเหลือรวม</th>
                          <th className="py-2 text-right">ดำเนินการเติมของ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter(p => getProductTotalStock(p) < 15)
                          .map(p => (
                            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-2">
                                <img src={p.image} alt="" className="w-8 h-8 object-cover rounded-md" />
                              </td>
                              <td className="py-2 font-bold text-slate-800">{p.name}</td>
                              <td className="py-2 text-slate-500">
                                {p.variations.colors.join(', ')}
                              </td>
                              <td className="py-2 text-right font-black text-rose-500">
                                {getProductTotalStock(p)} ชิ้น
                              </td>
                              <td className="py-2 text-right">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setAdminTab('products');
                                  }}
                                  className="text-[10px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-1 rounded"
                                >
                                  จัดการสต็อก
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* แท็บ 3.2: จัดการสต็อกสินค้าแฟชั่น (Inventory Management) */}
            {adminTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">บริหารคลังและแก้ไขข้อมูลสินค้าแฟชั่น</h3>
                    <p className="text-slate-500 text-sm">อัปเดตข้อมูล ขนาด สี รายละเอียดและจำนวนสต็อกคงคลังทั้งหมด</p>
                  </div>
                  <button
                    onClick={() => {
                      // สร้างโครงสร้างสินค้าใหม่เริ่มต้น
                      const newProd = {
                        id: `prod-${Date.now()}`,
                        name: 'New Product Fashion',
                        category: categories[0]?.id || 'cat-1',
                        price: 990,
                        cost: 400,
                        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
                        description: 'คำอธิบายสินค้าใหม่',
                        salesCount: 0,
                        variations: {
                          colors: ['Black', 'White'],
                          sizes: ['S', 'M', 'L'],
                          stock: {
                            'Black-S': 5, 'Black-M': 10, 'Black-L': 5,
                            'White-S': 5, 'White-M': 10, 'White-L': 5,
                          }
                        }
                      };
                      setProducts([...products, newProd]);
                      setEditingProduct(newProd);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มรหัสสินค้าใหม่
                  </button>
                </div>

                {/* ส่วนการแก้ไขสินค้าแบบเลือกตัวช่วยอัปเดต */}
                {editingProduct && (
                  <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold text-indigo-300">แก้ไขตัวเลือก SKU : {editingProduct.name}</h4>
                      <button 
                        onClick={() => setEditingProduct(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-400">ชื่อสินค้าหลัก</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => {
                            const updated = { ...editingProduct, name: e.target.value };
                            setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
                            setEditingProduct(updated);
                          }}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">ราคาขาย (บาท)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => {
                            const updated = { ...editingProduct, price: parseInt(e.target.value) || 0 };
                            setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
                            setEditingProduct(updated);
                          }}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">ต้นทุนสินค้า (บาท)</label>
                        <input
                          type="number"
                          value={editingProduct.cost}
                          onChange={(e) => {
                            const updated = { ...editingProduct, cost: parseInt(e.target.value) || 0 };
                            setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
                            setEditingProduct(updated);
                          }}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                        />
                      </div>
                    </div>

                    {/* การจัดการสต็อกแบบแบ่งตาม variation SKU */}
                    <div className="pt-4 border-t border-slate-700">
                      <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">จํานวนสต็อกแยกตามไซส์และสีคงคลัง (Variational Stock Matrix)</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {editingProduct.variations.colors.flatMap(color => 
                          editingProduct.variations.sizes.map(size => {
                            const skuKey = `${color}-${size}`;
                            const stockValue = editingProduct.variations.stock[skuKey] || 0;
                            return (
                              <div key={skuKey} className="bg-slate-700 p-2.5 rounded-lg border border-slate-600 flex flex-col justify-between">
                                <span className="text-xs font-extrabold text-slate-300">{color} / {size}</span>
                                <div className="flex items-center justify-between mt-2">
                                  <button
                                    onClick={() => {
                                      const updatedStock = { ...editingProduct.variations.stock, [skuKey]: Math.max(0, stockValue - 1) };
                                      const updatedProduct = {
                                        ...editingProduct,
                                        variations: { ...editingProduct.variations, stock: updatedStock }
                                      };
                                      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
                                      setEditingProduct(updatedProduct);
                                    }}
                                    className="p-1 bg-slate-600 hover:bg-slate-500 rounded text-slate-300"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="text-sm font-bold text-white">{stockValue}</span>
                                  <button
                                    onClick={() => {
                                      const updatedStock = { ...editingProduct.variations.stock, [skuKey]: stockValue + 1 };
                                      const updatedProduct = {
                                        ...editingProduct,
                                        variations: { ...editingProduct.variations, stock: updatedStock }
                                      };
                                      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
                                      setEditingProduct(updatedProduct);
                                    }}
                                    className="p-1 bg-slate-600 hover:bg-slate-500 rounded text-slate-300"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ตารางสต็อกหลัก */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs uppercase">
                      <tr>
                        <th className="p-4">รูปภาพ</th>
                        <th className="p-4">ชื่อและรหัสสินค้า</th>
                        <th className="p-4">ราคา/ต้นทุน</th>
                        <th className="p-4">สต็อกรวมในระบบ</th>
                        <th className="p-4 text-center">ตัวเลือกที่รองรับ</th>
                        <th className="p-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl" />
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-indigo-600 font-bold">{p.id.toUpperCase()}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900">฿{p.price}</span>
                            <div className="text-xs text-slate-400">ต้นทุน: ฿{p.cost}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
                              getProductTotalStock(p) < 15 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {getProductTotalStock(p)} ชิ้น
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-xs text-slate-500">
                              {p.variations.colors.length} สี | {p.variations.sizes.length} ไซส์
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition"
                              >
                                แก้ไขรายละเอียด
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`คุณมั่นใจที่จะลบ ${p.name} หรือไม่?`)) {
                                    setProducts(products.filter(item => item.id !== p.id));
                                  }
                                }}
                                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* แท็บ 3.3: จัดการหมวดหมู่สินค้าแฟชั่น (Dynamic Categories) */}
            {adminTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">จัดการหมวดหมู่สินค้าแฟชั่น (Categories System)</h3>
                    <p className="text-slate-500 text-sm">ออกแบบระบบหมวดหมู่ที่ยืดหยุ่น สำหรับรองรับสินค้าคอลเลกชันใหม่ในอนาคต</p>
                  </div>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
                  >
                    <Plus className="h-4 w-4" /> เพิ่มหมวดหมู่ใหม่
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map(cat => {
                    const linkedProducts = products.filter(p => p.category === cat.id);
                    return (
                      <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="inline-flex p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
                            <Layers className="h-5 w-5" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mb-1">{cat.name}</h4>
                          <p className="text-xs text-slate-400 font-mono">slug: /{cat.slug}</p>
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500 font-semibold">
                            มีสินค้าในหมวดหมู่ {linkedProducts.length} ชิ้น
                          </span>
                          <button
                            disabled={linkedProducts.length > 0}
                            onClick={() => {
                              setCategories(categories.filter(c => c.id !== cat.id));
                            }}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={linkedProducts.length > 0 ? "ไม่สามารถลบได้เนื่องจากยังมีสินค้าเชื่อมโยงอยู่" : ""}
                          >
                            ลบหมวดหมู่
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* แท็บ 3.4: ระบบสมาชิก Unified CRM */}
            {adminTab === 'customers' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">ฐานข้อมูลลูกค้าและระบบความภักดีแบรนด์ (Unified CRM)</h3>
                  <p className="text-slate-500 text-sm">ข้อมูลการสั่งซื้อ พฤติกรรมและระดับสมาชิกสำหรับการทำแคมเปญการตลาดในอนาคต</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                      <tr>
                        <th className="p-4">ชื่อลูกค้า</th>
                        <th className="p-4">เบอร์โทรศัพท์/อีเมล</th>
                        <th className="p-4">ระดับสมาชิก (Tier)</th>
                        <th className="p-4 text-right">แต้มสะสมปัจจุบัน</th>
                        <th className="p-4 text-right">ยอดใช้จ่ายสะสม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map(cust => (
                        <tr key={cust.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{cust.name}</div>
                            <div className="text-[10px] text-slate-400">ID: {cust.id}</div>
                          </td>
                          <td className="p-4 text-xs">
                            <div className="text-slate-700 font-mono">{cust.phone}</div>
                            <div className="text-slate-400">{cust.email}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold text-white ${
                              cust.tier === 'Platinum' ? 'bg-indigo-600' :
                              cust.tier === 'Gold' ? 'bg-amber-500' : 'bg-slate-400'
                            }`}>
                              {cust.tier} Member
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-emerald-600">
                            {cust.points.toLocaleString()} PTS
                          </td>
                          <td className="p-4 text-right font-black text-slate-900">
                            ฿{cust.totalSpent.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* แท็บ 3.5: ประวัติการสั่งซื้อ และ Omnichannel Reports */}
            {adminTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">บันทึกประวัติธุรกรรมทั้งหมด (Unified Order Logs)</h3>
                  <p className="text-slate-500 text-sm">การติดตามตรวจสอบประวัติการซื้อจากทั้งหน้าร้านออนไลน์และฝั่งหน้าเคาน์เตอร์ POS</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs uppercase">
                      <tr>
                        <th className="p-4">เลขที่ใบเสร็จ</th>
                        <th className="p-4">วันเวลาทำรายการ</th>
                        <th className="p-4">ช่องทาง</th>
                        <th className="p-4">ชื่อผู้ซื้อ</th>
                        <th className="p-4 text-center">จำนวนชิ้น</th>
                        <th className="p-4 text-right">ส่วนลด</th>
                        <th className="p-4 text-right">ยอดรับสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition text-slate-800">
                          <td className="p-4">
                            <span className="font-extrabold text-indigo-600">{order.id}</span>
                          </td>
                          <td className="p-4 text-xs font-mono text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {order.timestamp}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                              order.channel.includes('Online') ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {order.channel}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-800">{order.customer}</td>
                          <td className="p-4 text-center font-bold">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </td>
                          <td className="p-4 text-right text-rose-500 font-bold">
                            {order.discount > 0 ? `-฿${order.discount}` : '-'}
                          </td>
                          <td className="p-4 text-right font-black text-slate-900">
                            ฿{order.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. MODALS & DETAILED OVERLAYS (ส่วนแผงหน้าต่างป๊อปอัปควบคุมสถานะ) */}
      {/* ---------------------------------------------------- */}

      {/* Quick View Product Modal (ลูกค้าหน้าเว็บออนไลน์เลือก Variation ไซส์/สี) */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 z-10 transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-[4/3] bg-slate-100 relative">
              <img src={quickViewProduct.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  {categories.find(c => c.id === quickViewProduct.category)?.name}
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{quickViewProduct.name}</h4>
                <p className="text-lg font-black text-slate-800 mt-1">฿{quickViewProduct.price.toLocaleString()}</p>
              </div>

              {/* เลือกสี */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">เลือกโทนสี</label>
                <div className="flex gap-2">
                  {quickViewProduct.variations.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        selectedColor === col 
                          ? 'bg-slate-900 text-white border-slate-950' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* เลือกไซส์ */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">เลือกขนาดไซส์เสื้อผ้า</label>
                <div className="flex gap-2">
                  {quickViewProduct.variations.sizes.map(sz => {
                    const skuStock = getSkuStock(quickViewProduct, selectedColor, sz);
                    const isSkuOutOfStock = skuStock === 0;

                    return (
                      <button
                        key={sz}
                        disabled={isSkuOutOfStock}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex flex-col items-center ${
                          selectedSize === sz
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span>{sz}</span>
                        <span className="text-[8px] font-medium opacity-80">({skuStock})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ปุ่มลงตะกร้าออนไลน์ */}
              <button
                disabled={getSkuStock(quickViewProduct, selectedColor, selectedSize) === 0}
                onClick={() => {
                  const uniqueId = `${quickViewProduct.id}-${selectedColor}-${selectedSize}`;
                  const existingItemIndex = onlineCart.findIndex(i => i.cartId === uniqueId);

                  if (existingItemIndex > -1) {
                    const newCart = [...onlineCart];
                    newCart[existingItemIndex].quantity += 1;
                    setOnlineCart(newCart);
                  } else {
                    setOnlineCart([...onlineCart, {
                      cartId: uniqueId,
                      name: quickViewProduct.name,
                      color: selectedColor,
                      size: selectedSize,
                      price: quickViewProduct.price,
                      quantity: 1
                    }]);
                  }
                  setQuickViewProduct(null);
                  setIsOnlineCartOpen(true);
                }}
                className="w-full py-3 bg-slate-900 text-white hover:bg-indigo-600 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" /> เพิ่มสินค้าลงรถเข็น
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {/* ตะกร้าช้อปปิ้งของทางลูกค้าออนไลน์ (Slide-out Online Cart Drawer) */}
      {isOnlineCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-indigo-400" />
                ถุงใส่ของช้อปปิ้งของคุณ
              </h4>
              <button 
                onClick={() => setIsOnlineCartOpen(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* รายละเอียดสิ่งของภายในถุง */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {onlineCart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <ShoppingBag className="h-16 w-16 mb-4 stroke-1 text-slate-300" />
                  <p className="font-semibold text-slate-900">ถุงช้อปปิ้งของคุณว่างเปล่า</p>
                  <p className="text-xs text-slate-400 mt-1">เพลิดเพลินกับการเลือกซื้อเสื้อผ้าแฟชั่นที่ต้องการ</p>
                </div>
              ) : (
                onlineCart.map(item => (
                  <div key={item.cartId} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h5>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">สี: {item.color}</span>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">ไซส์: {item.size}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-black text-slate-900">
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </span>
                        
                        {/* ปรับจำนวน */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newCart = [...onlineCart];
                              const idx = newCart.findIndex(i => i.cartId === item.cartId);
                              if (newCart[idx].quantity > 1) {
                                newCart[idx].quantity -= 1;
                              } else {
                                newCart.splice(idx, 1);
                              }
                              setOnlineCart(newCart);
                            }}
                            className="w-6 h-6 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const newCart = [...onlineCart];
                              const idx = newCart.findIndex(i => i.cartId === item.cartId);
                              newCart[idx].quantity += 1;
                              setOnlineCart(newCart);
                            }}
                            className="w-6 h-6 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-xs hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* สรุปราคากด Checkout จำลอง */}
            {onlineCart.length > 0 && (
              <div className="p-6 border-t border-slate-150 bg-slate-50 space-y-4">
                <div className="flex justify-between text-base font-extrabold text-slate-900">
                  <span>ราคารวมยอดชำระทั้งสิ้น</span>
                  <span>฿{onlineCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                <button
                  onClick={handleOnlineCheckout}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-center shadow-lg transition"
                >
                  ชำระเงินจำลองทันที (ตัดสต็อกคลังกลาง)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Online Order Success Celebration Modal */}
      {onlineSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-100">
            <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle className="h-10 w-10 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">ขอบคุณสำหรับคําสั่งซื้อออนไลน์!</h4>
              <p className="text-xs text-slate-400 mt-1">รหัสอ้างอิง: {onlineSuccessModal.id}</p>
            </div>
            <p className="text-sm text-slate-600">
              การตัดยอดสต็อกในศูนย์กลางเสร็จสิ้นแล้ว สต็อกระบบหน้าร้านและออนไลน์จะสะท้อนการเปลี่ยนแปลงนี้ทันที
            </p>
            <button
              onClick={() => setOnlineSuccessModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm"
            >
              รับทราบ / ช้อปต่อ
            </button>
          </div>
        </div>
      )}

      {/* POS Checkout Processing Modal (ส่วนงานชำระเงินพนักงานหน้าร้าน) */}
      {showPOSCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-slate-150 p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                ยืนยันการคิดเงินยอดออเดอร์
              </h4>
              <button onClick={() => setShowPOSCheckoutModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* สรุปมูลค่าการขายใน POS */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between text-xs text-slate-500">
                <span>ราคาสินค้ารวม</span>
                <span>฿{posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-500">
                <span>ส่วนลดสุทธิ</span>
                <span>-฿{posDiscount}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200/50">
                <span>ราคาสุทธิที่ต้องเก็บ</span>
                <span>
                  ฿{Math.max(0, posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - posDiscount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* การเลือกช่องทางการจ่ายเงิน */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ช่องทางชำระเงิน</label>
              <div className="grid grid-cols-3 gap-2">
                {['PromptPay', 'บัตรเครดิต', 'เงินสด'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPosPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      posPaymentMethod === method
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* ส่วนสำหรับเงินทอนกรณีเป็นเงินสด */}
            {posPaymentMethod === 'เงินสด' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ยอดรับชำระจากลูกค้า (บาท)</label>
                <input
                  type="number"
                  placeholder="ตัวอย่าง 1000, 2000"
                  value={posAmountPaid}
                  onChange={(e) => setPosAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-right text-slate-900"
                />
                {parseFloat(posAmountPaid) > 0 && (
                  <div className="flex justify-between text-xs font-bold text-indigo-600 pt-1">
                    <span>จำนวนเงินทอน:</span>
                    <span>
                      ฿{(parseFloat(posAmountPaid) - Math.max(0, posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - posDiscount)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* สมาชิกสะสมแต้ม */}
            {posSelectedCustomer && (
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">{posSelectedCustomer.name}</span>
                </div>
                <span className="font-semibold text-emerald-700">ได้รับแต้มสะสม: +{Math.floor(Math.max(0, posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - posDiscount) / 100)} แต้ม</span>
              </div>
            )}

            <button
              onClick={handlePOSCheckout}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow"
            >
              ยืนยันการทำรายการและเปิดใบเสร็จ
            </button>
          </div>
        </div>
      )}

      {/* POS Receipt / Invoice Modal (ใบรับสินค้าเพื่อจัดพิมพ์ให้ลูกค้า) */}
      {showReceiptModal && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-150 font-mono text-xs">
            
            {/* Header ใบเสร็จแบบคลาสสิก */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h5 className="text-base font-black tracking-widest text-slate-900">AESTHETE</h5>
              <p className="text-[9px] text-slate-400">ห้างสรรพสินค้าแฟชั่นชั้นนำ</p>
              <p className="text-[9px] text-slate-400 mt-1">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
            </div>

            {/* Metadata ใบเสร็จ */}
            <div className="space-y-1 text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>เลขที่ใบอ้างอิง:</span>
                <span className="font-bold text-slate-800">{lastReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span>วันเวลาทำรายการ:</span>
                <span>{lastReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>ลูกค้าผู้ซื้อ:</span>
                <span>{lastReceipt.customer}</span>
              </div>
              <div className="flex justify-between">
                <span>ช่องทางชำระ:</span>
                <span>{lastReceipt.paymentMethod}</span>
              </div>
            </div>

            {/* รายการเสื้อผ้าที่ซื้อ */}
            <div className="pt-3 border-t border-dashed border-slate-300 space-y-2">
              {lastReceipt.items.map(item => (
                <div key={item.cartId} className="flex justify-between text-slate-800">
                  <div className="max-w-[70%]">
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-[9px] text-slate-400">({item.color} / {item.size}) x {item.quantity}</p>
                  </div>
                  <span className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* สรุปตัวเลขท้ายใบเสร็จ */}
            <div className="pt-3 border-t border-dashed border-slate-300 space-y-1 text-slate-700">
              {lastReceipt.discount > 0 && (
                <div className="flex justify-between text-rose-500 font-bold">
                  <span>ส่วนลดพิเศษ:</span>
                  <span>-฿{lastReceipt.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-black text-sm">
                <span>รวมสุทธิสุทธิ:</span>
                <span>฿{lastReceipt.total.toLocaleString()}</span>
              </div>
              {lastReceipt.paymentMethod === 'เงินสด' && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>ยอดรับชำระ:</span>
                    <span>฿{lastReceipt.amountPaid}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 text-sm">
                    <span>เงินทอน:</span>
                    <span>฿{lastReceipt.change.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {/* คำขอบคุณท้ายใบเสร็จ */}
            <div className="pt-4 border-t border-dashed border-slate-300 text-center text-slate-400 text-[10px]">
              <p>ขอบคุณที่วางใจเลือกช้อปสินค้า AESTHETE</p>
              <p className="mt-1">ข้อมูลยอดขายและแต้มสมาชิกของคุณได้รับการเชื่อมต่อเข้าสู่ระบบส่วนกลางแล้ว</p>
            </div>

            {/* ปุ่มปิดและสั่งพิมพ์จำลอง */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1"
              >
                <Printer className="h-3.5 w-3.5" /> สั่งพิมพ์ (Print)
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 bg-slate-950 text-white font-bold rounded-lg"
              >
                เสร็จสิ้น / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-150 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h5 className="font-extrabold text-slate-950 text-base">ลงทะเบียนสมาชิกในระบบ CRM หน้าร้าน</h5>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newCustomerForm.name || !newCustomerForm.phone) return;

              const created = {
                id: `cust-${Date.now()}`,
                name: `คุณ ${newCustomerForm.name}`,
                phone: newCustomerForm.phone,
                email: newCustomerForm.email || 'no-email@mail.com',
                points: 0,
                tier: 'Silver',
                totalSpent: 0
              };

              setCustomers([...customers, created]);
              setPosSelectedCustomer(created);
              setNewCustomerForm({ name: '', phone: '', email: '' });
              setShowAddCustomerModal(false);
            }} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block font-bold mb-1">ชื่อ-นามสกุลสมาชิก</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมชาย สุขสบาย"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block font-bold mb-1">เบอร์โทรศัพท์มือถือ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 0812345678"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block font-bold mb-1">อีเมลผู้สมัคร (ถ้ามี)</label>
                <input
                  type="email"
                  placeholder="เช่น customer@mail.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
              >
                บันทึกสิทธิ์และผูกออเดอร์ทันที
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-150 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h5 className="font-extrabold text-slate-950 text-base">ขยายธุรกิจ: เพิ่มหมวดหมู่เสื้อผ้าใหม่</h5>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block font-bold mb-1">ชื่อหมวดหมู่ภาษาไทย</label>
                <input
                  type="text"
                  placeholder="เช่น รองเท้าผ้าใบ, ชุดกีฬา"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <button
                onClick={() => {
                  if (!newCategoryName) return;
                  const newCat = {
                    id: `cat-${Date.now()}`,
                    name: newCategoryName,
                    slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    count: 0
                  };
                  setCategories([...categories, newCat]);
                  setNewCategoryName('');
                  setShowAddCategoryModal(false);
                }}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
              >
                สร้างและอัปเดตระบบสารสนเทศส่วนกลาง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ส่วนท้ายแสดงสถานะเครือข่ายฐานข้อมูลจำลองร่วมขององค์กร */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-slate-700 font-black">ระบบเซิร์ฟเวอร์เสถียร 100% (Unified Synced)</span>
          </div>
          <div>
            © 2026 AESTHETE Omnichannel Architecture Platform • All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}