# Sara-ServerSide

## Project Overview
Sara-ServerSide is a backend server application designed to manage and serve data for the Sara Games platform. It provides APIs for user authentication, game data retrieval, and other essential functionalities required by the Sara Games client applications.

## Setup Requirements

To set up the Sara-ServerSide project, ensure you have the following installed on your system:
- Node.js (v14.x or later)
- npm (v6.x or later)

## Setup Procedure

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yourusername/Sara-ServerSide.git
    cd Sara-ServerSide
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Install nodemon globally (if not already installed):**
    ```sh
    npm install -g nodemon
    ```

4. **Set up environment variables:**
    Create a `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for the required variables. Example:
    ```env
    PORT=YOur_port 
    MONGODB_URI=Your_mongodb
    JWT_SECRET=Your_secretKey
    ```

5. **Start the server:**
    ```sh
    npm start
    ```

    Alternatively, you can use nodemon to automatically restart the server on file changes:
    ```sh
    nodemon start
    ```

6. **Access the server:**
    The server will be running at `http://localhost:8000` by default.

## Additional Information

For more details on the API endpoints and usage, refer to the [API Documentation](./API_DOCUMENTATION.md).
