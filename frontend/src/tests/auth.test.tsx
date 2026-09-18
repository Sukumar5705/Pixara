/**
 * src/tests/auth.test.tsx
 * Frontend authentication tests — login form validation, error display, and loading state.
 * All API calls are mocked; no live backend required.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the login API call (vi.mock paths are relative to the TEST file)
vi.mock("../api/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
  createUserByAdmin: vi.fn(),
}));

// Mock useNavigate — prevent real navigation in jsdom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

import LoginPage from "../pages/auth/LoginPage";
import { login } from "../api/auth";

const loginMock = vi.mocked(login);

const renderLogin = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage — form renders", () => {
  it("renders the login form with heading, email and password fields", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });
});

describe("LoginPage — validation", () => {
  it("shows error for invalid email format", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "not-an-email");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("shows error when password field is empty", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });
});

describe("LoginPage — API integration", () => {
  it("calls login with correct credentials on valid submit", async () => {
    loginMock.mockResolvedValueOnce({
      _id: "user123",
      name: "Admin",
      email: "admin@example.com",
      role: "admin" as const,
      token: "mock-token",
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "admin@example.com");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("admin@example.com", "password123");
    });
  });

  it("shows API error message when login fails", async () => {
    loginMock.mockRejectedValueOnce({
      response: { data: { message: "Invalid email or password" } },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "bad@example.com");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting (loading state)", async () => {
    loginMock.mockImplementationOnce(() => new Promise(() => {})); // never resolves

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "admin@example.com");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });
  });

  it("navigates to dashboard after successful login", async () => {
    loginMock.mockResolvedValueOnce({
      _id: "user123",
      name: "Admin",
      email: "admin@example.com",
      role: "admin" as const,
      token: "mock-token",
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/enter your email/i), "admin@example.com");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/app/dashboard", { replace: true });
    });
  });
});
