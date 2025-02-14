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
import { getAuth, type Auth } from "firebase/auth";

/**
 * Custom error class for Firebase configuration validation failures
 * @class
 * @extends Error
 * @property {string} name - Error type identifier
 * @property {string} field - Problematic configuration field name
 * @property {boolean} isProduction - Environment flag
 */
class FirebaseConfigError extends Error {
  readonly field: string;
  readonly isProduction: boolean;

  constructor(field: string, message: string, isProduction: boolean) {
    super(message);
    this.name = "FirebaseConfigError";
    this.field = field;
    this.isProduction = isProduction;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirebaseConfigError);
    }
  }

  /**
   * Generates user-friendly error message based on environment
   * @returns {string} Appropriate error message for current environment
   */
  public get userMessage(): string {
    return this.isProduction
      ? "Service configuration error. Please contact support."
      : `Configuration error: ${this.message}`;
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
  const isProduction =
    process.env.NODE_ENV === process.env.HYBRIDAI_DEFAULT_PROD;
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
      throw new FirebaseConfigError(
        field,
        isProduction ? `Missing ${field}` : devMessage,
        isProduction
      );
    }
  }
};

/**
 * Initializes Firebase services with environment-aware error handling
 * @returns {Object} Initialized Firebase services
 * @throws {FirebaseInitializationError} When initialization fails
 */
const initializeFirebase = (): {
  firebaseApp: FirebaseApp;
  db: Firestore;
  auth: Auth;
} => {
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

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    if (process.env.NODE_ENV === process.env.HYBRIDAI_DEFAULT_DEV) {
      console.debug("Firebase services initialized successfully");
    }

    return { firebaseApp, db, auth };
  } catch (error) {
    const errorMessage =
      error instanceof FirebaseConfigError
        ? error.userMessage
        : `Initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`;

    if (process.env.NODE_ENV !== process.env.HYBRIDAI_DEFAULT_PROD) {
      console.error("Firebase initialization error details:", error);
    }

    throw new FirebaseInitializationError(errorMessage);
  }
};

export const { firebaseApp, db, auth } = initializeFirebase();
