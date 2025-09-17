# 🌍 Touro Care

**Touro Care** is a full-stack platform designed to enhance **tourist safety** and **digital identity management** using **Hyperledger Fabric blockchain**, **machine learning**, and **modern web/mobile technologies**.

---

## 🚀 Tech Stack  

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)  
![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)  
![React Native](https://img.shields.io/badge/React%20Native-Mobile%20App-61DAFB?logo=react)  
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js)  
![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger%20Fabric-Blockchain-blue?logo=hyperledger)  
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)  
![Machine Learning](https://img.shields.io/badge/ML-Anomaly%20Detection-orange?logo=tensorflow)  
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-lightblue?logo=cloudinary)  

---

## ✨ Features  

- 🔐 **Tourist Digital ID** – Secure registration & management on blockchain  
- 🪪 **KYC & Biometric Verification** – Multi-step document & biometric checks  
- 📍 **Trip & Location Tracking** – Real-time geofencing & trip safety monitoring  
- 🤖 **Anomaly Detection** – ML-powered unusual activity & emergency detection  
- 🚨 **Emergency Alerts** – Automated notifications for tourists & authorities  
- 🛡 **Admin & Police Dashboards** – Role-based monitoring & intervention  
- ☁️ **Cloud Storage** – Secure file uploads via Cloudinary  

---

## 🛠 Getting Started  

### ✅ Prerequisites  
- Node.js (v18+)  
- Python (3.10+)  
- Docker & Docker Compose  
- Hyperledger Fabric binaries  
- npm & pip  

---

### ⚡ Setup Instructions  

```sh
# Clone the Repository
git clone https://github.com/madhu9613/touro_care.git
cd touro_care

# Setup Hyperledger Fabric Network
cd fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

# Start the Backend Server
cd ../../backend
npm install
cp .env.example .env   # Edit with your config
node server.js

# Start the ML Backend
cd ../ml_backend
pip install -r requirements.txt
python api/server.py

# Start the Frontend
cd ../frontend/app
npm install
npm start
