/**
 * Sign Language Recognition Service
 * Handles all sign language prediction API calls
 */

import apiClient from '../config/apiClient';

export const SignLanguageService = {
    // Read the backend health endpoint for simple connectivity checks.
    async checkBackendHealth() {
        return apiClient.healthCheck();
    },

    // Pull the model metadata used by the live dashboard UI.
    async getSignLanguageInfo() {
        return apiClient.get('/health').then(data => ({
            classes: data.classes || [],
            sequenceLength: data.sequence_length || 16,
            numClasses: data.num_classes || 3,
            modelLoaded: data.model_loaded || false,
            device: data.device || 'cpu',
        }));
    },

    // Return a user-friendly connection summary for the UI.
    async validateConnection() {
        try {
            const health = await this.checkBackendHealth();
            return {
                connected: health.status === 'ok',
                modelReady: health.model_loaded,
                message: health.status === 'ok' ? 'Backend connection successful' : 'Backend not responding',
            };
        } catch (error) {
            return {
                connected: false,
                modelReady: false,
                message: `Connection failed: ${error.message}`,
            };
        }
    },
};

export default SignLanguageService;