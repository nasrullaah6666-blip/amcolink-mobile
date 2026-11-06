import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AuthForm } from '../AuthForm';

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockReplace = jest.fn();
let mockToken: string | null = 'token-1';

jest.mock('expo-router', () => ({ router: { replace: (...a: unknown[]) => mockReplace(...a), push: jest.fn() } }));
jest.mock('@/api/db', () => ({ db: () => ({ auth: { signInWithPassword: mockSignIn, signUp: mockSignUp, resend: jest.fn() } }) }));
// The real check is a Cloudflare page; here it hands over a token straight away.
jest.mock('../HumanCheck', () => {
  const { useEffect } = jest.requireActual('react');
  return { HumanCheck: ({ onToken }: { onToken: (t: string | null) => void }) => { useEffect(() => { onToken(mockToken); }, []); /* eslint-disable-line react-hooks/exhaustive-deps */ return null; } };
});

beforeEach(() => { mockSignIn.mockReset(); mockSignUp.mockReset(); mockReplace.mockReset(); mockToken = 'token-1'; });

test('sign in sends the security-check token and opens the account', async () => {
  mockSignIn.mockResolvedValue({ error: null });
  await render(<AuthForm mode="signin" />);
  await fireEvent.changeText(screen.getByLabelText('Email'), '  Ali@Example.com ');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(mockSignIn).toHaveBeenCalledWith({ email: 'ali@example.com', password: 'secret123', options: { captchaToken: 'token-1' } });
  expect(mockReplace).toHaveBeenCalledWith('/account');
});

test('wrong password: friendly message, password cleared', async () => {
  mockSignIn.mockResolvedValue({ error: new Error('Invalid login credentials') });
  await render(<AuthForm mode="signin" />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'ali@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('Email or password is incorrect.')).toBeTruthy();
  expect(screen.getByLabelText('Password').props.value).toBe('');
});

test('no token yet: nothing is sent', async () => {
  mockToken = null;
  await render(<AuthForm mode="signin" />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'ali@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(mockSignIn).not.toHaveBeenCalled();
  expect(await screen.findByText(/wait a moment for the security check/)).toBeTruthy();
});

test('sign up checks password rules and terms before sending', async () => {
  await render(<AuthForm mode="signup" />);
  await fireEvent.changeText(screen.getByLabelText('Full name'), 'Ali Hassan');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'ali@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'short');
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  expect(mockSignUp).not.toHaveBeenCalled();
  expect((await screen.findAllByText(/Password needs/)).length).toBeGreaterThan(0);
});

test('sign up with good details sends name and terms date, then shows Check your email', async () => {
  mockSignUp.mockResolvedValue({ data: { session: null, user: { identities: [{}] } }, error: null });
  await render(<AuthForm mode="signup" />);
  await fireEvent.changeText(screen.getByLabelText('Full name'), 'Ali Hassan');
  await fireEvent.changeText(screen.getByLabelText('Email'), 'ali@example.com');
  await fireEvent.changeText(screen.getByLabelText('Password'), 'GoodPass2026x');
  await fireEvent.changeText(screen.getByLabelText('Confirm password'), 'GoodPass2026x');
  await fireEvent.press(screen.getByRole('checkbox'));
  await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
  const arg = mockSignUp.mock.calls[0][0];
  expect(arg.email).toBe('ali@example.com');
  expect(arg.options.captchaToken).toBe('token-1');
  expect(arg.options.data.full_name).toBe('Ali Hassan');
  expect(typeof arg.options.data.terms_accepted_at).toBe('string');
  expect(await screen.findByText('Check your email')).toBeTruthy();
});
