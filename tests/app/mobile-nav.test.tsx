/**
 * Mobile primary navigation (#321).
 *
 * The desktop <nav> is `hidden md:flex`, so below 768px every header link
 * vanished with nothing to open them — no hamburger, no drawer. These tests
 * pin a disclosure button that exposes the same three destinations on small
 * screens and gives both navigations an accessible name.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, cleanup, within, fireEvent } from '@testing-library/react';

// Mock framer-motion components (same approach as home-page.test.tsx)
vi.mock('framer-motion', () => {
  const React = require('react');
  const createMotion = (Tag: string) => {
    return React.forwardRef((props: any, ref: any) => {
      const {
        children,
        className,
        style,
        initial,
        animate,
        transition,
        whileInView,
        whileHover,
        viewport,
        ...rest
      } = props;
      return React.createElement(Tag, { ...rest, className, style, ref }, children);
    });
  };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => createMotion(prop),
      }
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/WebGLBackgroundWrapper', () => ({
  default: () => <div data-testid="webgl-background" />,
}));

vi.mock('@/components/ui/ScrollProgressTracker', () => ({
  ScrollProgressTracker: () => <div data-testid="scroll-tracker" />,
}));

vi.mock('@/components/ui/HeroSearch', () => ({
  HeroSearch: () => <div data-testid="hero-search" />,
}));

vi.mock('@/components/mentor/MentorCard', () => ({
  MentorCard: () => <div data-testid="mentor-card" />,
}));

vi.mock('@/components/mentor/MentorJourney', () => ({
  MentorJourney: () => <div data-testid="mentor-journey" />,
}));

vi.mock('@/components/mentor/HeroDistortion', () => ({
  HeroDistortion: () => <div data-testid="hero-distortion" />,
  HeroGLTarget: () => <div data-testid="hero-gl-target" />,
  ScrollIndicator: () => <div data-testid="scroll-indicator" />,
  MentorGLTarget: () => <div data-testid="mentor-gl-target" />,
}));

import Home from '@/app/page';

const MENU_ID = 'mobile-primary-nav';
const LABELS = ['Mentors', 'How it works', 'GitHub'];

/**
 * Render the page and return helpers scoped to this render's container.
 * Scoping matters: jsdom does not apply Tailwind's `hidden md:flex`, so the
 * desktop navigation is still in the DOM and a body-wide query would match
 * both navigations.
 */
function renderPage() {
  const view = render(<Home />);
  const container = view.container;

  const menuButton = () =>
    within(container).getByRole('button', { name: /navigation menu/i });

  const mobileNav = () => {
    const nav = container.querySelector(`#${MENU_ID}`);
    expect(nav).not.toBeNull();
    return nav as HTMLElement;
  };

  return { ...view, menuButton, mobileNav };
}

function linkLabels(container: HTMLElement): (string | null)[] {
  return within(container)
    .getAllByRole('link')
    .map((link) => link.textContent);
}

describe('mobile primary navigation (#321)', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a collapsed disclosure button wired to the mobile menu', () => {
    const { menuButton, mobileNav } = renderPage();

    const button = menuButton();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(MENU_ID);
    expect(mobileNav().hasAttribute('hidden')).toBe(true);
  });

  it('reveals Mentors, How it works and GitHub when opened', () => {
    const { menuButton, mobileNav } = renderPage();

    fireEvent.click(menuButton());

    const nav = mobileNav();
    expect(nav.hasAttribute('hidden')).toBe(false);
    expect(linkLabels(nav)).toEqual(LABELS);

    const github = within(nav).getByRole('link', { name: 'GitHub' });
    expect(github.getAttribute('target')).toBe('_blank');
    expect(github.getAttribute('rel')).toContain('noopener');
  });

  it('collapses again on a second click', () => {
    const { menuButton, mobileNav } = renderPage();

    fireEvent.click(menuButton());
    const close = within(mobileNav().parentElement as HTMLElement).getByRole(
      'button',
      { name: 'Close navigation menu' },
    );
    expect(close.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(close);

    expect(mobileNav().hasAttribute('hidden')).toBe(true);
  });

  it('closes after following a destination', () => {
    const { menuButton, mobileNav } = renderPage();

    fireEvent.click(menuButton());
    fireEvent.click(within(mobileNav()).getByRole('link', { name: 'Mentors' }));

    expect(mobileNav().hasAttribute('hidden')).toBe(true);
  });

  it('gives the desktop navigation an accessible name', () => {
    const { container } = renderPage();

    const primary = within(container).getByRole('navigation', {
      name: 'Primary',
    });
    expect(linkLabels(primary)).toEqual(LABELS);
  });
});