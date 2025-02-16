# HybridAI

## Overview

The project aims to develop a **Web3-integrated AI assistant** called **HybridAI** that provides users with:

1. Free access to AI models tailored for cryptocurrency-related tasks.
2. Create one ecosystem for all the crypto-related operations inside the app.
3. Have analytical tools for the technical analysis like TradingView.
4. Maximal simplification of the crypto-related operations for the users.

The first step involved **building a prototype** using **React**, focusing on structuring the UI and integrating core interactive components.

---

## Current Implementation

### Authentication & Wallet Management

- **`AuthModal.tsx`** – Handles user authentication via Google, Twitter, and Web3 wallets.
- **`WalletInfo.tsx`** – Displays connected wallet details and transaction history.
- **`auth.ts`** – Manages authentication logic, session handling, and token validation.
- **`firebase.ts`** – Firebase configuration for user authentication and data storage.
- **`firebaseController.ts`** – Handles Firebase-related operations, such as user session validation and database interactions.

### User Interface & Core Layout

- **`Sidebar.tsx`** – Provides navigation and quick access to AI models.
- **`CentralWidget.tsx`** – Main interactive area where users engage with AI models.
- **`ThemeToggle.tsx`** – Allows switching between light and dark themes.
- **`ThemeContext.ts`** – Context provider for managing theme state across the app.
- **`ThemeProvider.tsx`** – Controls and applies theme settings globally.
- **`useTheme.ts`** – Custom React hook for accessing and modifying theme preferences.

### AI Model Selection & Suggestions

- **`AISelector.tsx`** – Enables users to choose an AI model for cryptocurrency analysis.
- **`SuggestionList.tsx`** – Displays AI-generated recommendations.
- **`prompt-pool.ts`** – Manages predefined prompt templates for AI interactions.

### Error Handling & Notifications

- **`ErrorBoundary.tsx`** – Catches and logs unexpected runtime errors.
- **`ErrorModal.tsx`** – Displays error messages in a user-friendly format.
- **`ComingSoon.tsx`** – Placeholder for features under development.

### Chat & User Interaction

- **`chatController.ts`** – Manages chat-based interactions with AI models and Web3 services.

### Blockchain & Web3 Integration

- **`useSolana.ts`** – Custom React hook for interacting with the Solana blockchain.
- **`chains.ts`** – Defines supported blockchain networks and their configurations. Used for multi-chain support and ensuring seamless integration across different ecosystems.

### State Management & Global Store

- **`store.ts`** – Centralized state management for handling global application data.

### Middleware & API Processing

- **`middleware.ts`** – Middleware layer for handling API requests between the frontend and backend, ensuring security, validation, and efficient data processing.

---

## **Authentication & Wallet Management**

### **`AuthModal.tsx`** – Authentication Modal

#### **Functionality:**

- Provides a modal window for users to authenticate via **Google, Twitter, and Web3 wallets**.
- Manages user input for authentication and login procedures.
- Handles authentication state updates and error messages.

#### **How It Works:**

1. **State Initialization**
   - Maintains authentication state using React's `useState`.
   - Stores authentication providers (`Google`, `Twitter`, `Web3`).
2. **Authentication Flow**
   - Calls `auth.ts` to initiate authentication for the selected provider.
   - If Web3 authentication is chosen, connects to the user's wallet.
   - Displays success or error messages based on login status.
3. **UI Rendering**
   - Shows login buttons for each authentication method.
   - Displays errors if authentication fails.
   - Closes the modal on successful login.

---

### **`WalletInfo.tsx`** – User Wallet Information

#### **Functionality:**

- Displays connected wallet details and transaction history.
- Provides an interface for managing Web3 wallet interactions.

#### **How It Works:**

1. **Fetches Wallet Data**
   - Uses `useSolana.ts` to retrieve wallet information.
   - Displays **wallet address, balance, and recent transactions**.
