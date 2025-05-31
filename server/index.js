const express = require('express');
const analysisRoutes = require('./src/routes/analysis.routes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Register routes
app.use('/', analysisRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
});
