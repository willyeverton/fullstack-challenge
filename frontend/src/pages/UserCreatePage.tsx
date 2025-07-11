import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { CreateUserRequest } from '../types/user';

const UserCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    let isValid = true;

    // Validação do nome
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'O nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'O email é obrigatório';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Informe um email válido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      const response = await userService.createUser(formData);
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '' });
      
      // Redireciona para a página de detalhes após 2 segundos
      setTimeout(() => {
        navigate(`/users/${response.uuid}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating user:', error);
      setSubmitError('Falha ao criar usuário. Por favor, tente novamente.');
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
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        {submitError && <p className="error-message">{submitError}</p>}
        {submitSuccess && (
          <p className="success-message">
            Usuário criado com sucesso! Redirecionando para a página de detalhes...
          </p>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar Usuário'}
        </button>
      </form>
    </div>
  );
};

export default UserCreatePage; 