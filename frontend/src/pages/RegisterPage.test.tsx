import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { register } from '../utils/AuthCalls';

vi.mock('../utils/AuthCalls', () => ({
  register: vi.fn(),
}));

const registerMock = vi.mocked(register);

const renderPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage user={null} setUser={() => {}} />
    </MemoryRouter>
  );

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "required" errors and does not call register when submitting empty fields', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('shows validation messages for an invalid email and short password', async () => {
    const user = userEvent.setup();
    const { container } = renderPage();

    // The Input component does not associate its <label> with the <input>
    // (no htmlFor), so select the fields by their ids instead.
    const nameInput = container.querySelector('#nameField') as HTMLInputElement;
    const emailInput = container.querySelector('#emailField') as HTMLInputElement;
    const passwordInput = container.querySelector('#passwordField') as HTMLInputElement;

    await user.type(nameInput, 'Jo');
    await user.type(emailInput, 'not-an-email');
    await user.type(passwordInput, '123');

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    expect(
      screen.getByText('Password must be at least 6 characters long')
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });
});
