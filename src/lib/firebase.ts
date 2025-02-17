// HybridAI/src/lib/firebase.ts

/**
 * @file Firebase configuration and initialization module
 * @module lib/firebase
 * @requires firebase/app
 * @requires firebase/firestore
 * @requires firebase/auth
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  type User,
  type Auth,
} from "firebase/auth";

/**
 * Custom error class for Firebase configuration validation failures
 * @class
 * @extends Error
 * @property {string} name - Error type identifier
 * @property {string} field - Problematic configuration field name
 */
class FirebaseConfigError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "FirebaseConfigError";
    this.field = field;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirebaseConfigError);
    }
  }

  /**
   * Generates user-friendly error message based on environment
   * @returns {string} Appropriate error message for current environment
   */
  public get userMessage(): string {
    return `Configuration error: ${this.message}`;
  }
}

/**
 * Custom error class for Firebase initialization failures
 * @class
 * @extends Error
 */
class FirebaseInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseInitializationError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirebaseInitializationError);
    }
  }
}

/**
 * Validates Firebase configuration object
 * @param {object} config - Firebase configuration to validate
 * @throws {FirebaseConfigError} When any required field is missing or invalid
 */
const validateFirebaseConfig = (config: Record<string, unknown>): void => {
  const configFields = {
    apiKey: "API key for Firebase services",
    authDomain: "Authentication domain",
    projectId: "Firebase project ID",
    storageBucket: "Cloud Storage bucket",
    messagingSenderId: "Cloud Messaging sender ID",
    appId: "Firebase application ID",
    measurementId: "Google Analytics ID",
  };

  for (const [field, description] of Object.entries(configFields)) {
    if (!config[field]) {
      const devMessage = `Missing ${description} (${field}). Check environment variables.`;
      throw new FirebaseConfigError(field, devMessage);
    }
  }
};

/**
 * Initializes Firebase services with environment-aware error handling
 * @returns {Object} Initialized Firebase services
 * @throws {FirebaseInitializationError} When initialization fails
 */
export const initializeFirebase = (): {
  firebaseApp: FirebaseApp;
  db: Firestore;
  auth: Auth;
} => {
  let firebaseApp: FirebaseApp | null = null;
  let db: Firestore | null = null;
  let auth: Auth | null = null;

  if (firebaseApp && db && auth) {
    return { firebaseApp, db, auth };
  }

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    validateFirebaseConfig(firebaseConfig);

    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);

    return { firebaseApp, db, auth };
  } catch (error) {
    const errorMessage =
      error instanceof FirebaseConfigError
        ? error.userMessage
        : `Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`;

    throw new FirebaseInitializationError(errorMessage);
  }
};

export const { firebaseApp, db, auth } = initializeFirebase();

export const initializeAnonymousAuth = async (): Promise<User> => {
  try {
    const { auth } = initializeFirebase();
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error) {
    throw new FirebaseInitializationError(
      `Anonymous auth failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export { signInAnonymously };
