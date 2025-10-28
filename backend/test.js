try {
  console.log('Testing imports...');
  import('./server.js').then(() => {
    console.log('Server import successful');
  }).catch(e => {
    console.error('Server import failed:', e.message);
  });
} catch (e) {
  console.error('Test failed:', e.message);
}
