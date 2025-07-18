import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (isConnected) {
        console.log('MongoDB has made a connection already.');
        return;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error('MONGODB_URI is not defined in environment variables.'); // Log error
        throw new Error('MONGODB_URI is not defined in environment variables.'); // Throw to signal failure
    }

    try {
        console.log('Attempting to connect to MongoDB...'); // Add log before attempt
        await mongoose.connect(mongoUri, {
            dbName: "alexservice",
        });
        isConnected = true;
        console.log('MongoDB connected successfully.'); // More specific success message
    } catch (error) {
        console.error('MongoDB connection error:', error); // Log the specific error
        throw error;
    }
};