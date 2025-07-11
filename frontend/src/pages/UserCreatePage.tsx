import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { CreateUserRequest } from '../types/user';
import { validateUserInput } from '../utils/validation';
import type { ApiError } from '../utils/errorHandler';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

const UserCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar novamente
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validação com Zod
    const validation = validateUserInput(formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Usa os dados validados pelo Zod
      const response = await userService.createUser(validation.data!);
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '' });
      
      // Redireciona para a página de detalhes após 2 segundos
      setTimeout(() => {
        navigate(`/users/${response.uuid}`);
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error creating user:', apiError);
      
      // Atualiza os erros de validação, se houver
      if (apiError.errors) {
        setErrors(apiError.errors);
      }
      
      // Define a mensagem de erro geral
      setSubmitError(apiError.message || 'Falha ao criar usuário. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Criar Novo Usuário</h2>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={submitting}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={submitting}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        {errors._form && <p className="error-message">{errors._form}</p>}
        {submitError && <ErrorMessage message={submitError} />}
        {submitSuccess && (
          <SuccessMessage message="Usuário criado com sucesso! Redirecionando para a página de detalhes..." />
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar Usuário'}
        </button>
      </form>
    </div>
  );
};

export default UserCreatePage; 