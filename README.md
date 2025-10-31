# 📅 Booking Calendar App
A simple booking calendar that interacts with the GXWeb API to manage bookings.
## ✅ Features
- User login and authentication
- View bookings for a chosen date
- Create, update and cancel bookings
## 🧠 Tech Stack
| Layer | Tech |
|------|------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
## 📂 Folder Structure
```
Calendar/
│── public/
│ ├── bookingScript.js
│ ├── create_booking.html
│ ├── createBooking.js
│ ├── create_booking.html
│ ├── editBooking.js
│ ├── edit_booking.html
│ ├── index.html
│ ├── login.html
│ ├── scripts.js 
│ └── styles.css
│── tests/
│ ├── bookingData.test.js
│ ├── bookings.test.js
│ ├── diaries.test.js
│ ├── login.test.js
│── index.js
│── jest.config.js
│── package.json
└── server.js 
```
## ⚙️ Installation
### 1️⃣ Clone repo
```
git clone https://github.com/ArmandleRoux98/Calendar.git
```
### Install dependencies
```
cd Calendar/
npm install
```

## 🔑 Environment Variables
Create a `.env` file and add environment variables
```
PORT=3000
HOST=http://localhost
```

## ▶️ Run the App
```
node index.js
```

Open your browser at: http://localhost:3000
