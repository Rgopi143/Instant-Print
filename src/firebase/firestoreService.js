import { db, isFirebaseAvailable } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

const ORDERS_COL = 'print_orders';
const LOGS_COL = 'user_login_logs';
const USERS_COL = 'users';

const DEFAULT_LOGS = [
  { id: 'LOG-101', phone: '+91 8247806042', type: 'Admin 6-Digit PIN', status: 'Active Session', role: 'System Admin', time: '11:42 AM' },
  { id: 'LOG-102', phone: '+91 8247392437', type: 'Admin 6-Digit PIN', status: 'Active Session', role: 'System Admin', time: '11:42 AM' },
  { id: 'LOG-103', phone: 'Guest User', type: 'Direct Guest Session', status: 'Active Session', role: 'Guest Customer', time: '11:39 AM' },
  { id: 'LOG-104', phone: '+91 8247392436', type: 'SMS OTP Verified', status: 'Active Session', role: 'Verified Customer', time: '11:34 AM' },
];

const DEFAULT_ORDERS = [
  { id: 'ORD-9104', orderId: 'ORD-9104', name: 'Resume_Updated_2026.pdf', pages: 3, mode: 'B&W Double-Sided', cost: '₹6.00', category: 'PDF', phone: '+91 8247806042', date: '05 Aug 2026, 11:40 AM' },
  { id: 'ORD-9103', orderId: 'ORD-9103', name: 'Passport_Size_Photo.png', pages: 1, mode: 'Color Single-Sided', cost: '₹10.00', category: 'Photo', phone: '+91 8247392436', date: '05 Aug 2026, 11:35 AM' },
];

const getLocalLogs = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('instant_print_logs') || '[]');
    return stored.length > 0 ? stored : DEFAULT_LOGS;
  } catch {
    return DEFAULT_LOGS;
  }
};

const getLocalOrders = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('instant_print_orders') || '[]');
    return stored.length > 0 ? stored : DEFAULT_ORDERS;
  } catch {
    return DEFAULT_ORDERS;
  }
};

/**
 * Fetch User Profile by Phone Number (exact or 6-digit match)
 */
export const getUserProfile = async (inputNumber) => {
  if (!inputNumber) return null;
  const cleanInput = inputNumber.replace(/\D/g, '');
  if (!cleanInput) return null;

  // 1. Pre-configured default master & admin test user profiles
  if (cleanInput === '806042' || cleanInput === '8247806042') {
    return {
      phone: '8247806042',
      name: 'Master Admin',
      whatsappNumber: '8247806042',
      gender: 'Male',
      pin: '824780',
      role: 'System Admin',
      isAdmin: true
    };
  }

  if (cleanInput === '392437' || cleanInput === '8247392437') {
    return {
      phone: '8247392437',
      name: 'System Administrator',
      whatsappNumber: '8247392437',
      gender: 'Male',
      pin: '824782',
      role: 'System Admin',
      isAdmin: true
    };
  }

  if (cleanInput === '392436' || cleanInput === '8247392436') {
    return {
      phone: '8247392436',
      name: 'Rahul Sharma',
      whatsappNumber: '8247392436',
      gender: 'Male',
      pin: '123456',
      role: 'Verified Customer',
      isAdmin: false
    };
  }

  // 2. Check localStorage users
  try {
    const localUsers = JSON.parse(localStorage.getItem('instant_print_users') || '{}');
    const localList = Object.values(localUsers);

    const matchedLocal = localList.find(u => {
      const p = (u.phone || '').replace(/\D/g, '');
      return p === cleanInput || (cleanInput.length >= 6 && p.endsWith(cleanInput));
    });

    if (matchedLocal) return matchedLocal;
  } catch (e) {
    console.warn("LocalStorage user lookup error:", e);
  }

  // 3. Query Firestore collection strictly by phone number
  if (!db) return null;
  try {
    const snap = await getDocs(collection(db, USERS_COL));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const matchedDoc = docs.find(u => {
      const p = (u.phone || '').replace(/\D/g, '');
      return p === cleanInput || (cleanInput.length >= 6 && p.endsWith(cleanInput));
    });

    return matchedDoc || null;
  } catch (error) {
    console.warn("getUserProfile Firestore fallback warning:", error.message);
    return null;
  }
};

/**
 * Create New User Profile (Registration)
 */
