import { RouterProvider } from 'react-router-dom';
import { useState } from 'react';
import { LibraryProvider } from './context/LibraryContext';
import { router } from './routes';
import { LoaderScreen } from './components/LoaderScreen';
import { DateCampaignPopup } from '@/app/components/DateCampaignPopup';

export default function App() {
  const [showLoader, setShowLoader] = useState(true);

  return (
    <LibraryProvider>
      {showLoader ? (
        <LoaderScreen onLoadComplete={() => setShowLoader(false)} />
      ) : (
        <>
          <RouterProvider router={router} />
          <DateCampaignPopup />
        </>
      )}
    </LibraryProvider>
  );
}
