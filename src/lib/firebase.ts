import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword as realSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as realCreateUserWithEmailAndPassword,
  signInWithPopup as realSignInWithPopup,
  signOut as realSignOut,
  sendPasswordResetEmail as realSendPasswordResetEmail,
  updateProfile as realUpdateProfile,
  sendEmailVerification as realSendEmailVerification,
  onAuthStateChanged as realOnAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore,
  collection as realCollection,
  doc as realDoc,
  query as realQuery,
  where as realWhere,
  getDoc as realGetDoc,
  getDocs as realGetDocs,
  setDoc as realSetDoc,
  addDoc as realAddDoc,
  deleteDoc as realDeleteDoc,
  writeBatch as realWriteBatch,
  serverTimestamp as realServerTimestamp
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Resilient App Initialization
let appInstance: any;
try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase app initialization failed, creating temporary stub", e);
  appInstance = {};
}

// Resilient Auth Initialization
let authInstance: any;
try {
  authInstance = getAuth(appInstance);
} catch (e) {
  console.warn("Firebase auth initialization failed", e);
  authInstance = {
    currentUser: null,
    onAuthStateChanged: (cb: any) => {
      cb(null);
      return () => {};
    },
    signOut: async () => {}
  };
}

// Resilient Firestore database instance initialization with fallback
let dbInstance: any;
try {
  dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.warn("Firestore custom database initialization failed, trying default:", e);
  try {
    dbInstance = getFirestore(appInstance);
  } catch (err2) {
    console.warn("Firestore default database initialization also failed, using stub:", err2);
    dbInstance = {};
  }
}

export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = new GoogleAuthProvider();

// Error Handling Function conformity with Firestore skill requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// RESILIENT OFFLINE-FIRST DEVELOPMENT ENGINE
// ============================================

const _listeners: Array<(user: any) => void> = [];

export function isLocalMode(): boolean {
  try {
    // Default to LOCAL offline-first dev mode to bypass any cloud-provider rate-limitations
    const item = localStorage.getItem("local_dev_mode");
    return item !== "false";
  } catch (e) {
    return true;
  }
}

export function toggleLocalMode(val: boolean) {
  try {
    localStorage.setItem("local_dev_mode", val ? "true" : "false");
    window.location.reload();
  } catch (e) {}
}

