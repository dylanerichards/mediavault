import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { login } from '../utils/AuthCalls';
import type { User } from '../types/api';

vi.mock('../utils/AuthCalls', () => ({
  login: vi.fn(),
}));

const loginMock = vi.mocked(login);

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage user={null} setUser={() => {}} />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "required" errors and does not call login when submitting empty fields', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('calls login once with the typed credentials when the form is valid', async () => {
    const fakeUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      created_at: '2024-01-01T00:00:00Z',
    };
    loginMock.mockResolvedValue(fakeUser);

    const user = userEvent.setup();
    const { container } = renderPage();

    // The Input component does not associate its <label> with the <input>
    // (no htmlFor), so select the fields by their ids instead.
    const emailInput = container.querySelector('#emailField') as HTMLInputElement;
    const passwordInput = container.querySelector('#passwordField') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'secret123');

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledTimes(1);
    expect(loginMock).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    });
  });
});
