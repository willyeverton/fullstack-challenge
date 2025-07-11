import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UserListPage from './pages/UserListPage';
import UserCreatePage from './pages/UserCreatePage';
import UserDetailPage from './pages/UserDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<UserListPage />} />
          <Route path="users/new" element={<UserCreatePage />} />
          <Route path="users/:uuid" element={<UserDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
