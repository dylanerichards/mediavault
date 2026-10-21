/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import type { RegisterForm, User } from '../types/api';
import { register } from '../utils/AuthCalls';

interface RegisterPageProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    //TODO: Validate that the name input is not empty and is at least 2 characters long
    //set 'Name is required' in the newErrors object if the name is empty
    //set 'Name must be at least 2 characters long' in the newErrors object if 
    //the name is not at least 2 characters long

    //TODO: Validate that the email input is not empty and is a valid email address
    //set 'Email is required' in the newErrors object if the email is empty
    //set 'Please enter a valid email' in the newErrors object if the email 
    //is not a valid email address

    //TODO: Validate that the password input is not empty and is at least 6 characters long
    //set 'Password is required' in the newErrors object if the password is empty
    //set 'Password must be at least 6 characters long' in the newErrors object if 
    //the password is not at least 6 characters long

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
      const userData = await register(formData);
      setUser(userData);
      navigate('/');
    } catch (error: any) {
      setApiError(error.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {apiError && <ErrorMessage message={apiError} />}
          {/*  Implement a registration form here: name, email, password, submit button. */}
          {/*  Use the errors state to display the errors under each input */}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;