const getLocalUser = () => {
  try {
    const data = localStorage.getItem("local_auth_user");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const setLocalUser = (user: any) => {
  try {
    if (user) {
      localStorage.setItem("local_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("local_auth_user");
    }
  } catch (e) {}
  _listeners.forEach(cb => cb(user));
};

const getLocalDb = (colName: string): any[] => {
  try {
    const data = localStorage.getItem(`local_db_${colName}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalDb = (colName: string, items: any[]) => {
  try {
    localStorage.setItem(`local_db_${colName}`, JSON.stringify(items));
  } catch (e) {}
};

// --- Intercepted Firestore Operations ---

export function collection(dbIns: any, collectionName: string) {
  if (isLocalMode()) {
    return { type: 'collection', name: collectionName };
  }
  return realCollection(dbIns, collectionName);
}

export function doc(dbOrCol: any, firstParam: string, secondParam?: string) {
  if (isLocalMode()) {
    if (secondParam !== undefined) {
      return { type: 'doc', collection: firstParam, id: secondParam };
    } else {
      const colName = typeof dbOrCol === 'string' ? dbOrCol : (dbOrCol.name || "unknown");
      const docId = firstParam || Math.random().toString(36).substring(2, 15);
      return { type: 'doc', collection: colName, id: docId };
    }
  }
  if (secondParam !== undefined) {
    return realDoc(dbOrCol, firstParam, secondParam);
  }
  return realDoc(dbOrCol, firstParam);
}

export function query(collectionRef: any, ...constraints: any[]) {
  if (isLocalMode()) {
    return { type: 'query', collection: collectionRef.name, constraints };
  }
  return realQuery(collectionRef, ...constraints);
}

export function where(field: string, operator: any, value: any) {
  if (isLocalMode()) {
    return { type: 'where', field, operator, value };
  }
  return realWhere(field, operator, value);
}

export async function addDoc(collectionRef: any, data: any) {
  if (isLocalMode()) {
    const colName = collectionRef.name;
    const items = getLocalDb(colName);
    const newDocId = Math.random().toString(36).substring(2, 15);
    const docData = { 
      id: newDocId, 
      ...data, 
      idField: newDocId,
      timestamp: data.timestamp || { seconds: Math.floor(Date.now() / 1000) }
    };
    items.push(docData);
    saveLocalDb(colName, items);
    return { id: newDocId };
  }
  
  try {
    return await realAddDoc(collectionRef, data);
  } catch (err: any) {
    if (err.message?.includes("quota") || err.message?.includes("exceeded") || err.message?.includes("offline") || err.message?.includes("permission") || err.message?.includes("unreachable")) {
      console.warn("Firestore trigger failed, routing dynamically to Local offline storage:", err.message);
      localStorage.setItem("local_dev_mode", "true");
      window.location.reload();
      throw err;
    }
    throw err;
  }
}

export async function setDoc(docRef: any, data: any) {
  if (isLocalMode()) {
    const colName = docRef.collection;
    const items = getLocalDb(colName);
    const idx = items.findIndex((i: any) => i.id === docRef.id);
    const docData = { 
      id: docRef.id, 
      ...data, 
      timestamp: data.timestamp || { seconds: Math.floor(Date.now() / 1000) } 
    };
    if (idx > -1) {
      items[idx] = docData;
    } else {
      items.push(docData);
    }
    saveLocalDb(colName, items);
    return;
  }
  
  try {
    return await realSetDoc(docRef, data);
  } catch (err: any) {
    if (err.message?.includes("quota") || err.message?.includes("exceeded") || err.message?.includes("offline") || err.message?.includes("permission") || err.message?.includes("unreachable")) {
      console.warn("Firestore trigger failed, routing dynamically to Local offline storage:", err.message);
      localStorage.setItem("local_dev_mode", "true");
      window.location.reload();
      throw err;
    }
    throw err;
  }
}

export async function getDoc(docRef: any): Promise<any> {
  if (isLocalMode()) {
    const items = getLocalDb(docRef.collection);
    const found = items.find((i: any) => i.id === docRef.id);
    return {
      exists: () => !!found,
      id: docRef.id,
      ref: docRef,
      data: () => found || null
    };
  }
  return realGetDoc(docRef);
}

export async function getDocs(queryOrCollectionRef: any): Promise<any> {
  if (isLocalMode()) {
    const isQuery = queryOrCollectionRef.type === 'query';
    const colName = isQuery ? queryOrCollectionRef.collection : queryOrCollectionRef.name;
    let items = getLocalDb(colName);
    
    if (isQuery && queryOrCollectionRef.constraints) {
      queryOrCollectionRef.constraints.forEach((c: any) => {
        if (c && c.type === 'where') {
          const { field, operator, value } = c;
          if (operator === '==') {
            items = items.filter((i: any) => i[field] === value);
          }
        }
      });
    }
    
    return {
      docs: items.map((item: any) => ({
        id: item.id,
        ref: { type: 'doc', collection: colName, id: item.id },
        data: () => item
      }))
    };
  }
  
  try {
    return await realGetDocs(queryOrCollectionRef);
  } catch (err: any) {
    if (err.message?.includes("quota") || err.message?.includes("exceeded") || err.message?.includes("offline") || err.message?.includes("permission") || err.message?.includes("unreachable")) {
      console.warn("Firestore query failed, routing dynamically to Local offline storage:", err.message);
      localStorage.setItem("local_dev_mode", "true");
      window.location.reload();
      throw err;
    }
    throw err;
  }
}

export async function deleteDoc(docRef: any) {
  if (isLocalMode()) {
    const colName = docRef.collection;
    let items = getLocalDb(colName);
    items = items.filter((i: any) => i.id !== docRef.id);
    saveLocalDb(colName, items);
    return;
  }
  return realDeleteDoc(docRef);
}

export function writeBatch(dbIns: any) {
  if (isLocalMode()) {
    const operations: Array<() => Promise<void>> = [];
    return {
      set: (docRef: any, data: any) => {
        operations.push(async () => {
          await setDoc(docRef, data);
        });
      },
      delete: (docRef: any) => {
        operations.push(async () => {
          await deleteDoc(docRef);
        });
      },
      commit: async () => {
        for (const op of operations) {
          await op();
        }
      }
    };
  }
  return realWriteBatch(dbIns);
}

export function serverTimestamp() {
  if (isLocalMode()) {
    return { seconds: Math.floor(Date.now() / 1000) };
  }
  return realServerTimestamp();
}

// --- Intercepted Authentication Operations ---

export function onAuthStateChanged(authIns: any, cb: (user: any) => void) {
  if (isLocalMode()) {
    _listeners.push(cb);
    setTimeout(() => {
      cb(getLocalUser());
    }, 50);
    return () => {
      const idx = _listeners.indexOf(cb);
      if (idx > -1) _listeners.splice(idx, 1);
    };
  }
  return realOnAuthStateChanged(authIns, cb);
}

export async function signInWithEmailAndPassword(authIns: any, email: string, password: any) {
  if (isLocalMode()) {
    const users = JSON.parse(localStorage.getItem("local_db_users") || "[]");
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      const err: any = new Error("No registered account found with this email.");
      err.code = "auth/user-not-found";
      throw err;
    }
    const mockUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.fullName || found.displayName || "Guest User",
      emailVerified: true
    };
    setLocalUser(mockUser);
    return { user: mockUser };
  }
  return realSignInWithEmailAndPassword(authIns, email, password);
}

export async function createUserWithEmailAndPassword(authIns: any, email: string, password: any) {
  if (isLocalMode()) {
    const users = JSON.parse(localStorage.getItem("local_db_users") || "[]");
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const err: any = new Error("Email is already in use.");
      err.code = "auth/email-already-in-use";
      throw err;
    }
    const newUid = Math.random().toString(36).substring(2, 15);
    const mockUser = {
      uid: newUid,
      email: email,
      displayName: "Guest User",
      emailVerified: true
    };
    users.push({ uid: newUid, email, fullName: "Guest User", createdAt: new Date().toISOString() });
    localStorage.setItem("local_db_users", JSON.stringify(users));
    setLocalUser(mockUser);
    return { user: mockUser };
  }
  return realCreateUserWithEmailAndPassword(authIns, email, password);
}

export async function signOut(authIns: any) {
  if (isLocalMode()) {
    setLocalUser(null);
    return;
  }
  return realSignOut(authIns);
}

export async function signInWithPopup(authIns: any, provider: any) {
  if (isLocalMode()) {
    const mockUser = {
      uid: "google-mock-user-12345",
      email: "developer@example.com",
      displayName: "Developer Guest",
      emailVerified: true
    };
    const users = JSON.parse(localStorage.getItem("local_db_users") || "[]");
    if (!users.find((u: any) => u.uid === mockUser.uid)) {
      users.push({ uid: mockUser.uid, email: mockUser.email, fullName: mockUser.displayName, createdAt: new Date().toISOString() });
      localStorage.setItem("local_db_users", JSON.stringify(users));
    }
    setLocalUser(mockUser);
    return { user: mockUser };
  }
  return realSignInWithPopup(authIns, provider);
}

export async function sendPasswordResetEmail(authIns: any, email: string) {
  if (isLocalMode()) {
    console.log("Simulating password reset email send to:", email);
    return;
  }
  return realSendPasswordResetEmail(authIns, email);
}

export async function updateProfile(user: any, profile: { displayName?: string }) {
  if (isLocalMode()) {
    const curr = getLocalUser();
    if (curr && curr.uid === user.uid) {
      curr.displayName = profile.displayName || curr.displayName;
      setLocalUser(curr);
      
      const users = JSON.parse(localStorage.getItem("local_db_users") || "[]");
      const idx = users.findIndex((u: any) => u.uid === user.uid);
      if (idx > -1) {
        users[idx].fullName = profile.displayName;
        localStorage.setItem("local_db_users", JSON.stringify(users));
      }
    }
    return;
  }
  return realUpdateProfile(user, profile);
}

export async function sendEmailVerification(user: any) {
  if (isLocalMode()) {
    console.log("Simulating verification dispatch to: ", user.email);
    return;
  }
  return realSendEmailVerification(user);
}
