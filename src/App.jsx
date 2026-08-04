import React, { useState } from 'react';
import KioskHeader from './components/KioskHeader';
import BackgroundFX from './components/BackgroundFX';
import LandingPage from './components/LandingPage';
import QRModal from './components/QRModal';
import AuthScreen from './components/AuthScreen';
import DocumentUploader from './components/DocumentUploader';
import DocumentPreview from './components/DocumentPreview';
import PrintConfigForm from './components/PrintConfigForm';
import PaymentScreen from './components/PaymentScreen';
import PrintAnimation from './components/PrintAnimation';
import IdleTimer from './components/IdleTimer';

export function App() {
  // Step Machine: 'landing' | 'auth' | 'upload' | 'preview' | 'config' | 'payment' | 'printing'
  const [currentStep, setCurrentStep] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [printJobDetails, setPrintJobDetails] = useState(null);

  // View Mode: false = Kiosk Display, true = Mobile Companion Screen
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Handlers
  const handleResetSession = () => {
    setCurrentStep('landing');
    setCurrentUser(null);
    setDocuments([]);
    setPrintJobDetails(null);
    setIsQRModalOpen(false);
  };

  const handleStartLanding = () => {
    if (currentUser) {
      setCurrentStep('upload');
    } else {
      setCurrentStep('auth');
    }
  };

  const handleSimulateMobilePair = (sessionId) => {
    setIsQRModalOpen(false);
    setCurrentUser({
      phone: "+91 98765 43210",
      userType: "Mobile Paired Session",
      sessionId,
    });
    setCurrentStep('upload');
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentStep('upload');
  };

  const handleGuestContinue = () => {
    setCurrentUser({ userType: "Guest User" });
    setCurrentStep('upload');
  };

  const handleDocumentsProcessed = (newDocs) => {
    setDocuments((prev) => [...prev, ...newDocs]);
    setCurrentStep('preview');
  };

  const handleRemoveDocument = (docId) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== docId);
      if (updated.length === 0) {
        setCurrentStep('upload');
      }
      return updated;
    });
  };

  const handleProceedToConfig = () => {
    setCurrentStep('config');
  };

  const handleProceedToPayment = (configPayload) => {
    setPrintJobDetails(configPayload);
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('printing');
  };

  const mainContent = (
    <main className="flex-1 relative z-10 pb-12">
      {currentStep === 'landing' && (
        <LandingPage
          onStart={handleStartLanding}
          onOpenQRModal={() => setIsQRModalOpen(true)}
        />
      )}

      {currentStep === 'auth' && (
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onGuestContinue={handleGuestContinue}
        />
      )}

      {currentStep === 'upload' && (
        <DocumentUploader onDocumentsProcessed={handleDocumentsProcessed} />
      )}

      {currentStep === 'preview' && (
        <DocumentPreview
          documents={documents}
          onRemoveDocument={handleRemoveDocument}
          onAddMore={() => setCurrentStep('upload')}
          onProceedToConfig={handleProceedToConfig}
        />
      )}

      {currentStep === 'config' && (
        <PrintConfigForm
          documents={documents}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {currentStep === 'payment' && (
        <PaymentScreen
          printJobDetails={printJobDetails}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {currentStep === 'printing' && (
        <PrintAnimation
          printJobDetails={printJobDetails}
          onFinish={handleResetSession}
        />
      )}
    </main>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative overflow-x-hidden select-none">
      
      {/* Background Animated Canvas */}
      <BackgroundFX />

      {/* Global Idle Reset Safety Timer (Active on all screens except landing) */}
      <IdleTimer
        isActive={currentStep !== 'landing'}
        onReset={handleResetSession}
      />

      {/* QR Code Mobile Pair Modal */}
      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onSimulatePair={handleSimulateMobilePair}
      />

      {/* View Container: Full Kiosk Mode vs Mobile Frame Preview */}
      {isMobileMode ? (
        <div className="flex-1 flex items-center justify-center p-4 py-8 relative z-10">
          {/* Smartphone Frame Mockup */}
          <div className="relative w-full max-w-[390px] h-[812px] bg-slate-950 border-[10px] border-slate-800 rounded-[50px] shadow-2xl overflow-hidden flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-5 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
            </div>

            <div className="flex-1 overflow-y-auto pt-6">
              {mainContent}
            </div>
          </div>
        </div>
      ) : (
        mainContent
      )}

    </div>
  );
}

export default App;
