import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';

import App from '../../App';
import HomePage from '../../pages/HomePage';
import RepoDetailPage from '../../pages/RepoDetailPage';
import BestPracticesPage from '../../pages/BestPracticesPage';

expect.extend(toHaveNoViolations);

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <MantineProvider>
        {component}
      </MantineProvider>
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  it('HomePage should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('RepoDetailPage should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<RepoDetailPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('BestPracticesPage should have no accessibility violations', async () => {
    const { container } = renderWithProviders(<BestPracticesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Keyboard Navigation', () => {
    it('should be able to navigate through all interactive elements', () => {
      renderWithProviders(<App />);
      const interactiveElements = screen.getAllByRole('button');
      
      interactiveElements.forEach(element => {
        element.focus();
        expect(document.activeElement).toBe(element);
      });
    });

    it('should have proper tab order', () => {
      renderWithProviders(<App />);
      const tabOrder = [];
      const elements = document.querySelectorAll('button, a, input, select, textarea, [tabindex="0"]');
      
      elements.forEach(element => {
        tabOrder.push(element);
      });

      expect(tabOrder).toEqual([...tabOrder].sort((a, b) => {
        const aTab = a.getAttribute('tabindex') || '0';
        const bTab = b.getAttribute('tabindex') || '0';
        return parseInt(aTab) - parseInt(bTab);
      }));
    });
  });

  describe('ARIA Labels', () => {
    it('should have proper ARIA labels on interactive elements', () => {
      renderWithProviders(<App />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<App />);
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]));
      
      headingLevels.forEach((level, index) => {
        if (index > 0) {
          expect(level - headingLevels[index - 1]).toBeLessThanOrEqual(1);
        }
      });
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = renderWithProviders(<App />);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have alt text for all images', () => {
      renderWithProviders(<App />);
      const images = screen.getAllByRole('img');
      
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have proper ARIA landmarks', () => {
      renderWithProviders(<App />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
