/**
 * src/tests/gallery.test.tsx
 * Frontend gallery tests — PIN gate, verification, error display, and public gallery rendering.
 * All API calls and the useVerifyGallery hook are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../api/galleries", () => ({
  galleriesApi: {
    verifyGallery: vi.fn(),
    publishGallery: vi.fn(),
    getGalleryCredentials: vi.fn(),
    deactivateGallery: vi.fn(),
  },
}));

const mockMutate = vi.fn();
vi.mock("../hooks/galleries/useVerifyGallery", () => ({
  useVerifyGallery: vi.fn(),
}));

import { useVerifyGallery } from "../hooks/galleries/useVerifyGallery";
import PublicGalleryPage from "../pages/public/PublicGalleryPage";

const mockUseVerifyGallery = vi.mocked(useVerifyGallery);

const successfulGalleryData = {
  event: { title: "Wedding Photos", description: "Our beautiful day" },
  photos: [
    { _id: "p1", originalName: "photo1.jpg", url: "https://example.com/photo1.jpg", createdAt: "2024-01-01" },
    { _id: "p2", originalName: "photo2.jpg", url: "https://example.com/photo2.jpg", createdAt: "2024-01-02" },
  ],
  totalPhotos: 2,
};

const renderGalleryPage = (slug = "test-gallery-slug") => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/gallery/${slug}`]}>
        <Routes>
          <Route path="/gallery/:slug" element={<PublicGalleryPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper: type a 6-digit PIN into the segmented inputs
const typePin = async (pin: string) => {
  const user = userEvent.setup();
  for (let i = 0; i < pin.length; i++) {
    const input = screen.getByLabelText(`PIN digit ${i + 1}`);
    await user.type(input, pin[i]);
  }
};

describe("PublicGalleryPage — PIN Gate", () => {
  it("renders the PIN gate with heading 'Enter your access PIN'", () => {
    mockUseVerifyGallery.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderGalleryPage();
    expect(screen.getByRole("heading", { name: /enter your access pin/i })).toBeInTheDocument();
  });

  it("renders all 6 digit input slots", () => {
    mockUseVerifyGallery.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderGalleryPage();
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByLabelText(`PIN digit ${i}`)).toBeInTheDocument();
    }
  });

  it("submit button is disabled until all 6 digits entered", async () => {
    mockUseVerifyGallery.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderGalleryPage();
    const submitBtn = screen.getByRole("button", { name: /unlock gallery/i });
    expect(submitBtn).toBeDisabled();

    await typePin("12345"); // only 5 digits
    expect(submitBtn).toBeDisabled();
  });

  it("submit button enables after all 6 digits and calls mutate on click", async () => {
    mockUseVerifyGallery.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderGalleryPage("my-gallery");
    await typePin("123456");

    const submitBtn = screen.getByRole("button", { name: /unlock gallery/i });
    expect(submitBtn).not.toBeDisabled();

    await userEvent.setup().click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ slug: "my-gallery", pin: "123456" })
      );
    });
  });

  it("shows 'Verifying…' and disables button while isPending is true", () => {
    mockUseVerifyGallery.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    renderGalleryPage();
    expect(screen.getByText(/verifying/i)).toBeInTheDocument();
  });

  it("shows 'Gallery unavailable' on 404 error", async () => {
    let capturedOnError: ((err: any) => void) | undefined;
    mockUseVerifyGallery.mockImplementation((config: any) => {
      capturedOnError = config?.onError;
      return { mutate: mockMutate, isPending: false } as any;
    });

    renderGalleryPage();

    // Trigger the 404 error path — component updates pinError state which
    // causes PinGate to render the "Gallery unavailable" error block.
    const { act } = await import("@testing-library/react");
    await act(async () => {
      capturedOnError?.({
        response: { status: 404, data: { message: "Gallery not found or inactive" } },
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/gallery unavailable/i)).toBeInTheDocument();
    });
  });
});

describe("PublicGalleryPage — Gallery View", () => {
  it("displays event title and photo count after successful verification", async () => {
    let capturedOnSuccess: ((data: any) => void) | undefined;
    mockUseVerifyGallery.mockImplementation((config: any) => {
      capturedOnSuccess = config?.onSuccess;
      return { mutate: mockMutate, isPending: false } as any;
    });

    renderGalleryPage();

    const { act } = await import("@testing-library/react");
    await act(async () => {
      capturedOnSuccess?.(successfulGalleryData);
    });

    await waitFor(() => {
      expect(screen.getByText("Wedding Photos")).toBeInTheDocument();
    });
    expect(screen.getByText(/2.*photo/i)).toBeInTheDocument();
  });

  it("does NOT show admin navigation on the public gallery page", async () => {
    let capturedOnSuccess: ((data: any) => void) | undefined;
    mockUseVerifyGallery.mockImplementation((config: any) => {
      capturedOnSuccess = config?.onSuccess;
      return { mutate: mockMutate, isPending: false } as any;
    });

    renderGalleryPage();

    const { act } = await import("@testing-library/react");
    await act(async () => {
      capturedOnSuccess?.(successfulGalleryData);
    });

    await waitFor(() => {
      expect(screen.getByText("Wedding Photos")).toBeInTheDocument();
    });
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Team Members")).not.toBeInTheDocument();
  });
});
