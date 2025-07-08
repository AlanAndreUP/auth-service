import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_service';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Eventos de conexión
    mongoose.connection.on('error', (error) => {
      console.error('❌ Error de conexión MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB desconectado');
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
} 