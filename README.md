# BetterStack

BetterStack is a web application that allows you to monitor the uptime and response time of your websites. It provides a simple and intuitive interface for managing your websites and tracking their performance.

## Features

- Monitor multiple websites
- Track uptime and response time
- View website statistics
- Add and manage websites
- Customize the dashboard layout
- Supports multiple regions

## Getting Started

To get started with BetterStack, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/chayan/betterstack.git
```

2. Install dependencies:

```bash
cd betterstack
npm install
```

3. Create a `.env` file in the root directory and add the following variables:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/betterstack
JWT_SECRET=your_secret_key
REGION_NAME=us-east
WORKER_ID=1
```

Replace `DATABASE_URL` with the connection string to your PostgreSQL database. Replace `JWT_SECRET` with a secret key for your application. Replace `REGION_NAME` with the name of the region you want to monitor. Replace `WORKER_ID` with a unique identifier for your worker.

4. Start the application:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000` to access the dashboard.

## Contributing

Contributions are welcome! If you have any suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.