2. **Handles Wallet Connection & Disconnection**
   - Uses Web3 APIs to establish a connection with supported wallets.
   - Allows users to disconnect their wallets securely.
3. **Transaction Display**
   - Fetches recent transaction history from the blockchain.
   - Formats transaction data for better readability.

---

### **`auth.ts`** – Authentication Logic

#### **Functionality:**

- Handles user authentication and session management.
- Provides token validation and user identity management.

#### **Algorithm:**

1. **User Login Request**
   - Detects the selected authentication provider.
   - Calls Firebase authentication API for Google and Twitter logins.
   - Initiates Web3 authentication by requesting wallet signature.
2. **Token Generation & Validation**
   - Generates a JWT token upon successful authentication.
   - Validates tokens for active sessions.
   - Stores session details in local storage or Firebase.
3. **Session Management**
   - Monitors user session status.
   - Logs out users on token expiration.

---

### **`firebase.ts`** – Firebase Configuration

#### **Functionality:**

- Provides Firebase initialization for authentication and database storage.

#### **How It Works:**

- Exports Firebase app instance.
- Sets up authentication and Firestore database connections.

---

### **`firebaseController.ts`** – Firebase Interaction Handler

#### **Functionality:**

- Manages all Firebase-related actions, such as **user session validation, data storage, and retrieval**.

#### **Algorithm:**

1. **User Authentication Handling**
   - Checks if a user session exists.
   - Retrieves user details from Firebase authentication.
2. **Data Fetching**
   - Retrieves user-specific data from Firestore.
   - Ensures real-time updates on authentication state.

---

## **User Interface & Core Layout**

### **`Sidebar.tsx`** – Sidebar Navigation

#### **Functionality:**

- Provides a navigation panel for users to switch between different AI models and features.

#### **How It Works:**

- Uses React state to manage active sections.
- Renders clickable menu options for navigation.

---

### **`CentralWidget.tsx`** – Main UI Component

#### **Functionality:**

- Central container for AI interactions and user inputs.

#### **Algorithm:**

1. **Renders AI Model Selection**
   - Fetches available AI models from `AISelector.tsx`.
2. **Processes User Queries**
   - Sends input queries to `chatController.ts`.
   - Displays AI-generated responses.

---

## **AI Model Selection & Suggestions**

### **`AISelector.tsx`** – AI Model Selection

#### **Functionality:**

- Allows users to select an AI model for cryptocurrency analysis.

#### **Algorithm:**

1. **Fetch Available AI Models**
   - Retrieves model list from a predefined configuration.
2. **Render Selection UI**
   - Displays available AI models as selectable options.
3. **Handle User Selection**
   - Stores selected model state.
   - Sends selection details to `chatController.ts`.

---

### **`prompt-pool.ts`** – AI Prompt Management

#### **Functionality:**

- Manages a pool of predefined prompts for AI interactions.

#### **Algorithm:**

1. **Stores Predefined Prompts**
   - Maintains a list of structured prompts.
2. **Provides AI Query Templates**
   - Fetches suitable prompts based on user input.
   - Optimizes prompt selection for better AI responses.

---

## **Error Handling & Notifications**

### **`ErrorBoundary.tsx`** – Global Error Handler

#### **Functionality:**

- Catches unexpected runtime errors and prevents UI crashes.

#### **How It Works:**

- Wraps around application components.
- Displays a fallback UI when an error occurs.

---

### **`ErrorModal.tsx`** – Error Notification Component

#### **Functionality:**

- Shows error messages to the user.

#### **Algorithm:**

1. **Receives Error Data**
   - Accepts error messages from `ErrorBoundary.tsx`.
2. **Displays User-Friendly UI**
   - Renders modal with error details.

---

## **Chat & User Interaction**

### **`chatController.ts`** – Chat-Based AI Interaction Handler

#### **Functionality:**

- Manages communication between the user and AI models.

#### **Algorithm:**

1. **Handles User Messages**
   - Processes text inputs from users.
