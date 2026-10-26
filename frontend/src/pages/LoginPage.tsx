/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import type { LoginForm, User } from '../types/api';
import { login } from '../utils/AuthCalls';

interface LoginPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string } | null>(null);
  const [apiError, setApiError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      const user = await login(formData);
      setUser(user);
      navigate('/');
    } catch (err: any) {
      setApiError(err.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to MediaVault
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {apiError && <ErrorMessage message={apiError} />}
          <div className="space-y-4">
            <Input
              id="emailField"
              label="Email"
              name="email"
              autoComplete="email"
              onChange={handleChange}
              error={errors?.email}
              fullWidth
            />
            <Input
              id="passwordField"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              onChange={handleChange}
              error={errors?.password}
              fullWidth
            />
          </div>
          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
