import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config();

// Import routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from client dist folder
app.use(express.static('../client/dist'));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect the routes
app.use(routes);

// Error handling middleware with explicit typing
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Error) {
      console.error(err.stack);
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
