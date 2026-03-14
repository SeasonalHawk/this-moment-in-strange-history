import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingState from '@/components/LoadingState';

describe('LoadingState', () => {
  it('renders default loading text when no message prop', () => {
    render(<LoadingState />);
    expect(screen.getByText('Uncovering history...')).toBeInTheDocument();
  });

  it('renders custom message when provided', () => {
    render(<LoadingState message="Finding our history professor..." />);
    expect(screen.getByText('Finding our history professor...')).toBeInTheDocument();
    expect(screen.queryByText('Uncovering history...')).not.toBeInTheDocument();
  });

  it('renders skeleton lines', () => {
    const { container } = render(<LoadingState />);
    const skeletonLines = container.querySelectorAll('.animate-pulse');
    expect(skeletonLines.length).toBeGreaterThan(0);
  });
});
