import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import Button from '../components/Button';
import UserStatsChart from '../components/UserStatsChart';

function AdminPanel() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    themes: 0,
    roles: {                    
      admin: 0,
      moderator: 0,
      user: 0
    },
    total: 0,                  
    registrations_by_month: [] 
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [notification, setNotification] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    hasMorePages: false,
  });
  const [apiError, setApiError] = useState(null);

  // Provera da li je admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Učitavanje podataka
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [user, pagination.currentPage, roleFilter]);

  // Funkcija za prikaz notifikacija
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Učitavanje korisnika
  const fetchUsers = async (resetPage = false) => {
    setLoading(true);
    setApiError(null);
    
    try {
      const token = localStorage.getItem('token');
      const page = resetPage ? 1 : pagination.currentPage;
      
      let url = `http://localhost:8000/api/admin/users?per_page=${pagination.perPage}&page=${page}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (roleFilter) {
        url += `&role=${roleFilter}`;
      }
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || 'Unknown error'}`);
      }

      const data = await res.json();
      
      setUsers(data.users || []);
      
      
      setPagination({
        currentPage: data.meta?.current_page || 1,
        perPage: data.meta?.per_page || 10,
        total: data.meta?.total || 0,
        lastPage: data.meta?.last_page || 1,
        hasMorePages: data.meta?.has_more_pages || false,
      });
      
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
      setApiError(`Greška: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Učitavanje statistika
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.success && data.stats) {
          setStats({
            users: data.stats.users || 0,
            posts: data.stats.posts || 0,
            themes: data.stats.themes || 0,
            roles: data.stats.roles || {
              admin: 0,
              moderator: 0,
              user: 0
            },
            total: data.stats.total || 0,
            registrations_by_month: data.stats.registrations_by_month || []
          });
        }
      }
      
    } catch (error) {
      console.error('Greška pri učitavanju statistike:', error);
    }
  };

  // Promena statusa objavljivanja
  const handleTogglePublish = async (userId, currentStatus) => {
    if (!window.confirm(`Da li želite da ${currentStatus ? 'zabranite' : 'dozvolite'} objavljivanje ovom korisniku?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/toggle-publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Greška pri ažuriranju statusa');
      }

      const data = await res.json();
      
      // Ažuriraj lokalno stanje
      setUsers(users.map(u => 
        u.id === userId ? { ...u, can_publish: data.user.can_publish } : u
      ));
      
      showNotification(`Status objavljivanja ${!currentStatus ? 'dozvoljen' : 'zabranjen'}!`, 'success');
      
    } catch (error) {
      console.error('Greška:', error);
      showNotification('Došlo je do greške: ' + error.message, 'error');
    }
  };

  // Promena uloge korisnika
  const handleRoleChange = async (userId, currentRole, newRole) => {
    if (!window.confirm(`Da li želite da promenite ulogu korisnika iz "${currentRole}" u "${newRole}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Greška pri ažuriranju uloge');
      }

      const data = await res.json();
      
      // Ažuriraj lokalno stanje
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      showNotification(`Uloga promenjena u ${newRole}!`, 'success');
      
    } catch (error) {
      console.error('Greška:', error);
      showNotification('Došlo je do greške: ' + error.message, 'error');
    }
  };

  // Formatiranje datuma
  /*const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };*/

  // Pretraga
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(true);
  };

  // Brisanje pretrage
  /*const handleClearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
    fetchUsers(true);
  };*/

  // Promena stranice
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={styles.accessDenied}>
        <h2>🚫 Pristup odbijen</h2>
        <p>Samo administratori mogu pristupiti ovom panelu.</p>
        <Button onClick={() => navigate('/')}>Vrati se na početnu</Button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* NOTIFIKACIJE */}
      {notification && (
        <div style={{
          ...styles.notification,
          background: notification.type === 'success' ? '#4caf50' : '#f44336',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>👑 Admin Panel 👑</h1>
          <p style={styles.subtitle}>
            <strong style={{ color: '#f5d14c' }}>{user.name}</strong>
            <span style={{ marginLeft: '10px', background: '#f5d14c', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
              {user.role.toUpperCase()}
            </span>
          </p>
          {apiError && (
            <div style={styles.warningBox}>
              ⚠️ {apiError}
            </div>
          )}
        </div>
        <div style={styles.headerActions}>
          <Button onClick={() => navigate('/')} style={{ marginRight: '10px' }}>
            ← Nazad na forum
          </Button>
          {/*<Button onClick={() => { fetchUsers(true); fetchStats(); }}>
            🔄 Osveži
          </Button>*/}
        </div>
      </div>

      {/* STATISTIKE */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>{stats.users}</h3>
            <p style={styles.statLabel}>Broj Korisnika</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📝</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>{stats.posts}</h3>
            <p style={styles.statLabel}>Broj Objava</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏷️</div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>{stats.themes}</h3>
            <p style={styles.statLabel}>Broj Tema</p>
          </div>
        </div>
      </div>

      {/* TAB NAVIGACIJA */}
      <div style={styles.tabNav}>
        <button
          onClick={() => setActiveTab('users')}
          style={activeTab === 'users' ? styles.activeTab : styles.tab}
        >
          👥 Korisnici
        </button>
        <button
          onClick={() => setActiveTab('content')}
          style={activeTab === 'content' ? styles.activeTab : styles.tab}
        >
          📝 Sadržaj
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          style={activeTab === 'statistics' ? styles.activeTab : styles.tab}
        >
          📊 Statistika
        </button>
      </div>

      {/* TAB SADRŽAJ */}
      <div style={styles.tabContent}>
        {loading && activeTab === 'users' ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Učitavam podatke...</p>
          </div>
        ) : (
          <>
            {/* KORISNICI */}
            {activeTab === 'users' && (
              <div style={styles.usersTab}>
                <div style={styles.sectionHeader}>
                  <h2>👥 Upravljanje korisnicima</h2>
                  <div style={styles.filtersContainer}>
                    <form onSubmit={handleSearch} style={styles.searchForm}>
                      <input 
                        type="text" 
                        placeholder="Pretraži po imenu ili emailu..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                      />
                      <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={styles.filterSelect}
                      >
                        <option value="">Sve uloge</option>
                        <option value="user">Korisnik</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button type="submit">🔍 Pretraži</Button>
                      {/*{(searchTerm || roleFilter) && (
                        <Button type="button" onClick={handleClearSearch} variant="outline">
                          ❌ Očisti
                        </Button>
                      )*/}
                    </form>
                  </div>
                </div>
                
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ime</th>
                        <th>Email</th>
                        <th>Uloga</th>
                        <th>Dozvola objavljivanja</th>
                        {/*<th>Registrovano</th>*/}
                        {/*<th>Objave</th>*/}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={styles.noData}>
                            {searchTerm || roleFilter ? 'Nema rezultata za vašu pretragu' : 'Nema korisnika u bazi'}
                          </td>
                        </tr>
                      ) : (
                        users.map((userItem) => (
                          <tr key={userItem.id}>
                            <td>{userItem.id}</td>
                            <td>
                              <strong>{userItem.name}</strong>
                              {userItem.id === user.id && (
                                <span style={styles.currentUserBadge}> (Vi)</span>
                              )}
                            </td>
                            <td>{userItem.email}</td>
                            <td>
                              <select
                                value={userItem.role}
                                onChange={(e) => handleRoleChange(userItem.id, userItem.role, e.target.value)}
                                disabled={userItem.id === user.id}
                                style={styles.roleSelect}
                              >
                                <option value="user">Korisnik</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td>
                              <button
                                onClick={() => handleTogglePublish(userItem.id, userItem.can_publish)}
                                style={userItem.can_publish ? styles.toggleBtn.active : styles.toggleBtn.inactive}
                                disabled={userItem.id === user.id}
                              >
                                {userItem.can_publish ? '✅ Dozvoljeno' : '❌ Zabranjeno'}
                              </button>
                            </td>
                            {/*<td>
                              {formatDate(userItem.created_at)}
                            </td>*/}
                            {/*<td>
                              {userItem.posts_count || 0}
                            </td>*/}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIJA */}
                {pagination.total > 0 && (
                  <div style={styles.pagination}>
                    <Button 
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      variant="outline"
                    >
                      ← Prethodna
                    </Button>
                    
                    <span style={styles.pageInfo}>
                      Strana {pagination.currentPage} od {pagination.lastPage}
                    </span>
                    
                    <Button 
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasMorePages}
                      variant="outline"
                    >
                      Sledeća →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* SADRŽAJ */}
            {activeTab === 'content' && (
              <div style={styles.contentTab}>
                <h2>📝 Upravljanje sadržajem</h2>
                <div style={styles.contentGrid}>
                  <div style={styles.contentCard}>
                    <h3>🏷️ Teme</h3>
                    <p>Kreiraj, izmeni ili obriši teme foruma</p>
                    <Button onClick={() => alert('Funkcionalnost u izradi')}>
                      Upravljaj temama
                    </Button>
                  </div>
                  
                  <div style={styles.contentCard}>
                    <h3>📄 Objave</h3>
                    <p>Moderiši, pinuj ili obriši objave</p>
                    <Button onClick={() => alert('Funkcionalnost u izradi')}>
                      Moderiraj objave
                    </Button>
                  </div>
                  
                  <div style={styles.contentCard}>
                    <h3>💬 Komentari</h3>
                    <p>Pregledaj i upravljaj komentarima</p>
                    <Button onClick={() => alert('Funkcionalnost u izradi')}>
                      Upravljaj komentarima
                    </Button>
                  </div>
                </div>
                
              </div>
            )}
            {activeTab === 'statistics' && (
              <div style={styles.statisticsTab}>
                <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>📊 Statistika foruma</h2>
                <UserStatsChart stats={stats} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// STILOVI
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    zIndex: 9999,
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '25px',
    background: 'linear-gradient(135deg, #394199 0%, #8c97ed 100%)',
    borderRadius: '16px',
    color: 'white',
    flexWrap: 'wrap',
    gap: '20px',
  },
  
  headerContent: {
    flex: 1,
  },
  
  title: {
    fontSize: '2.2rem',
    margin: '0 0 10px 0',
    color: 'white',
  },
  
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
  },
  
  warningBox: {
    background: 'rgba(255, 193, 7, 0.2)',
    border: '1px solid #ffb300',
    borderRadius: '8px',
    padding: '10px 15px',
    marginTop: '10px',
    fontSize: '0.9rem',
  },
  
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
  },
  
  statIcon: {
    fontSize: '2.5rem',
    opacity: 0.8,
  },
  
  statInfo: {
    flex: 1,
  },
  
  statNumber: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#1a237e',
    margin: '0',
  },
  
  statLabel: {
    color: '#666',
    fontSize: '0.9rem',
    margin: '5px 0 0 0',
  },
  
  tabNav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  
  tab: {
    padding: '12px 30px',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  
  activeTab: {
    padding: '12px 30px',
    background: '#1a237e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
  },
  
  tabContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    minHeight: '400px',
    border: '1px solid #e0e0e0',
  },
  
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a237e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  
  usersTab: {},
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  
  filtersContainer: {
    flex: 1,
    maxWidth: '800px',
  },
  
  searchForm: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  searchInput: {
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    flex: 2,
    minWidth: '200px',
    fontSize: '1rem',
  },
  
  filterSelect: {
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    minWidth: '150px',
  },
  
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '20px',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem',
  },
  
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontStyle: 'italic',
  },
  
  currentUserBadge: {
    color: '#1a237e',
    fontWeight: '600',
    fontSize: '0.85rem',
    marginLeft: '5px',
  },
  
  roleSelect: {
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  
  toggleBtn: {
    active: {
      background: '#e8f5e9',
      color: '#2e7d32',
      border: '1px solid #4caf50',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    inactive: {
      background: '#ffebee',
      color: '#c62828',
      border: '1px solid #f44336',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
  },
  
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  
  pageInfo: {
    color: '#666',
    fontSize: '0.9rem',
  },
  
  contentTab: {},
  
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  
  contentCard: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  
  contentInfo: {
    marginTop: '30px',
    padding: '15px',
    background: '#e8f5e9',
    borderRadius: '8px',
    border: '1px solid #c8e6c9',
    fontSize: '0.9rem',
    color: '#2e7d32',
  },
  
  accessDenied: {
    textAlign: 'center',
    padding: '60px 20px',
  },

  statisticsTab: {
      padding: '20px 0',
    },
    
    tabNav: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      flexWrap: 'wrap', 
    },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  table th {
    background: #f8f9fa;
    padding: 15px;
    text-align: left;
    border-bottom: 2px solid #ddd;
    font-weight: 600;
    color: #333;
  }
  
  table td {
    padding: 15px;
    border-bottom: 1px solid #eee;
  }
  
  table tr:hover {
    background: #f5f5f5;
  }
  
  select:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
document.head.appendChild(styleSheet);

export default AdminPanel;