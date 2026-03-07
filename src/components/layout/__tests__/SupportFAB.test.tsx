import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SupportFAB from "../SupportFAB";

describe("SupportFAB Component", () => {
  it("should render the FAB button initially", () => {
    render(<SupportFAB />);
    
    const fabButton = screen.getByLabelText("Abrir suporte");
    expect(fabButton).toBeInTheDocument();
    
    // Popover should not be visible initially
    expect(screen.queryByText("Precisa de ajuda?")).not.toBeInTheDocument();
  });

  it("should open the popover when clicked", () => {
    render(<SupportFAB />);
    
    const fabButton = screen.getByLabelText("Abrir suporte");
    fireEvent.click(fabButton);
    
    expect(screen.getByText("Precisa de ajuda?")).toBeInTheDocument();
    expect(screen.getByText("Abrir Chamado")).toBeInTheDocument();
    expect(screen.getByText("Base de Conhecimento")).toBeInTheDocument();
  });

  it("should close the popover when clicked again", () => {
    render(<SupportFAB />);
    
    const fabButton = screen.getByLabelText("Abrir suporte");
    
    // Open
    fireEvent.click(fabButton);
    expect(screen.getByText("Precisa de ajuda?")).toBeInTheDocument();
    
    // Close
    fireEvent.click(fabButton);
    expect(screen.queryByText("Precisa de ajuda?")).not.toBeInTheDocument();
  });
});
