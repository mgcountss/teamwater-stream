function updateCountdown() {
  const countdown = document.querySelector('.countdown');
  const targetDate = new Date('2025-09-01T04:00:00Z');
  const now = new Date();
  const diff = targetDate - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdown.textContent = `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

const goalEl = document.getElementById('goal');
const minEl = document.getElementById('rateMin');
const hourEl = document.getElementById('rateHour');

const etaEl = document.getElementById('eta');

let countHistory = [];

function updateCounter() {
  fetch('http://localhost:8080/count')
    .then(res => res.json())
    .then(data => {
      const count = data.count;
      const now = Date.now();
      countHistory.push({ timestamp: now, count });

      // Keep history for 2 hours
      countHistory = countHistory.filter(entry => now - entry.timestamp <= 2 * 60 * 60 * 1000);

      const earliest = countHistory[0];
      if (!earliest || earliest.timestamp === now) return;

      const timeElapsedSec = (now - earliest.timestamp) / 1000;
      const countDelta = count - earliest.count;

      const ratePerSecond = countDelta / timeElapsedSec;
      const ratePerMinute = ratePerSecond * 60;
      const ratePerHour = ratePerSecond * 3600;

      minEl.textContent = Math.floor(ratePerMinute).toLocaleString();
      hourEl.textContent = Math.floor(ratePerHour).toLocaleString();

      // Estimate time to 40 million
      const target = 40_000_000;
      if (ratePerSecond > 0 && count < target) {
        const secondsToTarget = (target - count) / ratePerSecond;
        const eta = new Date(now + secondsToTarget * 1000);

        // Format countdown
        const etaDiff = eta - now;
        const etaDays = Math.floor(etaDiff / (1000 * 60 * 60 * 24));
        const etaHours = Math.floor((etaDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const etaMinutes = Math.floor((etaDiff % (1000 * 60 * 60)) / (1000 * 60));
        const etaSeconds = Math.floor((etaDiff % (1000 * 60)) / 1000);

        etaEl.textContent = `${etaDays}d ${etaHours}h ${etaMinutes}m ${etaSeconds}s (${eta.toLocaleString()})`;
      } else {
        etaEl.textContent = "N/A";
      }
    });
}

setInterval(updateCounter, 2000);
updateCounter();