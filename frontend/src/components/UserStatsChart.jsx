import React, { useEffect } from 'react';

const UserStatsChart = ({ stats }) => {
  useEffect(() => {
    // Provera da li su podaci stigli
    if (!stats || !stats.roles) return;

    // Učitavanje Google Charts-a
    if (window.google && window.google.charts) {
      window.google.charts.load('current', { packages: ['corechart'] });
      window.google.charts.setOnLoadCallback(drawCharts);
    } else {
      // Ako Google Charts još nije učitan, sačekaj
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.charts) {
          clearInterval(checkGoogle);
          window.google.charts.load('current', { packages: ['corechart'] });
          window.google.charts.setOnLoadCallback(drawCharts);
        }
      }, 100);
    }

    function drawCharts() {
      drawPieChart();
      if (stats.registrations_by_month && stats.registrations_by_month.length > 0) {
        drawBarChart();
      }
    }

    function drawPieChart() {
      var data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Uloga');
      data.addColumn('number', 'Broj korisnika');
      data.addRows([
        ['Administratori', stats.roles.admin || 0],
        ['Moderatori', stats.roles.moderator || 0],
        ['Korisnici', stats.roles.user || 0]
      ]);

      var options = {
        title: 'Raspodela korisnika po ulogama',
        pieHole: 0.4,
        colors: ['#ff4444', '#ffbb33', '#00C851'],
        fontSize: 12,
        titleTextStyle: { fontSize: 16, bold: true },
        legend: { position: 'bottom', alignment: 'center' },
        chartArea: { width: '90%', height: '70%' }
      };

      var chart = new window.google.visualization.PieChart(document.getElementById('piechart'));
      chart.draw(data, options);
    }

    function drawBarChart() {
      var data = new window.google.visualization.DataTable();
      data.addColumn('string', 'Mesec');
      data.addColumn('number', 'Broj registracija');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
      stats.registrations_by_month.forEach(item => {
        data.addRow([months[item.month - 1], item.count]);
      });

      var options = {
        title: 'Registracije po mesecima',
        colors: ['#1a237e'],
        fontSize: 12,
        titleTextStyle: { fontSize: 16, bold: true },
        legend: { position: 'none' },
        hAxis: { 
          title: 'Mesec',
          slantedText: true,
          slantedTextAngle: 45
        },
        vAxis: { 
          title: 'Broj registracija',
          minValue: 0,
          format: '0'
        },
        chartArea: { width: '80%', height: '70%' }
      };

      var chart = new window.google.visualization.ColumnChart(document.getElementById('barchart'));
      chart.draw(data, options);
    }

    // Cleanup na unmount
    return () => {
      const pieElement = document.getElementById('piechart');
      const barElement = document.getElementById('barchart');
      if (pieElement) pieElement.innerHTML = '';
      if (barElement) barElement.innerHTML = '';
    };
  }, [stats]);

  if (!stats || !stats.roles) {
    return (
      <div style={styles.noData}>
        <p>Nema podataka za prikaz</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Prvi red - Pita grafikon i tabela */}
      <div style={styles.row}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🥧 Raspodela po ulogama</h3>
          <div id="piechart" style={styles.chart}></div>
        </div>

        <div style={styles.tableCard}>
          <h3 style={styles.chartTitle}>📊 Detaljna statistika</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Uloga</th>
                <th>Broj</th>
                <th>Procenat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>👑 Administrator</td>
                <td>{stats.roles.admin}</td>
                <td>{((stats.roles.admin / stats.total) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>🛡️ Moderator</td>
                <td>{stats.roles.moderator}</td>
                <td>{((stats.roles.moderator / stats.total) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>👤 Korisnik</td>
                <td>{stats.roles.user}</td>
                <td>{((stats.roles.user / stats.total) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td><strong>UKUPNO</strong></td>
                <td><strong>{stats.total}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Drugi red - Bar grafikon (ako ima podataka) */}
      {/*{stats.registrations_by_month && stats.registrations_by_month.length > 0 && (
        <div style={styles.row}>
          <div style={styles.fullWidthCard}>
            <h3 style={styles.chartTitle}>📈 Registracije po mesecima</h3>
            <div id="barchart" style={styles.chart}></div>
          </div>
        </div>
      )}*/}

      {/* Info box */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          <span style={styles.infoIcon}>ℹ️</span>
          Podaci se ažuriraju u realnom vremenu. Statistika prikazuje trenutno stanje na forumu.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
  },
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
  },
  fullWidthCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    gridColumn: '1 / -1',
  },
  chartTitle: {
    margin: '0 0 15px 0',
    color: '#1a237e',
    fontSize: '1.1rem',
  },
  chart: {
    width: '100%',
    height: '300px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.95rem',
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontStyle: 'italic',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  infoBox: {
    marginTop: '10px',
    padding: '15px',
    background: '#e3f2fd',
    borderRadius: '8px',
    border: '1px solid #bbdefb',
  },
  infoText: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#0d47a1',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoIcon: {
    fontSize: '1.2rem',
  },
};

export default UserStatsChart;