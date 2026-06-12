import mongoose from 'mongoose';

const SceneSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  profileName: {
    type: String,
    required: true,
  },
  sceneItems: {
    type: Array,
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  // Explicitly ensures fields not strictly matching won't throw blockages
  strict: true 
});

// Avoid compiling index configuration issues if the model is reloaded dynamically
if (!mongoose.models.Scene) {
  SceneSchema.index({ userEmail: 1, profileName: 1 }, { unique: true });
}

// 🚀 CRITICAL FIX: Delete old cached model definition to force Mongoose to rebuild with profileName
delete mongoose.models.Scene;

export default mongoose.model('Scene', SceneSchema);