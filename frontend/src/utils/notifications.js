export function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendWeatherAlert(title, message, level = 'info') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  const icons = {
    info: '🌧️',
    warning: '⚠️',
    severe: '🚨',
  };
  const icon = icons[level] || '🌧️';
  try {
    new Notification(`${icon} ${title}`, {
      body: message,
      icon: '/favicon.ico',
    });
  } catch (e) {
    // Notification error fallback
  }
}
