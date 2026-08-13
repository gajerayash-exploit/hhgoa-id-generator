import { useAppStore } from './store/useAppStore';
import { LandingScreen } from './components/screens/LandingScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { CustomizeScreen } from './components/screens/CustomizeScreen';
import { ExportScreen } from './components/screens/ExportScreen';

export default function App() {
  const step = useAppStore((s) => s.step);

  return (
    <>
      {step === 'landing'   && <LandingScreen />}
      {step === 'upload'    && <UploadScreen />}
      {step === 'customize' && <CustomizeScreen />}
      {step === 'export'    && <ExportScreen />}
    </>
  );
}
