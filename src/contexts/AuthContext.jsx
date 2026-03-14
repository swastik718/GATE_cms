import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. GENERIC REGISTER
  const register = useCallback(async (email, password, name, role = "admin") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        name,
        role, 
        status: 'active',
        createdAt: new Date(),
        lastLogin: null,
      });
      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }, []);

  // 2. LOGIN (Staff)
  const login = useCallback(async (email, password) => {
    try {
      // Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch User Role immediately
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error("User profile not found in database.");
      }

      const data = userDoc.data();

      // Security Check
      if (data.status === 'banned' || data.status === 'deleted') {
        await signOut(auth);
        throw new Error("Access Denied: Your account has been suspended.");
      }

      // Update last login
      await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });

      // FORCE UPDATE STATE IMMEDIATELY
      // This prevents the "double click" needed to login
      setCurrentUser(user);
      setUserData(data);
      setLoading(false);

      return { user, role: data.role };

    } catch (error) {
      // If login fails, ensure we are logged out cleanly
      await signOut(auth);
      throw error;
    }
  }, []);

  // 3. STUDENT LOGIN
  const studentLogin = useCallback(async (dob, password) => {
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("birthDate", "==", dob));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) { throw new Error("Student not found"); }

      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();

      if (studentData.password !== password) { throw new Error("Invalid credentials"); }

      const studentUser = {
        uid: studentDoc.id,
        email: studentData.email || "",
        displayName: studentData.name,
        role: "student",
      };

      localStorage.setItem('studentUser', JSON.stringify(studentUser));
      localStorage.setItem('studentData', JSON.stringify({ ...studentData, role: "student", uid: studentDoc.id }));

      setCurrentUser(studentUser);
      setUserData({ ...studentData, role: "student", uid: studentDoc.id });
      setLoading(false);

      return studentUser;
    } catch (error) {
      console.error("Student login error:", error);
      throw error;
    }
  }, []);

  // 4. LOGOUT
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('studentUser');
      localStorage.removeItem('studentData');
      setCurrentUser(null);
      setUserData(null);
      setLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  // 5. GLOBAL AUTH LISTENER (Restores Session on Refresh)
  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in via Firebase (Session Persisted)
        // We MUST fetch their data to confirm role
        
        const userDocRef = doc(db, "users", user.uid);
        
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();

            if (data.status === 'banned' || data.status === 'deleted') {
               signOut(auth);
               setCurrentUser(null);
               setUserData(null);
               return;
            }

            setCurrentUser(user);
            setUserData(data);
          } else {
             // User exists in Auth but not in DB (Data corruption)
             console.warn("User profile missing. Logging out.");
             signOut(auth);
             setCurrentUser(null);
             setUserData(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore Error:", err);
          setLoading(false);
        });

      } else {
        // No Firebase User - Check for Student in LocalStorage
        if (unsubscribeFirestore) unsubscribeFirestore();

        const storedStudent = localStorage.getItem('studentUser');
        const storedStudentData = localStorage.getItem('studentData');

        if (storedStudent && storedStudentData) {
          setCurrentUser(JSON.parse(storedStudent));
          setUserData(JSON.parse(storedStudentData));
        } else {
          setCurrentUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const value = { currentUser, userData, loading, register, login, studentLogin, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}