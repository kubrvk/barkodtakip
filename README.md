# BARCODE TRACKING

<img align="left" width="20%" src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip1.PNG"/>
<h3> <a href="https://barkodtakips.web.app/"><img src="https://img.shields.io/badge/Live_Demo-042621?style=flat-square&logo=googlechrome&logoColor=white" height="25"/> </a></h3>

![](https://img.shields.io/badge/React_Native-20232A?style=for-the-badges&logo=react&logoColor=61DAFB) ![](https://img.shields.io/badge/Expo-000020?style=for-the-badges&logo=expo&logoColor=white) ![](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badges&logo=firebase&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badges&logo=typescript&logoColor=white) ![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badges)
<br>

Barcode Tracking is a simple and practical product and stock management app built with React Native (Expo) for both Android and web platforms.<br>
The app helps you scan barcodes, save product information, manage inventory, and track stock efficiently with real-time cloud synchronization.

Built primarily for Android and Web, the core design challenge was creating a responsive, cross-platform experience that handles device camera integration, local state management, and real-time database updates seamlessly.
<br clear="left"/>
<br>
<p align="center">
<img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip2.PNG" width="24%"/><img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip3.PNG" width="24%"/><img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip4.PNG" width="24%"/><img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip5.PNG" width="24%"/>
</p>
<p align="center">
<img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip6.PNG" width="24%"/><img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip7.PNG" width="24%"/><img src="https://raw.githubusercontent.com/kubrvk/portfolio/main/img/galeri/barkodtakip11.png" width="24%"/>
</p>

---

## Technical Details:

| Layer | Technology |
|---|---|
| Framework | React Native (Expo) |
| Primary Language | TypeScript |
| Backend & Auth | Firebase (Firestore, Authentication) |
| Navigation | React Navigation (Native Stack, Bottom Tabs) |
| Camera/Scanner | Expo Camera |
| State Management | React Hooks & Context |
| Platform | Android, Web |
| UI/Icons | Lucide React Native |

---

## Code Overview

The codebase is structured in a feature-first component architecture, separating concerns between UI screens, reusable components, and custom hooks.

```text
barkodtakip/
├── src/
│   ├── components/            # Reusable UI elements (buttons, inputs, cards)
│   ├── config/                # Firebase configuration and constants
│   ├── hooks/                 # Custom React hooks for business logic
│   ├── screens/               # Main application screens
│   │   ├── AddProductScreen.tsx   # Product entry form
│   │   ├── BarcodeScreen.tsx      # Camera and barcode scanning
│   │   ├── CountScreen.tsx        # Inventory counting logic
│   │   ├── DashboardScreen.tsx    # App overview and stats
│   │   ├── LocationsScreen.tsx    # Location management
│   │   ├── LoginScreen.tsx        # Firebase Authentication
│   │   ├── ProductsScreen.tsx     # List of tracked items
│   │   └── ProfileScreen.tsx      # User settings
│   └── types/                 # TypeScript interfaces and types
├── App.tsx                    # Entry point and navigation container
└── app.json / eas.json        # Expo & EAS build configuration
```

---

## Core Systems:

### 1. Barcode Scanning & Camera Integration:
The central utility of the application is seamlessly reading product barcodes to interact with the database.

**Design:**
- Utilizes `expo-camera` to read 1D and 2D barcodes in real-time.
- On successful scan, automatically queries Firestore for the associated barcode.
- If the item exists, it proceeds to update stock. If new, it opens the `AddProductScreen` pre-filled with the scanned code.

### 2. Real-Time Inventory Management:
Products and their quantities are managed dynamically.

- **Dashboard:** Provides an immediate overview of stock levels, total items, and recent activity.
- **Locations:** Products can be assigned to different physical locations (warehouse, store, etc.).
- **Counting:** Dedicated `CountScreen` enables rapid physical inventory audits using the device camera.

### 3. Cloud Synchronization:
Built on top of Firebase services to guarantee data consistency.

- **Authentication:** Secure user login via Firebase Auth (`LoginScreen.tsx`).
- **Firestore:** Products, categories, locations, and user data are stored as NoSQL documents.
- **Real-time Listeners:** Components re-render automatically when data changes in the cloud, ensuring multiple devices stay in sync.

### 4. Cross-Platform UI/UX:
- Designed to feel native on Android while maintaining full functionality on the web via `react-native-web`.
- Employs `react-navigation` with Bottom Tabs for fluid, intuitive screen transitions.
- Fully typed with TypeScript to reduce runtime errors and enhance code predictability.

---

## Developer

**Kubrik**

[GitHub](https://github.com/kubrvk) · [Portfolio](https://kubrvk.github.io/portfolio/)
