'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import '../styles/Admin.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalAds: number;
  totalReviews: number;
  visibleAds: number;
  totalMessages: number;
  unreadMessages: number;
}

interface Ad {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  createdAt: string;
  isVisible: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    isDealer: boolean;
  };
  images: Array<{ id: string; url: string }>;
  _count: {
    savedBy: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isDealer: boolean;
  createdAt: string;
  _count: {
    ads: number;
    savedAds: number;
    reviewsReceived: number;
  };
}

const DynamicAdminMap = dynamic(() => import('../components/AdminMap'), {
  ssr: false,
  loading: () => <div className="admin-loading">Načítání mapy...</div>
});

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'listings' | 'users' | 'messages' | 'map'>('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return null;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 403) {
        setError('Nemáte oprávnění pro přístup do admin panelu');
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    [router]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [statsData, adsData, usersData, messagesData] = await Promise.all([
          apiCall('/admin/stats'),
          apiCall('/admin/ads'),
          apiCall('/admin/users'),
          apiCall('/contact/admin/submissions'),
        ]);

        if (statsData) setStats(statsData);
        if (adsData) setAds(adsData);
        if (usersData) setUsers(usersData);
        if (messagesData) setMessages(messagesData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Chyba při načítání dat');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [apiCall]);

  const markMessageAsRead = async (messageId: string) => {
    try {
      await apiCall(`/contact/admin/submissions/${messageId}/read`, { method: 'PATCH' });
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      if (stats) {
        setStats({
          ...stats,
          unreadMessages: Math.max(0, stats.unreadMessages - 1)
        });
      }
    } catch {
      alert('Chyba při označování zprávy jako přečtené');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Opravdu chcete smazat tuto zprávu?')) return;

    try {
      await apiCall(`/contact/admin/submissions/${messageId}`, { method: 'DELETE' });
      setMessages(messages.filter(msg => msg.id !== messageId));
      if (stats) {
        setStats({
          ...stats,
          totalMessages: stats.totalMessages - 1,
          unreadMessages: messages.find(m => m.id === messageId)?.status === 'pending' 
            ? stats.unreadMessages - 1 
            : stats.unreadMessages
        });
      }
    } catch {
      alert('Chyba při mazání zprávy');
    }
  };

  const unreadCount = messages.filter(msg => msg.status === 'pending').length;

  const deleteListing = async (adId: string) => {
    if (!confirm('Opravdu chcete smazat tento inzerát?')) return;

    try {
      await apiCall(`/admin/ads/${adId}`, { method: 'DELETE' });
      setAds(ads.filter(ad => ad.id !== adId));
      if (stats) {
        setStats({
          ...stats,
          totalAds: stats.totalAds - 1,
        });
      }
    } catch {
      alert('Chyba při mazání inzerátu');
    }
  };

  if (loading) return <div className="admin-loading">Načítání admin panelu...</div>;
  if (error) return <div className="admin-error">Chyba: {error}</div>;

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiky
          </button>
          <button 
            className={activeTab === 'listings' ? 'active' : ''}
            onClick={() => setActiveTab('listings')}
          >
            🚗 Inzeráty ({ads.length})
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Uživatelé ({users.length})
          </button>
          <button 
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            📧 Zprávy ({messages.length})
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          <button 
            className={activeTab === 'map' ? 'active' : ''}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Mapa inzerátů
          </button>
        </nav>
      </header>

      <main className="admin-content">
        {activeTab === 'stats' && stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Celkem uživatelů</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Celkem inzerátů</h3>
              <p className="stat-number">{stats.totalAds}</p>
            </div>
            <div className="stat-card">
              <h3>Viditelné inzeráty</h3>
              <p className="stat-number">{stats.visibleAds}</p>
            </div>
            <div className="stat-card">
              <h3>Celkem hodnocení</h3>
              <p className="stat-number">{stats.totalReviews}</p>
            </div>
            <div className="stat-card">
              <h3>Celkem zpráv</h3>
              <p className="stat-number">{stats.totalMessages || messages.length}</p>
            </div>
            <div className="stat-card">
              <h3>Nepřečtené zprávy</h3>
              <p className="stat-number">{stats.unreadMessages || unreadCount}</p>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="admin-listings">
            <h2>Všechny inzeráty</h2>
            <div className="listings-table">
              {ads.map(ad => (
                <div key={ad.id} className="listing-row">
                  <div className="listing-image">
                    <Image 
                      src={ad.images[0]?.url || '/default-car.png'} 
                      alt={ad.title}
                      width={80}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                  </div>
                  <div className="listing-info">
                    <h4>{ad.title}</h4>
                    <p>{ad.brand} {ad.model}</p>
                    <p>Cena: {ad.price.toLocaleString()} Kč</p>
                    <p>Prodejce: {ad.user.name} ({ad.user.isDealer ? 'Autobazar' : 'Soukromý'})</p>
                    <p>Vytvořeno: {new Date(ad.createdAt).toLocaleDateString('cs-CZ')}</p>
                    <p>Uloženo: {ad._count.savedBy}×</p>
                  </div>
                  <div className="listing-actions">
                    <span className={`status ${ad.isVisible ? 'visible' : 'hidden'}`}>
                      {ad.isVisible ? '👁️ Viditelný' : '🙈 Skrytý'}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteListing(ad.id)}
                    >
                      🗑️ Smazat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>Všichni uživatelé</h2>
            <div className="users-table">
              {users.map(user => (
                <div key={user.id} className="user-row">
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <p>Role: <span className={`role ${user.role.toLowerCase()}`}>{user.role}</span></p>
                    <p>Typ: {user.isDealer ? 'Autobazar' : 'Soukromý prodejce'}</p>
                    <p>Registrace: {new Date(user.createdAt).toLocaleDateString('cs-CZ')}</p>
                  </div>
                  <div className="user-stats">
                    <p>Inzeráty: {user._count.ads}</p>
                    <p>Uložené: {user._count.savedAds}</p>
                    <p>Hodnocení: {user._count.reviewsReceived}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="admin-messages">
            <h2>Kontaktní zprávy</h2>
            <div className="messages-table">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>Žádné zprávy nejsou k dispozici.</p>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`message-row ${message.status}`}>
                    <div className="message-header">
                      <div className="message-info">
                        <h4>
                          {message.name}
                          <span className={`message-status ${message.status}`}>
                            {message.status === 'pending' && '🔵 Nová'}
                            {message.status === 'read' && '👁️ Přečtená'}
                            {message.status === 'replied' && '✅ Odpovězeno'}
                          </span>
                        </h4>
                        <p className="message-email">📧 {message.email}</p>
                        <p className="message-date">
                          📅 {new Date(message.createdAt).toLocaleString('cs-CZ')}
                        </p>
                      </div>
                      <div className="message-actions">
                        {message.status === 'pending' && (
                          <button 
                            className="mark-read-btn"
                            onClick={() => markMessageAsRead(message.id)}
                          >
                            ✓ Označit jako přečtené
                          </button>
                        )}
                        <a 
                          href={`mailto:${message.email}?subject=Re: Vaše zpráva z Carta.cz&body=Dobrý den ${message.name},%0D%0A%0D%0AOdpovídám na Vaši zprávu:%0D%0A"${message.message}"%0D%0A%0D%0A`}
                          className="reply-btn"
                        >
                          📧 Odpovědět
                        </a>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteMessage(message.id)}
                        >
                          🗑️ Smazat
                        </button>
                      </div>
                    </div>
                    <div className="message-content">
                      <h5>Zpráva:</h5>
                      <p>{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="admin-map-tab">
            <DynamicAdminMap ads={ads} />
          </div>
        )}
      </main>
    </div>
  );
}