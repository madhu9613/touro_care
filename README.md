# Touro Care

Touro Care is a full-stack platform designed to enhance tourist safety and digital identity management using Hyperledger Fabric blockchain, machine learning, and modern web/mobile technologies.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup Instructions](#setup-instructions)
- [Directory Overview](#directory-overview)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```
touro_care/
├── backend/           # Node.js/Express backend API, blockchain integration
├── frontend/          # Frontend app (React Native/Next.js)
├── ml_backend/        # Python ML microservice for anomaly detection, geofencing, etc.
└── fabric-samples/    # Hyperledger Fabric network, chaincode, and sample apps
```

---

## Features

- **Tourist Digital ID**: Secure registration and management of tourist identities on blockchain.
- **KYC & Biometric Verification**: Multi-step KYC with document and biometric checks.
- **Trip & Location Tracking**: Real-time trip details and geofencing for safety.
- **Anomaly Detection**: ML-powered detection of unusual activity or emergencies.
- **Emergency Alerts**: Automated alerts and logs for authorities and tourists.
- **Admin & Police Dashboards**: Role-based access for monitoring and intervention.
- **Cloud Storage**: Secure document/image uploads via Cloudinary.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- Docker & Docker Compose
- Hyperledger Fabric binaries
- npm, pip

### Setup Instructions

#### 1. Clone the Repository

```sh
git clone https://github.com/madhu9613/touro_care.git
cd touro_care
```

#### 2. Setup Hyperledger Fabric Network

```sh
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
```

#### 3. Start the Backend Server

```sh
cd ../../backend
npm install
cp .env.example .env   # Edit with your config
node server.js
```

#### 4. Start the ML Backend

```sh
cd ../ml_backend
pip install -r requirements.txt
python api/server.py
```

#### 5. Start the Frontend

```sh
cd ../frontend/app
npm install
npm start
```

---

## Directory Overview

- **backend/**: Express API, controllers, models, blockchain and ML integration, routes, middleware.
- **frontend/**: Mobile/web app for tourists, police, and admin (React Native/Next.js).
- **ml_backend/**: Python Flask ML microservice for anomaly detection, geofencing, etc.
- **fabric-samples/**: Fabric network scripts, chaincode, and configuration.

---

## Usage

- Register as a tourist via `/api/auth/register`
- Complete KYC and biometric verification
- Track trips and receive safety alerts
- Admins and police can monitor activity and respond to emergencies

---


## License

This project is licensed under the [Apache-2.0 License](LICENSE).

---

## Acknowledgements

- [Hyperledger Fabric](https://www.hyperledger.org/use/fabric)
- [Cloudinary](https://cloudinary.com/)
- [React Native](https://reactnative.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
