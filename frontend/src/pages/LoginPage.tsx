/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    //TODO: Validate that the email input is not empty and is a valid email address
    //set 'Email is required' in the newErrors object if the email is empty
    //set 'Please enter a valid email' in the newErrors object if the email 
    //is not a valid email address


    //TODO: Validate that the password input is not empty and is at least 6 characters long
    //set 'Password is required' in the newErrors object if the password is empty
    //set 'Password must be at least 6 characters long' in the newErrors object
    // if the password is not at least 6 characters long

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors(null);

    if (!validateForm()) {
      return;
    }

    try {
      const userData = await login(formData);
      setUser(userData);
      navigate('/books');
    } catch (error: any) {
      setApiError(error.error || 'Login failed. Please try again.');
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to BookVault
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

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {apiError && <ErrorMessage message={apiError} />}
          <div className="space-y-4">
            {/*  Implement a login form here: email, password, submit button. */}
            {/*  Use the errors state to display the errors under each input */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;