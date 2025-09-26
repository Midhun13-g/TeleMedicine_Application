import React, { createContext, useContext, useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    medicines: 'Medicines',
    reports: 'Reports',
    profile: 'Profile',
    logout: 'Logout',
    overview: 'Overview',
    symptoms: 'Symptom Checker',
    consultations: 'Consultations',
    prescriptions: 'Prescriptions',
    inventory: 'Inventory',
    addMedicine: 'Add Medicine',
    requests: 'Requests',
    users: 'Users',
    analytics: 'Analytics',

    // Authentication
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    demoAccess: 'Demo Access',
    demoPassword: '',

    // Dashboard
    welcome: 'Welcome',
    upcomingAppointments: 'Upcoming Appointments',
    recentReports: 'Recent Reports',
    bookConsultation: 'Book Consultation',
    bookAppointment: 'Book Appointment',
    checkMedicine: 'Check Medicine',
    videoAudioCall: 'Video/Audio Call',
    findPharmacy: 'Find Pharmacy',
    healthScore: 'Health Score',
    activePrescriptions: 'Active Prescriptions',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',

    // Doctor types
    modernMedicine: 'Modern Medicine',
    countryMedicine: 'Country Medicine',
    generalMedicine: 'General Medicine',

    // Medical
    symptoms: 'Symptoms',
    fever: 'Fever',
    cough: 'Cough',
    headache: 'Headache',
    bodyPain: 'Body Pain',
    nausea: 'Nausea',
    fatigue: 'Fatigue',
    otherSymptoms: 'Other symptoms',
    checkSymptoms: 'Check Symptoms',
    symptomsRecorded: 'Symptoms Recorded',
    consultDoctor: 'Based on your symptoms, we recommend consulting a doctor. Would you like to book an appointment?',

    // Appointments
    appointmentRequests: 'Appointment Requests',
    manageAppointments: 'Manage patient appointment requests',
    approve: 'Approve',
    reject: 'Reject',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    completed: 'Completed',
    startConsultation: 'Start Consultation',
    appointmentApproved: 'Appointment Approved',
    appointmentRejected: 'Appointment Rejected',
    patientNotified: 'Patient has been notified about the approved appointment.',

    // Video/Audio Calls
    videoCall: 'Video Call',
    audioCall: 'Audio Call',
    videoAudio: 'Video/Audio',
    startVideoCall: 'Start Video Call',
    startAudioCall: 'Start Audio Call',
    joinCall: 'Join Call',
    videoCallStarted: 'Video/Audio Call Started',
    connectingToPatient: 'Connecting to patient... This is a demo simulation.',
    availableForConsultations: 'Available for Consultations',
    nextConsultation: 'Next Consultation',
    videoAudioConsultations: 'Video/Audio Consultations',
    manageConsultations: 'Manage your remote consultations',
    callFeatures: 'Demo Video/Audio Call Features',
    highQualityVideoAudio: 'High-quality video and audio',
    screenSharing: 'Screen sharing for medical reports',
    callRecording: 'Recording for medical records',
    secureHipaaCompliant: 'Secure, HIPAA-compliant platform',

    // Medicines
    medicineAvailability: 'Medicine Availability',
    searchMedicine: 'Search medicine name...',
    popularMedicines: 'Popular Medicines',
    medicineAvailable: 'Medicine Available!',
    outOfStock: 'Out of Stock',
    medicineNotFound: 'Medicine Not Found',
    yourPrescriptions: 'Your Prescriptions',
    markAsTaken: 'Mark as Taken',

    // Pharmacy
    totalMedicines: 'Total Medicines',
    lowStock: 'Low Stock',
    needRestocking: 'Need restocking',
    urgentRestocking: 'Urgent restocking',
    monthlySales: 'Monthly Sales',
    addNewMedicine: 'Add New Medicine',
    updateInventory: 'Update Inventory',
    lowStockAlert: 'Low Stock Alert',
    medicineInventory: 'Medicine Inventory',
    medicineName: 'Medicine Name',
    stock: 'Stock',
    price: 'Price',
    manufacturer: 'Manufacturer',
    status: 'Status',
    actions: 'Actions',
    inStock: 'In Stock',
    stockQuantity: 'Stock Quantity',
    pricePerUnit: 'Price per Unit',
    expiryDate: 'Expiry Date',
    addToInventory: 'Add Medicine to Inventory',
    medicineRequests: 'Medicine Requests',
    patientQueries: 'Patient queries about medicine availability',
    available: 'Available',
    contactPatient: 'Contact Patient',
    suggestAlternative: 'Suggest Alternative',


    activePatients: 'Active Patients',
    activeDoctors: 'Active Doctors',
    partnerPharmacies: 'Partner Pharmacies',
    totalConsultations: 'Total Consultations',
    userManagement: 'User Management',
    manageUsers: 'Manage all platform users',
    platformGrowth: 'Platform Growth',
    revenueAnalytics: 'Revenue Analytics',
    generateReports: 'Generate Reports',
    exportData: 'Export platform data and analytics',
    userReport: 'User Report',
    analyticsReport: 'Analytics Report',
    consultationReport: 'Consultation Report',
    systemAlerts: 'System Alerts',
    systemHealth: 'System Health',

    // Common
    search: 'Search',
    filter: 'Filter',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    name: 'Name',
    location: 'Location',
    phone: 'Phone',
    date: 'Date',
    time: 'Time',
    notes: 'Notes',
    patient: 'Patient',
    doctor: 'Doctor',
    pharmacy: 'Pharmacy',

    active: 'Active',
    inactive: 'Inactive',
    emergency: 'Emergency',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemMode: 'System Mode',
  },
  ta: {
    // Navigation
    dashboard: 'டாஷ்போர்டு',
    appointments: 'சந்திப்புகள்',
    medicines: 'மருந்துகள்',
    reports: 'அறிக்கைகள்',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    overview: 'மேலோட்டம்',
    symptoms: 'அறிகுறி சரிபார்ப்பு',
    consultations: 'ஆலோசனைகள்',
    prescriptions: 'மருந்து பரிந்துரைகள்',
    inventory: 'சரக்கு',
    addMedicine: 'மருந்து சேர்க்க',
    requests: 'கோரிக்கைகள்',
    users: 'பயனர்கள்',
    analytics: 'பகுப்பாய்வு',

    // Authentication
    login: 'உள்நுழைய',
    register: 'பதிவு செய்ய',
    forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    fullName: 'முழு பெயர்',
    phoneNumber: 'தொலைபேசி எண்',
    signIn: 'உள்நுழைய',
    signingIn: 'உள்நுழைகிறது...',
    demoAccess: 'டெமோ அணுகல்',
    demoPassword: 'அனைத்து கணக்குகளுக்கும் டெமோ கடவுச்சொல்',

    // Dashboard
    welcome: 'வரவேற்கிறோம்',
    upcomingAppointments: 'வரவிருக்கும் சந்திப்புகள்',
    recentReports: 'சமீபத்திய அறிக்கைகள்',
    bookConsultation: 'ஆலோசனை பதிவு செய்யுங்கள்',
    bookAppointment: 'சந்திப்பு பதிவு செய்யுங்கள்',
    checkMedicine: 'மருந்து சரிபார்க்கவும்',
    videoAudioCall: 'வீடியோ/ஆடியோ அழைப்பு',
    findPharmacy: 'மருந்தகம் கண்டறியவும்',
    healthScore: 'உடல்நலம் மதிப்பெண்',
    activePrescriptions: 'செயலில் உள்ள பரிந்துரைகள்',
    quickActions: 'விரைவு செயல்கள்',
    recentActivity: 'சமீபத்திய செயல்பாடு',

    // Doctor types
    modernMedicine: 'நவீன மருத்துவம்',
    countryMedicine: 'நாட்டு மருத்துவம்',
    generalMedicine: 'பொது மருத்துவம்',

    // Medical
    symptoms: 'அறிகுறிகள்',
    fever: 'காய்ச்சல்',
    cough: 'இருமல்',
    headache: 'தலைவலி',
    bodyPain: 'உடல் வலி',
    nausea: 'குமட்டல்',
    fatigue: 'சோர்வு',
    otherSymptoms: 'மற்ற அறிகுறிகள்',
    checkSymptoms: 'அறிகுறிகளை சரிபார்க்கவும்',
    symptomsRecorded: 'அறிகுறிகள் பதிவு செய்யப்பட்டன',
    consultDoctor: 'உங்கள் அறிகுறிகளின் அடிப்படையில், மருத்துவரை அணுக பரிந்துரைக்கிறோம். சந்திப்பு பதிவு செய்ய விரும்புகிறீர்களா?',

    // Common
    search: 'தேடு',
    filter: 'வடிகட்டி',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    submit: 'சமர்ப்பி',
    loading: 'ஏற்றுகிறது...',
    name: 'பெயர்',
    location: 'இடம்',
    phone: 'தொலைபேசி',
    date: 'தேதி',
    time: 'நேரம்',
    notes: 'குறிப்புகள்',
    patient: 'நோயாளி',
    doctor: 'மருத்துவர்',
    pharmacy: 'மருந்தகம்',

    active: 'செயலில்',
    inactive: 'செயலில் இல்லை',
    emergency: 'அவசரம்',
    settings: 'அமைப்புகள்',
    theme: 'தீம்',
    language: 'மொழி',
    lightMode: 'ஒளி பயன்முறை',
    darkMode: 'இருள் பயன்முறை',
    systemMode: 'கணினி பயன்முறை',
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    appointments: 'अपॉइंटमेंट्स',
    medicines: 'दवाइयां',
    reports: 'रिपोर्ट्स',
    profile: 'प्रोफाइल',
    logout: 'लॉगआउट',
    overview: 'अवलोकन',
    symptoms: 'लक्षण जांचकर्ता',
    consultations: 'परामर्श',
    prescriptions: 'नुस्खे',
    inventory: 'इन्वेंटरी',
    addMedicine: 'दवा जोड़ें',
    requests: 'अनुरोध',
    users: 'उपयोगकर्ता',
    analytics: 'विश्लेषण',

    // Authentication
    login: 'लॉगिन',
    register: 'रजिस्टर',
    forgotPassword: 'पासवर्ड भूल गए',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    signIn: 'साइन इन',
    signingIn: 'साइन इन हो रहा है...',
    demoAccess: 'डेमो एक्सेस',
    demoPassword: 'सभी खातों के लिए डेमो पासवर्ड',

    // Dashboard
    welcome: 'स्वागत है',
    upcomingAppointments: 'आगामी अपॉइंटमेंट्स',
    recentReports: 'हाल की रिपोर्ट्स',
    bookConsultation: 'परामर्श बुक करें',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    checkMedicine: 'दवा जांचें',
    videoAudioCall: 'वीडियो/ऑडियो कॉल',
    findPharmacy: 'फार्मेसी खोजें',
    healthScore: 'स्वास्थ्य स्कोर',
    activePrescriptions: 'सक्रिय नुस्खे',
    quickActions: 'त्वरित कार्य',
    recentActivity: 'हाल की गतिविधि',

    // Doctor types
    modernMedicine: 'आधुनिक चिकित्सा',
    countryMedicine: 'देशी चिकित्सा',
    generalMedicine: 'सामान्य चिकित्सा',

    // Medical
    symptoms: 'लक्षण',
    fever: 'बुखार',
    cough: 'खांसी',
    headache: 'सिरदर्द',
    bodyPain: 'शरीर में दर्द',
    nausea: 'मतली',
    fatigue: 'थकान',
    otherSymptoms: 'अन्य लक्षण',
    checkSymptoms: 'लक्षण जांचें',
    symptomsRecorded: 'लक्षण दर्ज किए गए',
    consultDoctor: 'आपके लक्षणों के आधार पर, हम डॉक्टर से सलाह लेने की सिफारिश करते हैं। क्या आप अपॉइंटमेंट बुक करना चाहते हैं?',

    // Common
    search: 'खोजें',
    filter: 'फिल्टर',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    submit: 'सबमिट करें',
    loading: 'लोड हो रहा है...',
    name: 'नाम',
    location: 'स्थान',
    phone: 'फोन',
    date: 'तारीख',
    time: 'समय',
    notes: 'नोट्स',
    patient: 'मरीज़',
    doctor: 'डॉक्टर',
    pharmacy: 'फार्मेसी',

    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    emergency: 'आपातकाल',
    settings: 'सेटिंग्स',
    theme: 'थीम',
    language: 'भाषा',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    systemMode: 'सिस्टम मोड',
  },
  gu: {
    // Navigation
    dashboard: 'ડેશબોર્ડ',
    appointments: 'મુલાકાતો',
    medicines: 'દવાઓ',
    reports: 'રિપોર્ટ્સ',
    profile: 'પ્રોફાઇલ',
    logout: 'લૉગઆઉટ',
    overview: 'ઝાંખી',
    symptoms: 'લક્ષણ તપાસનાર',
    consultations: 'સલાહ',
    prescriptions: 'પ્રિસ્ક્રિપ્શન',
    inventory: 'ઇન્વેન્ટરી',
    addMedicine: 'દવા ઉમેરો',
    requests: 'વિનંતીઓ',
    users: 'વપરાશકર્તાઓ',
    analytics: 'વિશ્લેષણ',

    // Authentication
    login: 'લૉગિન',
    register: 'નોંધણી',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    confirmPassword: 'પાસવર્ડની પુષ્ટિ કરો',
    fullName: 'પૂરું નામ',
    phoneNumber: 'ફોન નંબર',
    signIn: 'સાઇન ઇન',
    signingIn: 'સાઇન ઇન થઈ રહ્યું છે...',
    demoAccess: 'ડેમો એક્સેસ',
    demoPassword: 'બધા એકાઉન્ટ્સ માટે ડેમો પાસવર્ડ',

    // Dashboard
    welcome: 'સ્વાગત છે',
    upcomingAppointments: 'આગામી મુલાકાતો',
    recentReports: 'તાજેતરની રિપોર્ટ્સ',
    bookConsultation: 'સલાહ બુક કરો',
    bookAppointment: 'મુલાકાત બુક કરો',
    checkMedicine: 'દવા તપાસો',
    videoAudioCall: 'વિડિયો/ઓડિયો કૉલ',
    findPharmacy: 'ફાર્મસી શોધો',
    healthScore: 'આરોગ્ય સ્કોર',
    activePrescriptions: 'સક્રિય પ્રિસ્ક્રિપ્શન',
    quickActions: 'ઝડપી ક્રિયાઓ',
    recentActivity: 'તાજેતરની પ્રવૃત્તિ',

    // Doctor types
    modernMedicine: 'આધુનિક દવા',
    countryMedicine: 'દેશી દવા',
    generalMedicine: 'સામાન્ય દવા',

    // Medical
    symptoms: 'લક્ષણો',
    fever: 'તાવ',
    cough: 'ઉધરસ',
    headache: 'માથાનો દુખાવો',
    bodyPain: 'શરીરનો દુખાવો',
    nausea: 'ઉબકા',
    fatigue: 'થાક',
    otherSymptoms: 'અન્ય લક્ષણો',
    checkSymptoms: 'લક્ષણો તપાસો',
    symptomsRecorded: 'લક્ષણો નોંધાયા',
    consultDoctor: 'તમારા લક્ષણોના આધારે, અમે ડૉક્ટરની સલાહ લેવાની ભલામણ કરીએ છીએ. શું તમે મુલાકાત બુક કરવા માંગો છો?',

    // Common
    search: 'શોધો',
    filter: 'ફિલ્ટર',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    submit: 'સબમિટ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    name: 'નામ',
    location: 'સ્થાન',
    phone: 'ફોન',
    date: 'તારીખ',
    time: 'સમય',
    notes: 'નોંધો',
    patient: 'દર્દી',
    doctor: 'ડૉક્ટર',
    pharmacy: 'ફાર્મસી',

    active: 'સક્રિય',
    inactive: 'નિષ્ક્રિય',
    emergency: 'કટોકટી',
    settings: 'સેટિંગ્સ',
    theme: 'થીમ',
    language: 'ભાષા',
    lightMode: 'લાઇટ મોડ',
    darkMode: 'ડાર્ક મોડ',
    systemMode: 'સિસ્ટમ મોડ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage as keyof typeof translations];
    return translation?.[key as keyof typeof translation] || key;
  };

  useEffect(() => {
    // Set document direction for RTL languages if needed
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        availableLanguages: languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};