import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import enrichmentService from '../services/enrichmentService';
import type { User, EnrichedUserData } from '../types/user';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const UserDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [enrichedData, setEnrichedData] = useState<EnrichedUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrichmentError, setEnrichmentError] = useState<boolean>(false);
  const [enrichmentProcessing, setEnrichmentProcessing] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uuid) return;
      
      try {
        setLoading(true);
        // Busca os dados básicos do usuário
        const userData = await userService.getUserByUuid(uuid);
        setUser(userData);
        
        try {
          // Tenta buscar os dados enriquecidos
          const enriched = await enrichmentService.getEnrichedUserData(uuid);
          setEnrichedData(enriched);
          setEnrichmentProcessing(false);
          setEnrichmentError(false);
        } catch (enrichErr) {
          console.log('Enrichment data error:', enrichErr);
          // Se o erro for 404, significa que os dados ainda estão sendo processados
          setEnrichmentProcessing(true);
          setEnrichmentError(false);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Não foi possível carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uuid]);

  // Função para tentar buscar os dados enriquecidos novamente
  const retryEnrichment = async () => {
    if (!uuid) return;
    
    try {
      setEnrichmentProcessing(true);
      // Usa o método de atualização forçada para ignorar o cache
      const enriched = await enrichmentService.refreshEnrichedUserData(uuid);
      setEnrichedData(enriched);
      setEnrichmentProcessing(false);
      setEnrichmentError(false);
    } catch (err) {
      console.error('Error fetching enriched data:', err);
      setEnrichmentError(true);
      setEnrichmentProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Carregando dados do usuário..." />;
  }

  if (error || !user) {
    return (
      <div className="error-container">
        <ErrorMessage message={error || 'Usuário não encontrado'} />
        <button onClick={() => navigate('/')}>Voltar para lista</button>
      </div>
    );
  }

  return (
    <div className="user-detail">
      <h2>Detalhes do Usuário</h2>
      
      <div className="card">
        <div className="section">
          <h3>Informações Básicas</h3>
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>UUID:</strong> {user.uuid}</p>
        </div>
        
        <div className="section">
          <h3>Perfil Social</h3>
          
          {enrichmentProcessing ? (
            <div>
              <LoadingSpinner message="Dados ainda em processamento..." />
              <button onClick={retryEnrichment}>Verificar novamente</button>
            </div>
          ) : enrichmentError ? (
            <div>
              <ErrorMessage message="Erro ao carregar dados enriquecidos." />
              <button onClick={retryEnrichment}>Tentar novamente</button>
            </div>
          ) : enrichedData ? (
            <div>
              <p><strong>LinkedIn:</strong> <a href={`https://${enrichedData.linkedin}`} target="_blank" rel="noopener noreferrer">{enrichedData.linkedin}</a></p>
              <p><strong>GitHub:</strong> <a href={`https://${enrichedData.github}`} target="_blank" rel="noopener noreferrer">{enrichedData.github}</a></p>
            </div>
          ) : (
            <p>Nenhum dado de perfil disponível.</p>
          )}
        </div>
      </div>
      
      <button onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
        Voltar para lista
      </button>
    </div>
  );
};

export default UserDetailPage; 