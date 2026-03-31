import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Modal from "./Modal";

describe("Modal Component", () => {
  it("renders children correctly", () => {
    render(
      <Modal onClose={() => {}}>
        <div data-testid="modal-content">Inner Content</div>
      </Modal>,
    );
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    expect(screen.getByText("Inner Content")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const handleClose = vi.fn();
    render(<Modal onClose={handleClose} />);

    // Find the close button by its class or text
    const closeBtn = screen.getByText("×");
    await userEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
