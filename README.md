# Visitor Management System  

A **Visitor Management System (VMS)** helps workplaces ensure **security, regulatory compliance**, and **efficient visitor tracking**. This system allows **admins, employees, and security guards** to manage visitor entry with a streamlined approval process.  

## 🚀 Live Demo  
[Click here to visit the live site](https://visitormanagementsystem-em22.onrender.com/)

## 🎥 Video Demonstration  
[Click here to watch the demonstration](https://drive.google.com/file/d/1nfT4_TXsGFfdSjDORtkXUZEdHppJSC41/view?usp=sharing)

## Credentials for Login (Admin, Employee, Security)
Email: pranjal@gmail.com
Pass: pranjal

## 📌 Features  

### 🏢 **Visitor Registration**  
- Captures visitor details, including **Name, Contact, Purpose of Visit, Host Employee, Company, Check-in & Check-out Time, and Photo**.  
- Visitors can register through a **self-service kiosk** or at the security desk.  

### ✅ **Approval Workflow**  
- Visitors require **host employee approval** before entry.  
- Employees can approve/reject requests via **mobile app, web portal, or IVR system**.  
- A **QR code or printed visitor pass** is generated upon approval.  

### 📅 **Pre-Approval for Convenience**  
- Employees can **pre-approve** visitors for a specific date and time.  
- Pre-approved visitors receive a **QR code/e-pass** via **email or SMS**.  
- If a visitor does not check in within the approved time, the request **automatically expires**.  

### 🔐 **Security Benefits**  
- Restricts entry to **authorized visitors only**.  
- Keeps a **digital log** of visitor details and approval history for **audit and security tracking**.  
- Reduces **manual intervention** and enhances **operational efficiency**.  

## 🛠️ Tech Stack  

### **Frontend:**  
- HTML, CSS, JavaScript  

### **Backend:**  
- Node.js, Express.js  

### **Authentication & Security:**  
- JWT (JSON Web Token)  
- Bcrypt (for password hashing)  

### **Image Upload & Storage:**  
- ImageKit  

## 👥 User Roles  

| Role | Permissions |
|------|------------|
| **Admin** | Full system control, manage users, and set security rules. |
| **Employee** | Approve/reject visitor requests and manage personal visitor logs. |
| **Security Guard** | Register visitors, verify check-in/check-out, and monitor visitor status. |

## 📦 Installation & Setup  

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/yourusername/visitor-management-system.git
   cd visitor-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
3. **Set up environment variables:**
   Create a .env file in the root directory and add:
   ```bash
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
    IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
    IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

   ```

4. **Run the server:**
   ```bash
   npx nodemon server.js
   ```
   The backend will start at http://localhost:5000/.
