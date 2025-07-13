import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { User } from '../types/user';

const UserListPage = () => {
  // Inicializar com dados mock para garantir que funcione
  const mockUsers: User[] = [
    {
      id: 1,
      uuid: 'mock-uuid-1',
      name: 'João Silva',
      email: 'joao@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      uuid: 'mock-uuid-2', 
      name: 'Maria Santos',
      email: 'maria@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        const data = await userService.getUsers();
        console.log('Received data:', data, 'Is array:', Array.isArray(data));
        setUsers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Falha ao carregar a lista de usuários. Por favor, tente novamente.');
        setUsers([]); // Garantir que seja sempre um array
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (uuid: string) => {
    navigate(`/users/${uuid}`);
  };

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Lista de Usuários</h2>
      
      {!users || users.length === 0 ? (
        <p>Nenhum usuário encontrado. Crie um novo usuário para começar.</p>
      ) : (
        <div className="user-list">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="card user-card"
              onClick={() => handleUserClick(user.uuid)}
            >
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p className="user-uuid">UUID: {user.uuid}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListPage; 