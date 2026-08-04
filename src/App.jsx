import React, { useState, useEffect } from 'react';
import BackgroundFX from './components/BackgroundFX';
import LandingPage from './components/LandingPage';
import QRModal from './components/QRModal';
import AuthScreen from './components/AuthScreen';
import DocumentUploader from './components/DocumentUploader';
import DocumentPreview from './components/DocumentPreview';
import PrintConfigForm from './components/PrintConfigForm';
import PaymentScreen from './components/PaymentScreen';
import PrintAnimation from './components/PrintAnimation';
import AdminDashboard from './components/AdminDashboard';
import IdleTimer from './components/IdleTimer';

export function App() {
  // Step Machine: 'landing' | 'auth' | 'admin' | 'upload' | 'preview' | 'config' | 'payment' | 'printing'
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = sessionStorage.getItem('instant_print_step');
    return savedStep === 'admin' ? 'landing' : (savedStep || 'landing');
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('instant_print_user');
      const parsedUser = saved ? JSON.parse(saved) : null;
      return parsedUser?.isAdmin ? null : parsedUser;
    } catch {
      return null;
    }
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = sessionStorage.getItem('instant_print_docs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [printJobDetails, setPrintJobDetails] = useState(() => {
    try {
      const saved = sessionStorage.getItem('instant_print_job');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save state updates to sessionStorage (Persist Customer sessions ONLY, Exclude Admin for Security)
  useEffect(() => {
    if (currentStep === 'admin') {
      sessionStorage.removeItem('instant_print_step');
    } else {
      sessionStorage.setItem('instant_print_step', currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      sessionStorage.setItem('instant_print_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('instant_print_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (documents && documents.length > 0) {
      const cleanDocs = documents.map(({ rawFile, ...rest }) => rest);
      sessionStorage.setItem('instant_print_docs', JSON.stringify(cleanDocs));
    } else {
      sessionStorage.removeItem('instant_print_docs');
    }
  }, [documents]);

  useEffect(() => {
    if (printJobDetails) {
      sessionStorage.setItem('instant_print_job', JSON.stringify(printJobDetails));
    } else {
      sessionStorage.removeItem('instant_print_job');
    }
  }, [printJobDetails]);

  // View Mode: false = Kiosk Display, true = Mobile Companion Screen
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Handlers
  const handleResetSession = () => {
    sessionStorage.removeItem('instant_print_step');
    sessionStorage.removeItem('instant_print_user');
    sessionStorage.removeItem('instant_print_docs');
    sessionStorage.removeItem('instant_print_job');
    setCurrentStep('landing');
    setCurrentUser(null);
    setDocuments([]);
    setPrintJobDetails(null);
    setIsQRModalOpen(false);
  };

  const handleStartLanding = () => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        setCurrentStep('admin');
      } else {
        setCurrentStep('upload');
      }
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
    if (userData.isAdmin) {
      setCurrentStep('admin');
    } else {
      setCurrentStep('upload');
    }
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

      {currentStep === 'admin' && (
        <AdminDashboard
          user={currentUser}
          onExit={handleResetSession}
          onProceedUpload={() => setCurrentStep('upload')}
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
