# 📦 Campus Cart – Campus Delivery & Support System

Campus Cart is an online ordering and delivery platform designed specifically for university campuses where services like Zomato, Swiggy, Zepto, or BlinkIt are not available.  
The system connects **students**, **vendors**, and **administration** through a centralized web platform offering:

✔ Food ordering  
✔ Grocery & stationery shopping  
✔ Inventory management  
✔ Smart cart system  
✔ Order tracking  
✔ AI-powered support & ticketing  
✔ Vendor dashboards  
✔ Admin oversight  

---

# 🚀 Features

## 🎓 Student Features
- Login / Register using JWT authentication  
- Browse stores by categories (Food, Grocery, Stationery)  
- View menus with availability & stock indicators  
- Add items to cart  
- Place orders (Cash / UPI / Card)  
- Track order status (Pending → Preparing → Ready → Delivered)  
- View order history  
- Chat with support  
- Raise complaints/tickets for issues  

---

## 🛍️ Vendor Features
- Login & vendor dashboard  
- View incoming orders  
- Update order status (Confirm → Prepare → Ready)  
- Add/Edit menu items  
- Manage stock & availability  
- Auto-generated inventory logs  
- Low-stock alerts  
- View restaurant-specific complaints  

---

## 🛠️ Admin Features
- Manage users (students/vendors/support)  
- Approve stores  
- Monitor system health  
- View support team performance  
- View escalations & complaint statistics  

---

# 🤖 Support System (AI + Human)

Campus Cart includes a **full support module** similar to Zomato/Freshdesk:

- Support ticket creation  
- Live chat  
- AI bot automated replies  
- Escalation to support agent  
- Escalation to senior support  
- Internal notes for support  
- Restaurant complaint dashboard  
- Support analytics & performance view  

---

# 🏛 System Architecture

The project is divided into **three major modules**:

### **1. Ordering System**
- Users  
- Restaurants  
- Menu Items  
- Shopping Cart  
- Orders & Order Items  
- Payments  
- Inventory Logs  

### **2. Support System**
- Tickets  
- Chat Messages  
- Escalations  
- AI bot logs  
- Restaurant complaints  
- Notes system  

### **3. Vendor Management System**
- Menu control  
- Inventory management  
- Low-stock alerts  
- Order handling  

---

# 🗄️ Database Overview

The database is built in **MySQL** with the following key tables:

### **Core Tables**
- `users`  
- `restaurants`  
- `menu_items`  
- `shopping_cart`  
- `orders`  
- `order_items`  
- `payments`  
- `inventory_logs`  

### **Support System Tables**
- `support_tickets`  
- `chat_messages`  
- `support_notes`  
- `ticket_escalations`  
- `ai_bot_logs`  
- `restaurant_complaints`  

### **Database Views**
- `active_tickets_view`  
- `restaurant_menu_view`  
- `low_stock_alert`  
- `support_performance_view`  

---

# 🔐 Security Features
- Password hashing using **bcrypt**  
- JWT-based authentication  
- Role-based access (student/vendor/admin/support)  
- Protected APIs  
- Input validation  
- Delete/Update cascades for safe data handling  

---

# ⚙️ Tech Stack

## **Frontend**
- React.js  
- HTML, CSS, JavaScript  
- Tailwind CSS  
- Lucide Icons  

## **Backend**
- Node.js  
- Express.js  
- REST APIs  
- JWT Authentication  
- bcryptjs  
- CORS  

## **Database**
- MySQL  
- MySQL Workbench  

## **Tools**
- VS Code  
- Git & GitHub  
- Postman API Testing  

---

# 🔄 Workflow Summary

### **Student Journey**
`Login → Browse Stores → View Menu → Add to Cart → Place Order → Tracking → Support`

### **Vendor Journey**
`Login → Order Dashboard → Update Status → Manage Stock → View Complaints`

### **Support Journey**
`Ticket → Chat → AI Assistance → Agent → Senior Escalation → Resolution`

---

# 🛠️ Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/campus-cart.git
cd campus-cart
npm install
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASS=gokumika
DB_NAME=campuscart1

Import sql file
campuscart1_db.sql





