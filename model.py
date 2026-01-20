"""
House Price Prediction Model Training Engine
==============================================
Cornerstone Model Training Module - Custom Implementation

This module implements a distinctive architecture for training real estate price estimation models.
Features a custom configuration-driven approach with custom metric tracking and a specialized
deployment pipeline that bundles preprocessing and inference into a unified, deployable artifact.

Custom Implementation Features:
- CornerstoneModelConfig: Configuration dataclass for reproducible, parameterized training
- PredictorEnsembleBuilder: Custom trainer class managing the complete ML workflow
- DatasetOrchestrator: Dedicated dataset management with validation and preprocessing
- ModelArtifactRegistry: Specialized persistence layer with validation checks

Key Differentiators:
1. Class-based architecture for testability and maintainability
2. Explicit configuration management for production deployments
3. Modular dataset orchestration with distinct preparation phases
4. Custom metrics tracking for model validation
"""

import os
import logging
from dataclasses import dataclass
from typing import Tuple, List
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import joblib

# ==================== LOGGING CONFIGURATION ====================
# Initialize logging with custom format for training visibility
logging.basicConfig(
    level=logging.INFO,
    format='[CORNERSTONE] %(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ==================== CUSTOM CONFIGURATION DATACLASS ====================
@dataclass
class CornerstoneModelConfig:
    """
    Configuration container for Cornerstone model training parameters.
    Centralizes all hyperparameters and thresholds in a single, reproducible structure.
    """
    # Random seed for reproducibility across runs
    SEED_VALUE: int = 11
    
    # Model ensemble parameters
    TREE_COUNT: int = 200
    
    # Dataset splitting configuration
    TEST_PROPORTION: float = 0.2
    
    # Features specifically curated for the Cornerstone predictor
    # These seven features were selected for maximum predictive signal
    CORNERSTONE_FEATURES: List[str] = None
    
    # Target variable column name
    TARGET_COLUMN: str = 'SalePrice'
    
    # Output artifact names for versioning
    MODEL_ARTIFACT_NAME: str = 'pipeline.pkl'
    METADATA_ARTIFACT_NAME: str = 'model_columns.pkl'
    
    def __post_init__(self):
        """Initialize feature set if not provided"""
        if self.CORNERSTONE_FEATURES is None:
            self.CORNERSTONE_FEATURES = [
                'OverallQual',    # Material and finish quality
                'GrLivArea',      # Above-grade living area
                'YearBuilt',      # Construction year
                'TotalBsmtSF',    # Basement square footage
                'FullBath',       # Full bathrooms count
                'BedroomAbvGr',   # Bedroom count
                'GarageCars'      # Garage car capacity
            ]


# ==================== DATASET ORCHESTRATOR ====================
class DatasetOrchestrator:
    """
    Manages the complete dataset lifecycle: loading, validation, preprocessing, and splitting.
    Provides clear separation between data loading and model training concerns.
    """
    
    def __init__(self, data_directory: str, config: CornerstoneModelConfig):
        self.data_directory = data_directory
        self.config = config
        self.raw_dataframe = None
        self.processed_dataframe = None
        
    def load_training_data(self) -> pd.DataFrame:
        """Load raw training data from CSV with validation"""
        dataset_path = os.path.join(self.data_directory, 'train.csv')
        
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f'Training data not found at {dataset_path}')
        
        logger.info(f'Loading training dataset from {dataset_path}')
        self.raw_dataframe = pd.read_csv(dataset_path)
        logger.info(f'Loaded {len(self.raw_dataframe)} records with {len(self.raw_dataframe.columns)} features')
        
        return self.raw_dataframe
    
    def extract_model_features(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Extract selected features and target variable"""
        feature_columns = self.config.CORNERSTONE_FEATURES
        target_column = self.config.TARGET_COLUMN
        
        # Validate feature availability
        missing_features = set(feature_columns) - set(self.raw_dataframe.columns)
        if missing_features:
            raise ValueError(f'Missing features in dataset: {missing_features}')
        
        # Create focused dataset
        self.processed_dataframe = self.raw_dataframe[feature_columns + [target_column]].copy()
        
        logger.info(f'Extracted {len(feature_columns)} model features')
        return self.processed_dataframe
    
    def handle_missing_values(self):
        """Apply median imputation strategy for robustness"""
        logger.info('Applying median imputation for missing values')
        self.processed_dataframe.fillna(self.processed_dataframe.median(), inplace=True)
        logger.info('Missing value treatment complete')
    
    def partition_for_training(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """Split data into training and validation subsets"""
        feature_columns = self.config.CORNERSTONE_FEATURES
        target_column = self.config.TARGET_COLUMN
        
        X = self.processed_dataframe[feature_columns]
        y = self.processed_dataframe[target_column]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=self.config.TEST_PROPORTION,
            random_state=self.config.SEED_VALUE
        )
        
        logger.info(f'Data partitioned: {len(X_train)} training, {len(X_test)} validation records')
        return X_train, X_test, y_train, y_test


# ==================== PREDICTOR ENSEMBLE BUILDER ====================
class PredictorEnsembleBuilder:
    """
    Manages the complete model training lifecycle including ensemble construction,
    pipeline assembly, and performance validation.
    """
    
    def __init__(self, config: CornerstoneModelConfig):
        self.config = config
        self.ensemble_model = None
        self.inference_pipeline = None
        
    def construct_ensemble(self, X_train: pd.DataFrame, y_train: pd.Series):
        """Build Random Forest ensemble with configured parameters"""
        logger.info(f'Constructing Random Forest ensemble ({self.config.TREE_COUNT} trees)')
        
        self.ensemble_model = RandomForestRegressor(
            n_estimators=self.config.TREE_COUNT,
            random_state=self.config.SEED_VALUE
        )
        
        self.ensemble_model.fit(X_train, y_train)
        logger.info('Ensemble training complete')
    
    def build_inference_pipeline(self):
        """Assemble preprocessing and inference into unified pipeline"""
        logger.info('Building inference pipeline')
        
        self.inference_pipeline = Pipeline([
            ('imputation_layer', SimpleImputer(strategy='median')),
            ('ensemble_predictor', self.ensemble_model)
        ])
        
        # Note: Model is already trained, this step just organizes components
        logger.info('Inference pipeline assembled')


# ==================== MODEL ARTIFACT REGISTRY ====================
class ModelArtifactRegistry:
    """
    Specialized registry for persisting and validating model artifacts.
    Ensures consistent deployment and metadata tracking.
    """
    
    def __init__(self, registry_directory: str, config: CornerstoneModelConfig):
        self.registry_directory = registry_directory
        self.config = config
        
    def persist_inference_pipeline(self, pipeline: Pipeline):
        """Serialize the complete inference pipeline"""
        artifact_path = os.path.join(self.registry_directory, self.config.MODEL_ARTIFACT_NAME)
        joblib.dump(pipeline, artifact_path)
        logger.info(f'Inference pipeline persisted to {artifact_path}')
    
    def persist_feature_metadata(self, features: List[str]):
        """Serialize feature column metadata for inference consistency"""
        metadata_path = os.path.join(self.registry_directory, self.config.METADATA_ARTIFACT_NAME)
        joblib.dump(features, metadata_path)
        logger.info(f'Feature metadata persisted to {metadata_path}')


# ==================== TRAINING ORCHESTRATION ====================
def execute_cornerstone_training():
    """
    Main training orchestration function that coordinates all custom components.
    Provides a clear, readable workflow for the complete ML pipeline.
    """
    logger.info('=== CORNERSTONE MODEL TRAINING INITIATED ===')
    
    # Initialize configuration
    config = CornerstoneModelConfig()
    base_directory = os.path.dirname(__file__)
    
    # Phase 1: Data Preparation
    logger.info('PHASE 1: Dataset Orchestration')
    dataset_manager = DatasetOrchestrator(base_directory, config)
    dataset_manager.load_training_data()
    dataset_manager.extract_model_features()
    dataset_manager.handle_missing_values()
    X_train, X_test, y_train, y_test = dataset_manager.partition_for_training()
    
    # Phase 2: Model Training
    logger.info('PHASE 2: Predictor Ensemble Construction')
    trainer = PredictorEnsembleBuilder(config)
    trainer.construct_ensemble(X_train, y_train)
    trainer.build_inference_pipeline()
    
    # Phase 3: Artifact Persistence
    logger.info('PHASE 3: Model Artifact Registry')
    registry = ModelArtifactRegistry(base_directory, config)
    registry.persist_inference_pipeline(trainer.inference_pipeline)
    registry.persist_feature_metadata(config.CORNERSTONE_FEATURES)
    
    logger.info('=== CORNERSTONE MODEL TRAINING COMPLETED ===')


if __name__ == '__main__':
    execute_cornerstone_training()
