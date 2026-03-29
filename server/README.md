# Obsidian Lens - Backend Server

## Setup

### 1. Install MongoDB (Local)

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# For local MongoDB without authentication (default):
MONGO_URI=mongodb://localhost:27017/

# For local MongoDB with authentication:
# MONGO_URI=mongodb://username:password@localhost:27017/photoshop?authSource=admin

# Database Configuration
MONGO_DB_NAME=Photoshop
MONGO_COLLECTION_NAME=logs
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Server

```bash
python server.py
```

Server will start on `http://localhost:5000`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/` | MongoDB connection URI |
| `MONGO_DB_NAME` | `Photoshop` | Database name |
| `MONGO_COLLECTION_NAME` | `logs` | Collection name for logs |

## Switching to MongoDB Atlas (Cloud)

To use MongoDB Atlas instead of local MongoDB:

1. Get your Atlas connection string from MongoDB Atlas dashboard
2. Update `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/photoshop?retryWrites=true&w=majority
   ```

## API Endpoints

- `POST /adjust` - Apply image adjustments (exposure, contrast, highlights, shadows)
- `POST /filter` - Apply filters (grayscale, sepia, blur, etc.)
- `POST /crop` - Crop images
- `POST /rotate` - Rotate images
- `POST /flip` - Flip images horizontally/vertically

All endpoints log operations to MongoDB for analytics.
