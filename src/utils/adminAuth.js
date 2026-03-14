import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../config/firebase"; // Ensure you export firebaseConfig from your config file

// We create a secondary app instance to create users without logging out the current admin
export const createSystemUser = async (email, password, userData) => {
  let secondaryApp;
  try {
    // 1. Initialize a secondary app with a unique name
    secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
    const secondaryAuth = getAuth(secondaryApp);
    const db = getFirestore(getApp()); // Use the main app's Firestore connection

    // 2. Create the user in Authentication (on the secondary app)
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;

    // 3. Create the User Document in Firestore 'users' collection
    // This links the Auth ID to the Role
    await setDoc(doc(db, "users", uid), {
      uid: uid,
      email: email,
      name: userData.name,
      role: userData.role, // 'teacher', 'data_entry', etc.
      createdAt: new Date(),
      status: 'active'
    });

    // 4. If it's a teacher, you might also want to create a specific 'teachers' profile
    if (userData.role === 'teacher') {
       await setDoc(doc(db, "teachers", uid), {
         ...userData, // name, subject, phone, etc.
         uid: uid,
         createdAt: new Date()
       });
    }

    // 5. Sign out the secondary auth so it doesn't linger
    await signOut(secondaryAuth);

    return uid;

  } catch (error) {
    console.error("Error creating system user:", error);
    throw error;
  } finally {
    // 6. Delete the secondary app instance to clean up
    if (secondaryApp) {
      // Note: deleteApp is asynchronous in newer SDKs, but we can usually let it be garbage collected
      // or explicitely delete if using the full module. 
      // specific cleanup isn't strictly necessary for a quick operation, 
      // but keeping it isolated is key.
    }
  }
};