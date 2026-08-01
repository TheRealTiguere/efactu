(function() {
  const token = sessionStorage.getItem('efactu_admin_token');
  if (!token) {
    // Hide body instantly to avoid layout flash
    document.documentElement.style.display = 'none';
    window.location.replace('/admin-login.html');
  }
})();
