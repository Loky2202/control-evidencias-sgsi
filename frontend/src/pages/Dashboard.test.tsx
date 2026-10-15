import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

describe('Dashboard', () => {
  it('renders loading state', () => {
    render(<Dashboard />);
    // El componente debe mostrar algo mientras carga
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renders dashboard title', () => {
    render(<Dashboard />);
    // Verificar que el título está presente
    const title = screen.getByText(/dashboard/i);
    expect(title).toBeInTheDocument();
  });
});
