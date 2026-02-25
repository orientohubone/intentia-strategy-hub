import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { NotificationsDropdown } from '../NotificationsDropdown';
import { MemoryRouter } from 'react-router-dom';

// Mock do hook useNotifications
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [
      {
        id: '1',
        title: 'Notification 1',
        message: 'Message 1',
        type: 'info',
        read: false, // unread
        created_at: new Date().toISOString(),
        action_url: '/test1',
        action_text: 'Ver',
      },
      {
        id: '2',
        title: 'Notification 2',
        message: 'Message 2',
        type: 'success',
        read: true, // read
        created_at: new Date().toISOString(),
        action_url: '/test2',
        action_text: 'Ver',
      },
    ],
    unreadCount: 1,
    loading: false,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  }),
}));

describe('NotificationsDropdown Accessibility', () => {
  it('should have accessible labels', () => {
    render(
      <MemoryRouter>
        <NotificationsDropdown />
      </MemoryRouter>
    );

    // Main button should have aria-label
    // Initially this might fail or find nothing if aria-label is missing
    const mainButton = screen.getByRole('button', { name: /Notificações/i });
    expect(mainButton).toBeInTheDocument();

    // Check specific label format we plan to implement
    expect(mainButton).toHaveAttribute('aria-label', 'Notificações, 1 não lida');

    // Open dropdown
    fireEvent.click(mainButton);

    // Delete button should have aria-label
    const deleteButtons = screen.getAllByRole('button', { name: /Excluir notificação/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
