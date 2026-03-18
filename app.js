async function loadDashboard() {
  const res = await fetch('./data/results.json', { cache: 'no-store' });
  const data = await res.json();

  const updated = document.getElementById('updated');
  updated.textContent = `Last updated: ${new Date(data.generatedAt).toLocaleString()}`;

  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = '';
  data.leaderboard.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.Rank ?? ''}</td>
      <td>${row.Name ?? ''}</td>
      <td>${row.Points ?? ''}</td>
      <td>${row.CorrectPicks ?? ''}</td>
    `;
    tbody.appendChild(tr);
  });

  const picksGrid = document.getElementById('picksGrid');
  picksGrid.innerHTML = '';
  data.leaderboard.forEach(row => {
    const card = document.createElement('div');
    card.className = 'pick-card';
    card.innerHTML = `
      <h3>${row.Name ?? ''}</h3>
      <p><strong>Points:</strong> ${row.Points ?? 0}</p>
      <p><strong>Correct:</strong> ${row.CorrectPicks ?? 0}</p>
      <p><strong>Picks:</strong></p>
      <ul>
        ${(String(row.Picks || '')
          .split(',')
          .map(p => `<li>${p.trim()}</li>`)
          .join(''))}
      </ul>
    `;
    picksGrid.appendChild(card);
  });
}

loadDashboard().catch(err => {
  console.error(err);
  document.getElementById('updated').textContent = 'Failed to load dashboard data.';
});