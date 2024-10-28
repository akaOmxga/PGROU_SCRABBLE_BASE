// Google authentification :
// pour plus tard

import { auth } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

// Créer une instance du fournisseur Google
const googleProvider = new GoogleAuthProvider();