2. **Routes Queries to AI**
   - Sends user messages to the selected AI model.
3. **Returns AI Responses**
   - Receives AI-generated outputs and formats them.

---

## **Blockchain & Web3 Integration**

### **`useSolana.ts`** – Solana Blockchain Interaction Hook

#### **Functionality:**

- Provides a React hook for connecting to Solana blockchain.

#### **Algorithm:**

1. **Connects to Solana Network**
   - Uses `solana/web3.js` to establish a connection.
2. **Retrieves Wallet Data**
   - Fetches wallet balance and transaction history.

---

### **`chains.ts`** – Blockchain Network Configuration

#### **Functionality:**

- Defines supported blockchain networks.

#### **How It Works:**

- Provides a list of blockchain configurations.
- Ensures smooth integration for multi-chain support.

---

## **State Management & Global Store**

### **`store.ts`** – Centralized State Management

#### **Functionality:**

- Stores global application state.

#### **Algorithm:**

1. **Manages User Authentication State**
   - Stores user login status.
2. **Maintains Selected AI Model**
   - Keeps track of the user’s selected AI.

---

# **HybridAI Middleware (`middleware.ts`) Documentation**

## **Algorithm**

### **1. Rate Limiting**

**Goal:** Prevents excessive requests from the same IP to mitigate brute force and denial-of-service (DoS) attacks.  
**Steps:**

1. Extract the client's IP address from request headers.
2. Check if the IP address has exceeded the allowed request limit.
3. If the limit is exceeded, return an error response preventing further requests.
4. Otherwise, allow the request to proceed.

---

### **2. Request Logging**

**Goal:** Tracks incoming requests for monitoring and debugging purposes.  
**Steps:**

1. Extract the request path and timestamp.
2. Log the request details, including the request method and path.
3. Allow the request to continue processing.

---

### **3. CSRF Protection**

**Goal:** Prevents cross-site request forgery (CSRF) attacks.  
**Steps:**

1. Check if the request method is `GET`.
2. If not a `GET` request, verify the presence of a valid CSRF token in the request headers.
3. If the CSRF token is missing or invalid, block the request.
4. Otherwise, allow the request to proceed.

---

### **4. Authentication Enforcement**

**Goal:** Restricts access to protected API routes, ensuring only authenticated users can access them.  
**Steps:**

1. Extract authentication token from the request.
2. Validate the token against the authentication system.
3. If authentication fails and the request targets a protected route, block access.
4. If the user is authenticated, allow the request to continue.

---

### **5. API Request Validation**

**Goal:** Ensures all API requests have valid content types to prevent malformed data processing.  
**Steps:**

1. Check if the request targets an API endpoint.
2. If the request method is not `GET`, verify that the `Content-Type` header is set to `application/json`.
3. If the `Content-Type` is incorrect or missing, reject the request.
4. Otherwise, allow the request to proceed.

---

### **6. Security Headers Enforcement**

**Goal:** Adds security-related HTTP headers to mitigate security vulnerabilities.  
**Steps:**

1. Set headers to prevent MIME-type sniffing attacks.
2. Disallow the application from being embedded in iframes to prevent clickjacking.
3. Enable browser-based XSS (Cross-Site Scripting) protection.
4. Enforce HTTPS security policies.
5. Restrict access to device features such as the camera and microphone.
6. Set referrer policies to control how referrer information is shared between requests.

---

## **Middleware Matching Rules**

**Goal:** Ensure middleware applies to all relevant requests while excluding unnecessary ones.  
**Steps:**

1. Define a matcher rule that applies middleware to all request paths.
2. Exclude static assets (`_next/static`), image optimizations (`_next/image`), and favicon requests (`favicon.ico`).
3. Apply middleware only to valid application routes to optimize performance.

---

## Next Steps

