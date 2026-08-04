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

/**
 * Fetch User Profile by Phone Number (exact or 6-digit match)
 */
export const getUserProfile = async (inputNumber) => {
  if (!inputNumber) return null;
  const cleanInput = inputNumber.replace(/\D/g, '');
  if (!cleanInput) return null;

  // 1. Check localStorage users first (Strictly Phone Number)
  const localUsers = JSON.parse(localStorage.getItem('instant_print_users') || '{}');
  const localList = Object.values(localUsers);

  // Match strictly against phone number
  const matchedLocal = localList.find(u => {
    const p = (u.phone || '').replace(/\D/g, '');
    return p === cleanInput || (cleanInput.length >= 6 && p.endsWith(cleanInput));
  });

  if (matchedLocal) return matchedLocal;

  // Pre-configured default test user profiles
  if (cleanInput === '806042' || cleanInput === '8247806042') {
    return {
      phone: '8247806042',
      name: 'Master Admin',
      whatsappNumber: '8247806042',
      gender: 'Male',
      pin: '824780',
      role: 'System Admin'
    };
  }

  if (cleanInput === '392436' || cleanInput === '8247392436') {
    return {
      phone: '8247392436',
      name: 'Rahul Sharma',
      whatsappNumber: '8247392436',
      gender: 'Male',
      pin: '123456',
      role: 'Verified Customer'
    };
  }

  if (!db) return null;
  try {
    // Query Firestore collection strictly by phone number
    const snap = await getDocs(collection(db, USERS_COL));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const matchedDoc = docs.find(u => {
      const p = (u.phone || '').replace(/\D/g, '');
      return p === cleanInput || (cleanInput.length >= 6 && p.endsWith(cleanInput));
    });

    return matchedDoc || null;
  } catch (error) {
    console.warn("getUserProfile Firestore warning:", error.message);
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
    createdAt: new Date().toISOString()
  };

  // Save to LocalStorage
  const localUsers = JSON.parse(localStorage.getItem('instant_print_users') || '{}');
  localUsers[cleanPhone] = newUser;
  localStorage.setItem('instant_print_users', JSON.stringify(localUsers));

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
 * Record a user login session in Firebase Firestore
 */
export const recordLoginLog = async (logData) => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, LOGS_COL), {
      phone: logData.phone || 'Guest User',
      type: logData.type || 'PIN Login Verified',
      status: logData.status || 'Active Session',
      role: logData.role || 'Verified Customer',
      device: logData.device || 'Terminal Kiosk #402',
      time: logData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Firebase recordLoginLog error:", error);
    return null;
  }
};

/**
 * Record a completed print job order in Firebase Firestore
 */
export const createPrintOrder = async (orderData) => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, ORDERS_COL), {
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
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Firebase createPrintOrder error:", error);
    return null;
  }
};

/**
 * Real-time listener for Customer's Print Orders from Firebase
 */
export const subscribeUserOrders = (userPhone, callback) => {
  if (!db || !isFirebaseAvailable) {
    callback([]);
    return () => {};
  }

  try {
    const colRef = collection(db, ORDERS_COL);
    return onSnapshot(colRef, (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      const filtered = userPhone
        ? orders.filter(o => o.phone === userPhone || o.phone === '+91 Customer')
        : orders;
        
      callback(filtered);
    }, (err) => {
      console.warn("Firebase User Orders Snapshot listener error:", err.message);
      callback([]);
    });
  } catch (err) {
    console.warn("Firebase query error:", err.message);
    callback([]);
    return () => {};
  }
};

/**
 * Real-time listener for Admin Portal (Print Jobs & Login Logs) from Firebase
 */
export const subscribeAdminData = (callback) => {
  if (!db || !isFirebaseAvailable) {
    callback({ orders: [], logs: [] });
    return () => {};
  }

  let currentOrders = [];
  let currentLogs = [];

  const unsubOrders = onSnapshot(collection(db, ORDERS_COL), (snapshot) => {
    currentOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    currentOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback({ orders: currentOrders, logs: currentLogs });
  }, (err) => console.warn("Firebase Admin Orders listener error:", err.message));

  const unsubLogs = onSnapshot(collection(db, LOGS_COL), (snapshot) => {
    currentLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    currentLogs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback({ orders: currentOrders, logs: currentLogs });
  }, (err) => console.warn("Firebase Admin Logs listener error:", err.message));

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
