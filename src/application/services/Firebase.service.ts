import admin from 'firebase-admin';

export interface FirebaseUserInfo {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
}

export class FirebaseService {
  private static instance: FirebaseService;
  private isInitialized = false;

  private constructor() {
    this.initializeFirebase();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private initializeFirebase(): void {
    try {
      // Verificar si Firebase ya está inicializado
      if (admin.apps.length === 0) {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const projectId = process.env.FIREBASE_PROJECT_ID;

        if (serviceAccountKey && projectId) {
          // Inicializar con service account key
          const serviceAccount = JSON.parse(serviceAccountKey);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: projectId
          });
        } else if (projectId) {
          // Inicializar solo con project ID (para entornos con Application Default Credentials)
          admin.initializeApp({
            projectId: projectId
          });
        } else {
          console.warn('⚠️ Firebase no está configurado. Variables de entorno FIREBASE_PROJECT_ID requerida.');
          return;
        }
      }

      this.isInitialized = true;
      console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Firebase Admin:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Verifica y decodifica un token de ID de Firebase
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.isInitialized) {
      throw new Error('Firebase no está inicializado');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verificando token de Firebase:', error);
      throw new Error('Token de Firebase inválido');
    }
  }

  /**
   * Obtiene información detallada del usuario por UID
   */
  async getUserInfo(uid: string): Promise<FirebaseUserInfo> {
    if (!this.isInitialized) {
      throw new Error('Firebase no está inicializado');
    }

    try {
      const userRecord = await admin.auth().getUser(uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email || '',
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        phoneNumber: userRecord.phoneNumber,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };
    } catch (error) {
      console.error('Error obteniendo información del usuario:', error);
      throw new Error('Usuario no encontrado en Firebase');
    }
  }

  /**
   * Verifica si un email existe en Firebase Auth
   */
  async getUserByEmail(email: string): Promise<FirebaseUserInfo | null> {
    if (!this.isInitialized) {
      throw new Error('Firebase no está inicializado');
    }

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email || '',
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        phoneNumber: userRecord.phoneNumber,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('no user record')) {
        return null;
      }
      console.error('Error obteniendo usuario por email:', error);
      throw new Error('Error al buscar usuario en Firebase');
    }
  }

  /**
   * Valida si Firebase está disponible
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene el proyecto ID configurado
   */
  getProjectId(): string | undefined {
    if (!this.isInitialized) {
      return undefined;
    }
    return admin.app().options.projectId;
  }
} 