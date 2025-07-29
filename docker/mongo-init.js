// MongoDB initialization script for TrackMania Scoreboard
db = db.getSiblingDB('trackmania-scoreboard');

// Create collections
db.createCollection('users');
db.createCollection('tracks');
db.createCollection('scores');
db.createCollection('notifications');

// Insert demo users
db.users.insertMany([
  {
    _id: ObjectId(),
    username: 'SpeedDemon',
    email: 'speed@trackmania.com',
    password: '$2b$10$rX8i7nDwxgVj4vK5mN7.qOYqN5gH3mJ9oP2xS7vL4wA1eE8fR6tTu', // password123 (hashed)
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    username: 'RaceKing',
    email: 'race@trackmania.com',
    password: '$2b$10$rX8i7nDwxgVj4vK5mN7.qOYqN5gH3mJ9oP2xS7vL4wA1eE8fR6tTu', // password123 (hashed)
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert demo tracks
db.tracks.insertMany([
  {
    _id: ObjectId(),
    name: 'Stadium A01',
    author: 'Nadeo',
    environment: 'Stadium',
    difficulty: 'Beginner',
    authorTime: 45230,
    goldTime: 47000,
    silverTime: 50000,
    bronzeTime: 55000,
    mapType: 'Campaign',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Weekly Challenge #42',
    author: 'RoadToNadeo',
    environment: 'Canyon',
    difficulty: 'Advanced',
    authorTime: 78450,
    goldTime: 82000,
    silverTime: 88000,
    bronzeTime: 95000,
    mapType: 'Weekly',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    name: 'Desert Storm',
    author: 'SpeedBuilder',
    environment: 'Desert',
    difficulty: 'Expert',
    authorTime: 120000,
    goldTime: 125000,
    silverTime: 135000,
    bronzeTime: 150000,
    mapType: 'Campaign',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.tracks.createIndex({ mapType: 1, isActive: 1 });
db.tracks.createIndex({ environment: 1 });
db.scores.createIndex({ trackId: 1, time: 1 });
db.scores.createIndex({ userId: 1, trackId: 1 });
db.notifications.createIndex({ userId: 1, createdAt: -1 });

print('✅ MongoDB initialized with demo data');
print('👤 Demo users: SpeedDemon, RaceKing (password: password123)');
print('🏁 Demo tracks: Stadium A01, Weekly Challenge #42, Desert Storm');
print('📊 Indexes created for optimal performance'); 