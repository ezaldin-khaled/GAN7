# GAN Website

A modern, responsive website for GAN (Generative Adversarial Networks) applications with advanced user profile management and authentication features.

## 🚀 Features

- **User Authentication & Profile Management**
  - Secure login/logout system
  - User profile popup with detailed information
  - Profile score tracking and completion status
  - Media gallery management
  - Account settings and preferences

- **Modern UI/UX Design**
  - Clean, minimal interface
  - Responsive design for all devices
  - Smooth animations and transitions
  - Professional color scheme and typography

- **Advanced Components**
  - UserProfilePopup with enhanced styling
  - Search functionality with filters
  - Media upload and management
  - Real-time data synchronization

## 🛠️ Technology Stack

- **Frontend**: React.js with modern JavaScript (ES6+)
- **Styling**: CSS3 with custom animations and responsive design
- **Authentication**: JWT token-based authentication
- **API**: RESTful API integration with axios
- **State Management**: React hooks and context API

## 📁 Project Structure

```
src/
├── Components/
│   ├── Navbar/
│   │   ├── UserProfilePopup.jsx
│   │   └── UserProfilePopup.css
│   └── pages/
│       ├── admin/
│       └── useraccount/
├── assets/
└── utils/
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Khaled-ill/GAN.git
   cd GAN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://your-api-url
REACT_APP_ENVIRONMENT=development
```