1. Connect the interaction with the AI model:

   - 1.1. When the user writes a request and clicks the send button, send the request to the AI model and go to the page /chats/<uuid4> with the new chat name "New Chat", then assign it a name in accordance with the user's request and <uuid4>, which will be associated with it. The /chats page will be similar to OpenAI ChatGPT, i.e., the left sidebar will be the same, and the right side will be the central widget, where the chat with the AI model will be displayed.
   - 1.2. If the user selected one of the suggestions or wrote their own request, repeat step 1.1 in accordance with the selected AI model.
   - 1.3. If the user clicked the "Stop" button, stop the interaction with the AI model.
   - 1.4. If the user clicked the "Delete" button, delete the chat from the list of chats and go to the main page.

**Important:**

- All the AI models should be preconfigured for themes: web3, trading, crypto, NFTs, staking, DeFi, etc.
- Prompt pool you can find in `src/lib/prompt-pool.ts` file.

1. Chats page:

   - 2.1. The page will be similar to OpenAI ChatGPT, i.e., the left sidebar will be the same, and the right side will be the central widget, where the chat with the AI model will be displayed.
   - 2.2. "Chats" menu item in the sidebar will have options: "Add", "Rename", "Delete".
   - 2.3. Firebase Collections and Structure:

#### `users` Collection

Each user will have an entry in the users collection, which contains the list of chat IDs that belong to them.
Example document in `users/{userID}`

```json
{
  "userID": "d8a92f0a-1234-5678-abcd-ef9012345678",
  "walletAddress": "A1b2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0",
  "emails": ["user@example.com"],
  "xac": "@username_x",
  "googleAcc": "user@gmail.com",
  "chatIDs": ["chat_123", "chat_456"],
  "lastLogin": "2024-02-12T12:00:00Z"
}
```

The `chatIDs` field stores an array of chat IDs belonging to the user. When a new chat is created, its chatID is added to this list.

#### `chats` Collection

Each chat will be stored as a separate document in the chats collection. The chat messages will be embedded inside the chat document as an array.
Example document in `chats/{chatID}`

```json
{
  "chatID": "chat_123",
  "userID": "d8a92f0a-1234-5678-abcd-ef9012345678",
  "chatName": "Solana Discussion",
  "chatModel": "gpt-4-turbo",
  "messages": [
    {
      "sender": "user",
      "text": "What are the latest Solana trends?",
      "timestamp": "2024-02-12T12:01:00Z"
    },
    {
      "sender": "assistant",
      "text": "Solana is gaining traction in DeFi...",
      "timestamp": "2024-02-12T12:02:00Z"
    }
  ],
  "createdAt": "2024-02-12T12:00:00Z"
}
```

- **chatID** – Unique identifier of the chat.
- **userID** – Links the chat to the owner (users/{userID}).
- **chatName** – The name of the chat, which can be renamed.
- **chatModel** – The AI model used in this conversation (e.g., OpenAI, DeepSeek, Claude, Gemini).
- **messages[]** – Array of messages in the conversation.
- **createdAt** – Timestamp when the chat was created.

#### Adding a new chat

- A new document is created in the chats collection.
- The generated chatID is added to the chatIDs array in the users/{userID} document.
- The sidebar updates to display the newly created chat.

#### Renaming a chat

- User selects a chat and provides a new name.
- Firestore updates the chatName field of the selected chat.
- The sidebar reflects the updated chat name.

#### Deleting a chat

- The chat document is deleted from Firestore.
- The corresponding chatID is removed from the users/{userID} document.
- The sidebar updates to reflect the deletion.

#### Support offline mode

Since Firestore charges per read operation, we implement IndexedDB caching for faster performance and offline support.

### Further plans:

- Add NFT Lab.
- Add staking mechanism.
- Add AI-agents for:
  - Trading
  - Staking
  - Swapping
- TradingView integration for the technical analysis.

> **Important to notice:** we are working only on Solana network for now and using only Phantom wallet, but in TradingView bot we will use multi-chain support, not to restrict users to use only Solana.

All the details will be provided later.
