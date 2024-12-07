import { createBrowserRouter } from 'react-router-dom';
import ProductList from '../pages/Products/ProductList';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProductList />,
  },
  {
    path: '/products',
    element: <ProductList />,
  },
]);
