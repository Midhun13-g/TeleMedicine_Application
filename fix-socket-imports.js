const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Socket.IO imports...');

// Fix DoctorDashboard
const doctorDashboardPath = path.join(__dirname, 'project', 'src', 'components', 'dashboards', 'DoctorDashboard.tsx');
let doctorContent = fs.readFileSync(doctorDashboardPath, 'utf8');
doctorContent = doctorContent.replace(
  '// import io from \'socket.io-client\'; // Temporarily disabled - install with: npm install socket.io-client',
  'import io from \'socket.io-client\';'
);
doctorContent = doctorContent.replace(
  '    // Temporarily disabled until socket.io-client is installed\n    // const socketConnection = io(\'http://localhost:5002\');\n    const socketConnection = null;',
  '    const socketConnection = io(\'http://localhost:5002\');'
);
fs.writeFileSync(doctorDashboardPath, doctorContent);
console.log('✅ Fixed DoctorDashboard.tsx');

// Fix PatientDashboard
const patientDashboardPath = path.join(__dirname, 'project', 'src', 'components', 'dashboards', 'PatientDashboard.tsx');
let patientContent = fs.readFileSync(patientDashboardPath, 'utf8');
patientContent = patientContent.replace(
  '// import io from \'socket.io-client\'; // Temporarily disabled - install with: npm install socket.io-client',
  'import io from \'socket.io-client\';'
);
patientContent = patientContent.replace(
  '    // Temporarily disabled until socket.io-client is installed\n    // const socketConnection = io(\'http://localhost:5002\');\n    const socketConnection = null;',
  '    const socketConnection = io(\'http://localhost:5002\');'
);
fs.writeFileSync(patientDashboardPath, patientContent);
console.log('✅ Fixed PatientDashboard.tsx');

console.log('🎉 All Socket.IO imports fixed!');