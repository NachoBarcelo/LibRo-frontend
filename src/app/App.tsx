import { RouterProvider } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { router } from './routes';

export default function App() {
  return (
    <LibraryProvider>
      <RouterProvider router={router} />
    </LibraryProvider>
  );
}
