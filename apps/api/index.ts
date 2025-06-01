import express from 'express';

const app = express();

app.post('/api/v1/website', (req, res) => { });

app.get('/api/v1/status/:id', (req, res) => { });

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port 3000');
});