export const createUserProfile = async (userData) => {
  const cleanPhone = userData.phone.replace(/\D/g, '');
  const newUser = {
    phone: cleanPhone,
    pin: userData.pin,
    name: userData.name || 'User',
    whatsappNumber: userData.whatsappNumber || cleanPhone,
    gender: userData.gender || 'Male',
    role: 'Verified Customer',
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  // Save to LocalStorage
  try {
    const localUsers = JSON.parse(localStorage.getItem('instant_print_users') || '{}');
    localUsers[cleanPhone] = newUser;
    localStorage.setItem('instant_print_users', JSON.stringify(localUsers));
  } catch (e) {
    console.warn("LocalStorage save user error:", e);
  }

  if (db) {
    try {
      await setDoc(doc(db, USERS_COL, cleanPhone), {
        ...newUser,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn("createUserProfile Firestore warning:", error.message);
    }
  }

  return newUser;
};

/**
 * Record a user login session in LocalStorage and Firebase Firestore
 */
export const recordLoginLog = async (logData) => {
  const newLog = {
    id: `LOG-${Date.now()}`,
    phone: logData.phone || 'Guest User',
    type: logData.type || 'PIN Login Verified',
    status: logData.status || 'Active Session',
    role: logData.role || 'Verified Customer',
    device: logData.device || 'Terminal Kiosk #402',
    time: logData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };

  try {
    const localLogs = JSON.parse(localStorage.getItem('instant_print_logs') || '[]');
    localLogs.unshift(newLog);
    localStorage.setItem('instant_print_logs', JSON.stringify(localLogs.slice(0, 50)));
  } catch (e) {
    console.warn("LocalStorage save log error:", e);
  }

  if (!db) return newLog.id;
  try {
    const docRef = await addDoc(collection(db, LOGS_COL), {
      ...newLog,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firebase recordLoginLog warning:", error.message);
    return newLog.id;
  }
};

/**
 * Record a completed print job order in LocalStorage and Firebase Firestore
 */
export const createPrintOrder = async (orderData) => {
  const newOrder = {
    id: orderData.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId: orderData.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    name: orderData.name || 'Document.pdf',
    pages: Number(orderData.pages) || 1,
    mode: orderData.mode || 'B&W Single-Sided',
    cost: orderData.cost || '₹6.00',
    status: 'Completed',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: orderData.category || 'PDF',
    phone: orderData.phone || '+91 Customer',
    kiosk: 'Terminal Kiosk #402',
    createdAt: new Date().toISOString()
  };

  try {
    const localOrders = JSON.parse(localStorage.getItem('instant_print_orders') || '[]');
    localOrders.unshift(newOrder);
    localStorage.setItem('instant_print_orders', JSON.stringify(localOrders.slice(0, 50)));
  } catch (e) {
    console.warn("LocalStorage save order error:", e);
  }

  if (!db) return newOrder.id;
  try {
    const docRef = await addDoc(collection(db, ORDERS_COL), {
      ...newOrder,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.warn("Firebase createPrintOrder warning:", error.message);
    return newOrder.id;
  }
};

/**
 * Real-time listener for Customer's Print Orders from Firebase (with local fallback)
 */
export const subscribeUserOrders = (userPhone, callback) => {
  const fallbackOrders = getLocalOrders();
  const getFiltered = (arr) => {
    if (!userPhone) return arr;
    return arr.filter(o => o.phone === userPhone || o.phone === '+91 Customer');
  };

  if (!db || !isFirebaseAvailable) {
    callback(getFiltered(fallbackOrders));
    return () => {};
  }

  try {
    const colRef = collection(db, ORDERS_COL);
    return onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        callback(getFiltered(fallbackOrders));
        return;
      }
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      callback(getFiltered(orders));
    }, (err) => {
      console.warn("Firebase User Orders Snapshot error, using local fallback:", err.message);
      callback(getFiltered(fallbackOrders));
    });
  } catch (err) {
    console.warn("Firebase query error, using local fallback:", err.message);
    callback(getFiltered(fallbackOrders));
    return () => {};
  }
};

/**
 * Real-time listener for Admin Portal (Print Jobs & Login Logs) from Firebase (with local fallback)
 */
export const subscribeAdminData = (callback) => {
  const fallbackLogs = getLocalLogs();
  const fallbackOrders = getLocalOrders();

  if (!db || !isFirebaseAvailable) {
    callback({ orders: fallbackOrders, logs: fallbackLogs });
    return () => {};
  }

  let currentOrders = fallbackOrders;
  let currentLogs = fallbackLogs;

  const unsubOrders = onSnapshot(collection(db, ORDERS_COL), (snapshot) => {
    if (!snapshot.empty) {
      currentOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      currentOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
    callback({ orders: currentOrders, logs: currentLogs });
  }, (err) => {
    console.warn("Firebase Admin Orders listener error, using fallback:", err.message);
    callback({ orders: currentOrders, logs: currentLogs });
  });

  const unsubLogs = onSnapshot(collection(db, LOGS_COL), (snapshot) => {
    if (!snapshot.empty) {
      currentLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      currentLogs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
    callback({ orders: currentOrders, logs: currentLogs });
  }, (err) => {
    console.warn("Firebase Admin Logs listener error, using fallback:", err.message);
    callback({ orders: currentOrders, logs: currentLogs });
  });

  return () => {
    unsubOrders();
    unsubLogs();
  };
};

/**
 * Seed initial testing sample records to Firebase (if empty)
 */
export const seedTestFirebaseData = async () => {
  if (!db) return;
  try {
    await recordLoginLog({
      phone: '+91 8247806042',
      type: 'Admin 6-Digit PIN',
      status: 'Active Session',
      role: 'System Admin'
    });
    await createPrintOrder({
      id: 'ORD-9104',
      name: 'Resume_Updated_2026.pdf',
      pages: 3,
      mode: 'B&W Double-Sided',
      cost: '₹6.00',
      category: 'PDF',
      phone: '+91 8247806042'
    });
  } catch (err) {
    console.error("Error seeding Firebase data:", err);
  }
};

/**
 * Wipe all data from Firebase Firestore collections
 */
export const clearFirebaseCollections = async () => {
  try {
    localStorage.removeItem('instant_print_logs');
    localStorage.removeItem('instant_print_orders');
  } catch (e) {
    console.warn("LocalStorage clear error:", e);
  }

  if (!db) return;
  try {
    const ordersSnap = await getDocs(collection(db, ORDERS_COL));
    const logsSnap = await getDocs(collection(db, LOGS_COL));
    
    const deletePromises = [
      ...ordersSnap.docs.map(d => deleteDoc(doc(db, ORDERS_COL, d.id))),
      ...logsSnap.docs.map(d => deleteDoc(doc(db, LOGS_COL, d.id)))
    ];
    await Promise.all(deletePromises);
  } catch (err) {
    console.error("Error clearing Firebase collections:", err);
  }
};
