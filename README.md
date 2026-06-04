# HỆ THỐNG GIÁM SÁT THÀNH PHỐ THÔNG MINH TÍCH HỢP BLOCKCHAIN

<div align="center">

<p align="center">
  <img src="Pictures/dnu_logo.png" alt="DaiNam University Logo" width="200"/>
  <img src="Pictures/aiotlab_logo.png" alt="AIoTLab Logo" width="170"/>
  <img src="Pictures/fitdnu_logo.png" alt="FitDNU Logo" width="170"/>
</p>

[![Made by AIoTLab](https://img.shields.io/badge/Made%20by%20AIoTLab-blue?style=for-the-badge)](https://www.facebook.com/DNUAIoTLab)
[![Fit DNU](https://img.shields.io/badge/Fit%20DNU-green?style=for-the-badge)](https://fitdnu.net/)
[![DaiNam University](https://img.shields.io/badge/DaiNam%20University-red?style=for-the-badge)](https://dainam.edu.vn)

</div>
---

## 📖 Giới thiệu

Smart City Monitoring Dashboard là hệ thống giám sát dữ liệu đô thị theo thời gian thực, cho phép thu thập, hiển thị và lưu trữ dữ liệu từ nhiều nguồn cảm biến khác nhau trên một giao diện tập trung.

Hệ thống được xây dựng nhằm mô phỏng mô hình thành phố thông minh (Smart City), hỗ trợ nhà quản lý theo dõi:

* 🚦 Giao thông
* 🌡️ Nhiệt độ môi trường
* 💧 Độ ẩm
* ⚡ Năng lượng
* 🌊 Mực nước
* 📹 Camera giám sát

Dữ liệu cảm biến được gửi từ ESP8266 đến máy chủ Flask và hiển thị trực quan trên Dashboard. Ngoài ra, dữ liệu quan trọng được lưu trữ lên Blockchain cục bộ thông qua Ganache nhằm đảm bảo tính toàn vẹn và khả năng truy vết.

---

# Kiến trúc hệ thống

<p align="center">
  <img src="images/architecture.png" width="700">
</p>

## Luồng hoạt động

1. ESP8266 đọc dữ liệu từ cảm biến DHT11.
2. Dữ liệu được gửi qua WiFi đến Flask Server.
3. Flask xử lý và cập nhật Dashboard thời gian thực.
4. Blockchain Module tạo hash dữ liệu.
5. Hash được ghi lên Smart Contract trên Ganache.
6. Người dùng theo dõi dữ liệu qua giao diện Web Dashboard.

---

# ✨ Chức năng chính

## 📊 Dashboard giám sát tập trung

* Hiển thị dữ liệu thời gian thực.
* Theo dõi nhiệt độ và độ ẩm.
* Quan sát trạng thái các khu vực trong thành phố.
* Cập nhật dữ liệu tự động.

---

## 🗺️ Bản đồ Smart City

* Hiển thị vị trí các điểm giám sát.
* Mô phỏng khu vực cảm biến trong thành phố.
* Theo dõi dữ liệu theo từng khu vực.

---

## 📡 Thu thập dữ liệu IoT

Hệ thống sử dụng:

* ESP8266 NodeMCU
* DHT11 Sensor
* WiFi Communication

Thông tin thu thập:

* Nhiệt độ (°C)
* Độ ẩm (%)

Ví dụ:

```text
Nhiệt độ: 30.2°C
Độ ẩm: 56%
```

---

## 🔗 Blockchain Verification

Để đảm bảo dữ liệu không bị thay đổi:

* Dữ liệu được băm bằng SHA-256.
* Hash được ghi lên Blockchain Ganache.
* Có thể kiểm tra tính toàn vẹn dữ liệu bất kỳ lúc nào.

Ví dụ:

```text
Original Data
↓
SHA256
↓
Hash Value
↓
Smart Contract
↓
Blockchain Storage
```

---

# 🧰 Công nghệ sử dụng

## Backend

* Python
* Flask
* Flask-CORS

## Frontend

* HTML
* CSS
* JavaScript

## IoT

* ESP8266 NodeMCU
* DHT11 Sensor

## Blockchain

* Solidity
* Ganache
* Web3.py

## Database

* SQLite

---

# 📂 Cấu trúc thư mục

```bash
TPTM-Blockchain/
│
├── app.py
├── database.db
│
├── blockchain/
│   ├── blockchain.py
│   └── hash_data.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── css/
│   │   ├── map.css
│   │   ├── camera.css
│   │   ├── map-leaflet.css
│   │   └── camera-cctv.css
│   │
│   └── js/
│       ├── map.js
│       ├── camera.js
│       ├── map-leaflet.js
│       └── camera-cctv.js
│
└── IMPLEMENTATION_GUIDE.md
```

---

# ⚙️ Yêu cầu hệ thống

## Phần mềm

* Python 3.10+
* Ganache
* Arduino IDE

## Phần cứng

* ESP8266 NodeMCU
* DHT11
* Breadboard
* Dây Jumper
* Cáp Micro USB

---

# 🚀 Hướng dẫn cài đặt

## Clone project

```bash
git clone YOUR_REPOSITORY_URL
cd TPTM-Blockchain
```

## Tạo môi trường ảo

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

---

## Cài đặt thư viện

```bash
pip install flask
pip install flask-cors
pip install web3
```

---

## Khởi động Ganache

Mở Ganache và chạy Blockchain cục bộ:

```text
RPC Server:
http://127.0.0.1:7545
```

---

## Chạy Flask Server

```bash
python app.py
```

Mở trình duyệt:

```text
http://127.0.0.1:5000
```

---

# 📡 Kết nối ESP8266 và DHT11

## Sơ đồ kết nối

| DHT11 | ESP8266 |
| ----- | ------- |
| VCC   | 3V3     |
| GND   | G       |
| DATA  | D4      |

---

## Ví dụ dữ liệu nhận được

```text
Nhiet do: 30.20
Do am: 56.00
```

---

# 📷 Giao diện hệ thống

## Dashboard

<p align="center">
  <img src="images/dashboard.png" width="800">
</p>

Dashboard hiển thị:

* Thông tin môi trường
* Bản đồ Smart City
* Dữ liệu thời gian thực
* Trạng thái hệ thống

---

# 🎯 Kết quả đạt được

✅ Xây dựng Dashboard Smart City

✅ Kết nối ESP8266 với DHT11

✅ Thu thập dữ liệu thời gian thực

✅ Hiển thị dữ liệu trên Web

✅ Tích hợp Blockchain Ganache

✅ Lưu hash dữ liệu lên Smart Contract

✅ Mô phỏng hệ thống thành phố thông minh

---

# 🔮 Hướng phát triển

* MQTT Communication
* ESP32 hỗ trợ nhiều cảm biến
* Camera AI giám sát giao thông
* Phân tích dữ liệu bằng Machine Learning
* Blockchain Ethereum Testnet
* Mobile Application
* Hệ thống cảnh báo tự động

---

# 📚 Môn học

**Blockchain Applications**

Khoa Công nghệ Thông tin

Đại học Đại Nam

---

## 👨‍💻 Tác giả

**Nguyễn Khôi Nguyên**

Faculty of Information Technology

Dai Nam University

2026
