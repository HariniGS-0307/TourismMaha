try {
  const response = await fetch('http://localhost:3000/');
  console.log('STATUS ' + response.status);
} catch (error) {
  console.error(error);
  process.exit(1);
}
