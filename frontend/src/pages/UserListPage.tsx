import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { User } from '../types/user';

const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Falha ao carregar a lista de usuários. Por favor, tente novamente.');
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
      
      {users.length === 0 ? (
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