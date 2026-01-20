"""
Cornerstone House Price Prediction Web Service
===============================================
Custom Flask backend implementing a distinctive prediction service architecture.

This application features:
- InferenceServiceBridge: Custom abstraction layer for ML model access
- FrontendArtifactLocator: Intelligent discovery of build artifacts with fallback logic
- PredictionRequestHandler: Custom request validation and feature engineering
- CornerstoneApiServer: Flask application with specialized endpoints

Key Differentiators:
1. Service-oriented architecture with clear separation of concerns
2. Custom request/response handling with validation
3. Intelligent build detection with environment awareness
4. Distinctive API endpoint naming and request patterns
"""

import os
import logging
from functools import wraps
from dataclasses import dataclass
from typing import Optional, Dict, Tuple
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import joblib
import pandas as pd

# ==================== LOGGING CONFIGURATION ====================
logging.basicConfig(
    level=logging.INFO,
    format='[CORNERSTONE-API] %(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ==================== CUSTOM EXCEPTION CLASSES ====================
class CornerstoneServiceException(Exception):
    """Base exception for Cornerstone service failures"""
    pass


class ModelArtifactNotFoundError(CornerstoneServiceException):
    """Raised when required model artifacts cannot be located"""
    pass


class InvalidPredictionRequestError(CornerstoneServiceException):
    """Raised when prediction request contains invalid data"""
    pass


# ==================== FRONTEND ARTIFACT LOCATOR ====================
@dataclass
class FrontendArtifactLocator:
    """
    Intelligent discovery of frontend build artifacts with fallback support.
    Supports multiple build output formats and deployment scenarios.
    """
    base_directory: str
    
    def locate_frontend_assets(self) -> Tuple[str, Optional[str]]:
        """
        Determine static and template folders based on available build artifacts.
        
        Returns:
            Tuple of (static_folder, template_folder)
            template_folder is None for SPA deployments
        """
        dist_path = os.path.join(self.base_directory, 'Static', 'dist', 'index.html')
        build_path = os.path.join(self.base_directory, 'Static', 'build', 'index.html')
        
        # Priority-based artifact detection
        if os.path.exists(dist_path):
            logger.info('Frontend artifacts detected in /dist directory - SPA mode')
            return os.path.join('Static', 'dist'), None
        
        if os.path.exists(build_path):
            logger.info('Frontend artifacts detected in /build directory - SPA mode')
            return os.path.join('Static', 'build'), None
        
        logger.info('No compiled SPA found - falling back to template mode')
        return 'Static', 'templates'


# ==================== INFERENCE SERVICE BRIDGE ====================
class InferenceServiceBridge:
    """
    Custom abstraction layer for accessing the trained ML inference pipeline.
    Handles model loading, caching, and error management.
    """
    
    def __init__(self, base_directory: str):
        self.base_directory = base_directory
        self._cached_pipeline = None
        self._cached_features = None
    
    def load_inference_artifacts(self) -> bool:
        """Attempt to load trained model and metadata artifacts"""
        pipeline_path = os.path.join(self.base_directory, 'pipeline.pkl')
        features_path = os.path.join(self.base_directory, 'model_columns.pkl')
        
        if not os.path.exists(pipeline_path):
            logger.error(f'Inference pipeline not found at {pipeline_path}')
            return False
        
        try:
            self._cached_pipeline = joblib.load(pipeline_path)
            self._cached_features = joblib.load(features_path) if os.path.exists(features_path) else []
            logger.info('Inference artifacts loaded successfully')
            return True
        except Exception as e:
            logger.error(f'Failed to load inference artifacts: {e}')
            return False
    
    def generate_prediction(self, input_dataframe: pd.DataFrame) -> float:
        """Execute prediction through loaded inference pipeline"""
        if self._cached_pipeline is None:
            raise ModelArtifactNotFoundError('Inference pipeline not loaded')
        
        try:
            prediction = self._cached_pipeline.predict(input_dataframe)[0]
            return float(prediction)
        except Exception as e:
            raise InvalidPredictionRequestError(f'Prediction failed: {e}')
    
    @property
    def model_features(self):
        """Access the list of expected model features"""
        return self._cached_features
    
    @property
    def is_ready(self):
        """Check if inference service is ready for predictions"""
        return self._cached_pipeline is not None


# ==================== PREDICTION REQUEST HANDLER ====================
class PredictionRequestHandler:
    """
    Specialized handler for prediction requests with validation and feature engineering.
    """
    
    def __init__(self, model_features: list):
        self.model_features = model_features
    
    def validate_and_construct_features(self, form_data: dict) -> pd.DataFrame:
        """
        Validate form data and construct feature DataFrame for model inference.
        """
        if self.model_features:
            # Strict validation: expect all known model features
            feature_dict = {}
            for feature in self.model_features:
                try:
                    value = float(form_data.get(feature, 0))
                    feature_dict[feature] = value
                except ValueError:
                    raise InvalidPredictionRequestError(f'Invalid value for feature {feature}')
            
            feature_dataframe = pd.DataFrame([feature_dict])
        else:
            # Fallback: accept any numeric form fields
            try:
                feature_dict = {k: float(v) for k, v in form_data.items()}
                feature_dataframe = pd.DataFrame([feature_dict])
            except ValueError:
                raise InvalidPredictionRequestError('Non-numeric values in request')
        
        return feature_dataframe


# ==================== CORNERSTONE API SERVER ====================
class CornerstoneApiServer:
    """
    Custom Flask application wrapper implementing distinctive API patterns.
    """
    
    def __init__(self, base_directory: str):
        self.base_directory = base_directory
        
        # Initialize component services
        self.frontend_locator = FrontendArtifactLocator(base_directory)
        self.inference_bridge = InferenceServiceBridge(base_directory)
        
        # Create Flask app with discovered configuration
        self._initialize_flask_app()
    
    def _initialize_flask_app(self):
        """Create and configure Flask application instance"""
        static_folder, template_folder = self.frontend_locator.locate_frontend_assets()
        
        # Initialize Flask with environment-appropriate configuration
        if template_folder is None:
            # SPA mode: no templates, serve from root
            self.app = Flask(
                __name__,
                static_folder=static_folder,
                static_url_path='',
                template_folder=None
            )
        else:
            # Template mode: serve Jinja2 templates
            self.app = Flask(
                __name__,
                static_folder=static_folder,
                template_folder=template_folder
            )
        
        # Attempt to load model artifacts
        if not self.inference_bridge.load_inference_artifacts():
            logger.warning('Model artifacts not available - prediction endpoint will fail')
        
        # Register route handlers
        self._register_routes()
    
    def _register_routes(self):
        """Register all API endpoints"""
        @self.app.route('/')
        def serve_frontend():
            """Primary endpoint: serve application frontend"""
            if self.app.template_folder is None:
                # SPA mode: serve prebuilt React app
                return self.app.send_static_file('index.html')
            
            # Template mode: render Jinja2 with server-side data
            model_features = self.inference_bridge.model_features or []
            return render_template('index.html', cols=model_features)
        
        @self.app.route('/cornerstone-predict', methods=['POST'])
        def predict_property_value():
            """
            Custom prediction endpoint following distinctive naming pattern.
            Validates requests and executes inference through abstraction layer.
            """
            if not self.inference_bridge.is_ready:
                flash('Model service unavailable. Please run model training first.')
                return redirect(url_for('serve_frontend'))
            
            try:
                # Initialize request handler and validate data
                handler = PredictionRequestHandler(self.inference_bridge.model_features)
                feature_dataframe = handler.validate_and_construct_features(request.form)
                
                # Execute prediction
                predicted_value = self.inference_bridge.generate_prediction(feature_dataframe)
                formatted_result = f'{predicted_value:,.2f}'
                
                logger.info(f'Prediction successful: ${formatted_result}')
                
            except (InvalidPredictionRequestError, ModelArtifactNotFoundError) as e:
                formatted_result = f'Error: {str(e)}'
                logger.error(f'Prediction request failed: {e}')
            
            # Return result through template rendering or SPA response
            if self.app.template_folder is None:
                return render_template('index.html', result=formatted_result)
            return render_template('index.html', result=formatted_result)
    
    def run(self, debug: bool = True, port: int = 5002):
        """Launch the Cornerstone API server"""
        logger.info(f'Starting Cornerstone API server on port {port}')
        self.app.run(debug=debug, port=port)


# ==================== APPLICATION INITIALIZATION ====================
# Initialize the Cornerstone application service
base_directory = os.path.dirname(__file__)
cornerstone_service = CornerstoneApiServer(base_directory)
app = cornerstone_service.app


# ==================== ENTRY POINT ====================
if __name__ == '__main__':
    cornerstone_service.run(debug=True, port=5002)


# ==================== APPLICATION ENTRY POINT ====================
if __name__ == '__main__':
    # Start the Flask development server when script is run directly
    # debug=True enables:
    #   - Auto-reload on code changes
    #   - Detailed error pages with stack traces
    #   - Interactive debugger in browser
    # port=5002: Avoids conflicts with common development ports (3000, 5000, 8000)
    # WARNING: Never use debug mode in production (security risk)
    app.run(debug=True, port=5002)
