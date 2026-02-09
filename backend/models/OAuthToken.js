import mongoose from 'mongoose';

const oauthTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['eventbrite'], required: true },
    accessToken: { type: String, required: true },
  },
  { timestamps: true }
);

oauthTokenSchema.index({ userId: 1, provider: 1 }, { unique: true });

export default mongoose.model('OAuthToken', oauthTokenSchema);
