# Insta Print - Self-Service Kiosk & Web App

Insta Print is a modern, high-performance self-service printer web application featuring an animated kiosk landing screen, QR code mobile pair & login, drag-and-drop document upload with AI document classification, custom print options (Color, B&W, Custom mixed ranges, Duplex), UPI/QR payment workflow, live print hardware animation, and a 1-minute idle auto-reset safety timer.

---

## 🚀 Features

- **Pure White Modern Design**: Crisp, clean light mode interface.
- **AI Document Classifier**: Auto-detects document category, calculates page count, color vs B&W page distribution, and suggests optimal print settings.
- **Custom Print Engine**: Supports Full Color (₹6.00/pg), Black & White (₹2.00/pg), Custom Mixed Ranges, Duplex 10% discount, and paper material surcharges.
- **UPI Express Payment**: Interactive QR code with live scan simulation & festive confetti completion.
- **Hardware Sound FX**: Web Audio API synthesized mechanical stepper motor and page eject audio feedback.
- **Render Ready**: Includes `render.yaml` blueprint and `_redirects` file for instant 1-click Render static site deployment.

---

## 🛠️ Local Development Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploying on Render (Render.com)

### Option 1: Automatic Blueprint Deployment (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprints**.
3. Connect your repository: `https://github.com/Rgopi143/Instant---Print.git`.
4. Render will automatically detect `render.yaml` and configure:
   - **Environment**: Static Site
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`

### Option 2: Manual Static Site Creation
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Static Site**.
3. Select repository `https://github.com/Rgopi143/Instant---Print.git`.
4. Set settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click **Create Static Site**.
