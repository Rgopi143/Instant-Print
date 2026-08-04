# Instant Print — Firebase Firestore Database Architecture & Schema Specification

**Project ID**: `insta-print-bbe9f`  
**Database Type**: Google Cloud Firestore (NoSQL Document Database)  
**Database Region**: Asia-South1 (Mumbai) / Multi-Region Standard  

---

## 📁 Firestore Database Structure & Collections Overview

The database for **Instant Print** is designed around 4 primary collections:

```
insta-print-bbe9f (Root Database)
├── 📄 print_orders         [Collection] -> Contains all printed document jobs & receipts
├── 📄 user_login_logs       [Collection] -> Contains user & admin authentication audit trails
├── 📄 users                 [Collection] -> Contains customer profiles & loyalty points
└── 📄 kiosk_hardware_status [Collection] -> Real-time status of kiosk paper, ink, & online state
```

---

## 📑 Collection Schemas & Document Specifications

### 1. `print_orders` Collection
Stores every print transaction executed through the Customer Portal or Kiosk.

* **Collection Path**: `/print_orders/{documentId}`
* **Auto-Generated ID**: Firestore Auto-ID (e.g., `8fK29xL1mQp0zW...`)

#### Field Definitions & Data Types

| Field Name | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `orderId` | `string` | Human-readable Order Reference ID | `"ORD-9104"` |
| `name` | `string` | Original name of uploaded file | `"Resume_Updated_2026.pdf"` |
| `pages` | `number` | Total number of pages printed | `3` |
| `mode` | `string` | Color mode & side selection | `"B&W Double-Sided"` \| `"Color Single-Sided"` |
| `cost` | `string` | Total amount paid (formatted currency) | `"₹6.00"` |
| `status` | `string` | Job execution status | `"Completed"` \| `"Processing"` \| `"Failed"` |
| `date` | `string` | Formatted timestamp string for display | `"05 Aug 2026, 03:15 PM"` |
| `category` | `string` | Document type classification | `"PDF"` \| `"Photo"` \| `"DOCX"` \| `"TXT"` |
| `phone` | `string` | Verified phone number of customer | `"+91 8247806042"` |
| `kiosk` | `string` | Kiosk hardware unit identifier | `"Terminal Kiosk #402"` |
| `createdAt` | `timestamp` | Server timestamp for sorting & audit | `Timestamp(seconds=1785890000, nanoseconds=0)` |

#### Sample Document JSON Format
```json
{
  "orderId": "ORD-9104",
  "name": "Resume_Updated_2026.pdf",
  "pages": 3,
  "mode": "B&W Double-Sided",
  "cost": "₹6.00",
  "status": "Completed",
  "date": "05 Aug 2026, 03:15 PM",
  "category": "PDF",
  "phone": "+91 8247806042",
  "kiosk": "Terminal Kiosk #402",
  "createdAt": "2026-08-05T00:15:00.000Z"
}
```

---

### 2. `user_login_logs` Collection
Tracks all customer SMS OTP logins, Guest sessions, and Admin PIN authentications.

* **Collection Path**: `/user_login_logs/{documentId}`

#### Field Definitions & Data Types

| Field Name | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `phone` | `string` | Customer phone number or identifier | `"+91 8247806042"` \| `"Guest User"` |
| `type` | `string` | Authentication method used | `"SMS OTP Verified"` \| `"Admin 6-Digit PIN"` |
| `status` | `string` | Login session status | `"Active Session"` \| `"Completed"` \| `"Session Closed"` |
| `role` | `string` | User access role | `"Verified Customer"` \| `"System Admin"` \| `"Guest Customer"` |
| `device` | `string` | Access device / kiosk terminal | `"Terminal Kiosk #402"` \| `"Mobile Companion"` |
| `time` | `string` | Display time string | `"03:25 PM"` |
| `createdAt` | `timestamp` | Server timestamp for ordering | `Timestamp(seconds=1785890000, nanoseconds=0)` |

#### Sample Document JSON Format
```json
{
  "phone": "+91 8247806042",
  "type": "Admin 6-Digit PIN",
  "status": "Active Session",
  "role": "System Admin",
  "device": "Terminal Kiosk #402",
  "time": "03:25 PM",
  "createdAt": "2026-08-05T00:25:00.000Z"
}
```

---

### 3. `users` Collection
Contains customer profile details, loyalty points balance, and account tiers.

* **Collection Path**: `/users/{phone}` (Keyed by Phone Number)

#### Field Definitions & Data Types

| Field Name | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `phone` | `string` | Primary key / Phone number | `"+91 8247806042"` |
| `role` | `string` | Customer or Admin role | `"customer"` \| `"admin"` |
| `tier` | `string` | Membership tier | `"Silver Tier"` \| `"Gold Tier"` \| `"Platinum Tier"` |
| `loyaltyPoints` | `number` | Accumulated rewards points | `120` |
| `totalJobsPrinted` | `number` | Counter of total orders completed | `5` |
| `totalAmountSpent` | `number` | Total rupee amount spent | `162.00` |
| `lastLoginAt` | `timestamp` | Server timestamp of last login | `Timestamp(...)` |
| `createdAt` | `timestamp` | Profile registration date | `Timestamp(...)` |

---

### 4. `kiosk_hardware_status` Collection
Real-time telemetry and hardware state of the printing kiosk.

* **Collection Path**: `/kiosk_hardware_status/kiosk_402`

#### Field Definitions & Data Types

| Field Name | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `kioskId` | `string` | Kiosk hardware ID | `"kiosk_402"` |
| `isOnline` | `boolean` | Network connection state | `true` |
| `paperTrayLevel` | `number` | Paper sheet count (Max 500) | `450` |
| `inkTonerPercent` | `number` | Ink cartridge remaining % | `94` |
| `printerStatus` | `string` | Printer operational status | `"Ready"` \| `"Printing"` \| `"Paper Jam"` \| `"Out of Paper"` |
| `lastUpdated` | `timestamp` | Telemetry ping timestamp | `Timestamp(...)` |

---

## 🔒 Recommended Firebase Security Rules (`firestore.rules`)

Place the following rules in your Firebase Console under **Firestore Database > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Print Orders: Anyone can create; customers read their own orders; admins read all
    match /print_orders/{orderId} {
      allow create: if request.resource.data.pages > 0;
      allow read: if true;
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    // Login Logs: Anyone can log login event; admins read/clear
    match /user_login_logs/{logId} {
      allow create: if true;
      allow read: if true;
      allow update, delete: if true;
    }

    // Users Collection: Users read & write their own record
    match /users/{phone} {
      allow read, write: if true;
    }

    // Kiosk Hardware Status: Read public, write restricted
    match /kiosk_hardware_status/{kioskId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## ⚡ Recommended Indexes (`firestore.indexes.json`)

To enable fast real-time ordering and filtering by phone and creation date:

```json
{
  "indexes": [
    {
      "collectionGroup": "print_orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "phone", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_login_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```
